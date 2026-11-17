import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { createRazorpayPlan, RazorpayApiError } from "@/lib/razorpay-subscriptions";

const planSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(500).default(""),
  amountRupees: z.number().finite().min(1).max(1_000_000),
  totalCycles: z.number().int().min(1).max(1200),
});

export async function GET() {
  const auth = await requireAdmin(["SUPER_ADMIN", "ADMIN", "FINANCE_ADMIN"]);
  if (auth.error) return auth.error;
  try {
    const [plans, subscriptions] = await Promise.all([
      prisma.monthlyGivingPlan.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.monthlySubscription.findMany({
        include: {
          user: { select: { name: true, email: true } },
          plan: { select: { name: true, totalCycles: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 500,
      }),
    ]);
    return NextResponse.json({ success: true, plans, subscriptions });
  } catch (error) {
    console.error("Could not load admin monthly giving data:", error);
    return NextResponse.json({ success: false, error: { message: "Could not load monthly giving data." } }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(["SUPER_ADMIN", "ADMIN", "FINANCE_ADMIN"]);
  if (auth.error) return auth.error;
  const parsed = planSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ success: false, error: { message: "Enter a name, amount of at least ₹1, and a duration from 1 to 1,200 monthly payments." } }, { status: 400 });

  const id = randomUUID();
  const amountPaise = Math.round(parsed.data.amountRupees * 100);
  if (!Number.isSafeInteger(amountPaise)) return NextResponse.json({ success: false, error: { message: "Enter a valid amount." } }, { status: 400 });
  try {
    const plan = await prisma.monthlyGivingPlan.create({
      data: {
        id,
        gatewayPlanId: `pending_${id}`,
        name: parsed.data.name,
        description: parsed.data.description || null,
        amountPaise,
        totalCycles: parsed.data.totalCycles,
      },
    });
    try {
      const external = await createRazorpayPlan({
        name: plan.name,
        description: plan.description ?? "",
        amountPaise,
        localPlanId: plan.id,
      });
      const saved = await prisma.monthlyGivingPlan.update({ where: { id }, data: { gatewayPlanId: external.id } });
      return NextResponse.json({ success: true, plan: saved }, { status: 201 });
    } catch (error) {
      await prisma.monthlyGivingPlan.delete({ where: { id } }).catch(() => undefined);
      if (error instanceof RazorpayApiError) {
        return NextResponse.json({ success: false, error: { code: "RAZORPAY_ERROR", message: error.message } }, { status: error.status === 503 ? 503 : 502 });
      }
      console.error("Could not create Razorpay plan:", error);
      return NextResponse.json({ success: false, error: { message: "Could not create the Razorpay plan." } }, { status: 502 });
    }
  } catch (error) {
    console.error("Could not create monthly giving plan:", error);
    return NextResponse.json({ success: false, error: { message: "Could not create the monthly giving plan." } }, { status: 500 });
  }
}
