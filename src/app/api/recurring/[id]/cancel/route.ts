import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { requireAdmin } from "@/lib/require-admin";
import { cancelRazorpaySubscription, fromUnixSeconds, mapRazorpaySubscriptionStatus, RazorpayApiError } from "@/lib/razorpay-subscriptions";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  let allowed = Boolean(userId);
  if (!allowed) {
    const auth = await requireAdmin(["SUPER_ADMIN", "ADMIN", "FINANCE_ADMIN"]);
    allowed = !auth.error;
    if (auth.error && auth.error.status !== 401) return auth.error;
  }
  if (!allowed) return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Sign in required." } }, { status: 401 });

  const recurring = await prisma.monthlySubscription.findFirst({
    where: { id, ...(userId ? { userId } : {}) },
  });
  if (!recurring) return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Monthly subscription not found." } }, { status: 404 });
  if (!recurring.gatewaySubscriptionId) return NextResponse.json({ success: false, error: { message: "This subscription is still being set up. Please refresh and try again." } }, { status: 409 });
  if (["CANCELLED", "COMPLETED", "EXPIRED", "FAILED"].includes(recurring.status)) {
    return NextResponse.json({ success: false, error: { message: "This subscription is already inactive." } }, { status: 409 });
  }
  if (recurring.cancelAtCycleEnd) return NextResponse.json({ success: true, recurring });

  const atCycleEnd = ["ACTIVE", "PENDING", "HALTED", "PAUSED"].includes(recurring.status);
  try {
    const external = await cancelRazorpaySubscription(recurring.gatewaySubscriptionId, atCycleEnd);
    const updated = await prisma.monthlySubscription.update({
      where: { id: recurring.id },
      data: {
        status: mapRazorpaySubscriptionStatus(external.status ?? (atCycleEnd ? recurring.status.toLowerCase() : "cancelled")),
        cancelAtCycleEnd: atCycleEnd,
        cancelledAt: atCycleEnd ? null : fromUnixSeconds(external.ended_at) ?? new Date(),
        nextChargeAt: atCycleEnd ? recurring.nextChargeAt : null,
      },
      include: { plan: { select: { name: true, totalCycles: true } } },
    });
    return NextResponse.json({ success: true, recurring: updated });
  } catch (error) {
    if (error instanceof RazorpayApiError) return NextResponse.json({ success: false, error: { message: error.message } }, { status: error.status === 503 ? 503 : 502 });
    console.error("Could not cancel monthly subscription:", error);
    return NextResponse.json({ success: false, error: { message: "Could not cancel this subscription." } }, { status: 502 });
  }
}
