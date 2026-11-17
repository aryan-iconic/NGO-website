import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { createRazorpaySubscription, fromUnixSeconds, mapRazorpaySubscriptionStatus, RazorpayApiError } from "@/lib/razorpay-subscriptions";

const subscribeSchema = z.object({ planId: z.string().uuid() });

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Sign in required." } }, { status: 401 });

  const [user, recurring] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { emailVerifiedAt: true } }),
    prisma.monthlySubscription.findMany({
      where: { userId },
      include: { plan: { select: { name: true, description: true, totalCycles: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  return NextResponse.json({ success: true, enabled: true, verified: Boolean(user?.emailVerifiedAt), recurring });
}

export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Sign in to start monthly giving." } }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.emailVerifiedAt) return NextResponse.json({ success: false, error: { code: "EMAIL_NOT_VERIFIED", message: "Verify your email before starting a monthly donation." } }, { status: 403 });

    const parsed = subscribeSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ success: false, error: { message: "Choose a valid monthly giving plan." } }, { status: 400 });
    const plan = await prisma.monthlyGivingPlan.findFirst({ where: { id: parsed.data.planId, isActive: true } });
    if (!plan) return NextResponse.json({ success: false, error: { message: "This monthly giving plan is not available." } }, { status: 404 });

    const duplicate = await prisma.monthlySubscription.findFirst({
      where: { userId, planId: plan.id, status: { in: ["CREATED", "AUTHENTICATED", "ACTIVE", "PENDING", "HALTED"] } },
      select: { id: true },
    });
    if (duplicate) return NextResponse.json({ success: false, error: { message: "You already have a pending or active subscription for this plan. Manage it from your account." } }, { status: 409 });

    const local = await prisma.monthlySubscription.create({
      data: { userId, planId: plan.id, amountPaise: plan.amountPaise, status: "CREATING" },
    });
    try {
      const external = await createRazorpaySubscription({
        gatewayPlanId: plan.gatewayPlanId,
        totalCycles: plan.totalCycles,
        localSubscriptionId: local.id,
      });
      if (!external.id || !external.short_url) throw new Error("Razorpay returned no subscription link.");
      const recurring = await prisma.monthlySubscription.update({
        where: { id: local.id },
        data: {
          gatewaySubscriptionId: external.id,
          status: mapRazorpaySubscriptionStatus(external.status),
          shortUrl: external.short_url,
          nextChargeAt: fromUnixSeconds(external.charge_at),
        },
        include: { plan: { select: { name: true, totalCycles: true } } },
      });
      return NextResponse.json({ success: true, recurring, checkoutUrl: external.short_url });
    } catch (error) {
      await prisma.monthlySubscription.update({ where: { id: local.id }, data: { status: "FAILED" } });
      if (error instanceof RazorpayApiError) {
        const status = error.status === 503 ? 503 : 502;
        return NextResponse.json({ success: false, error: { code: "RAZORPAY_ERROR", message: error.message } }, { status });
      }
      console.error("Could not create Razorpay subscription:", error);
      return NextResponse.json({ success: false, error: { code: "SUBSCRIPTION_CREATE_FAILED", message: "Could not start the subscription. Please try again." } }, { status: 502 });
    }
  } catch (error) {
    console.error("Monthly subscription creation failed:", error);
    return NextResponse.json({ success: false, error: { message: "Could not start monthly giving." } }, { status: 500 });
  }
}
