import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { clearUserSession, getCurrentUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { prisma } from "@/lib/prisma";
import { cancelRazorpaySubscription, RazorpayApiError } from "@/lib/razorpay-subscriptions";

const deleteSchema = z.object({ currentPassword: z.string().min(1), confirmation: z.literal("DELETE") });

export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ success: false, error: { message: "Please sign in again before deleting your account." } }, { status: 401 });
  const parsed = deleteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ success: false, error: { message: "Enter your current password and type DELETE to confirm." } }, { status: 400 });

  const user = await db.findUserById(userId);
  const verified = user && await db.verifyUserPassword(user.email, parsed.data.currentPassword);
  if (!user || !verified || verified.id !== user.id) {
    return NextResponse.json({ success: false, error: { message: "Your current password is incorrect." } }, { status: 400 });
  }

  try {
    const openSubscriptions = await prisma.monthlySubscription.findMany({
      where: { userId, status: { in: ["CREATED", "AUTHENTICATED", "ACTIVE", "PENDING", "HALTED", "PAUSED"] } },
    });
    for (const subscription of openSubscriptions) {
      if (subscription.cancelAtCycleEnd) continue;
      if (!subscription.gatewaySubscriptionId) {
        throw new Error("A subscription is still being created and cannot yet be cancelled.");
      }
      const atCycleEnd = ["ACTIVE", "PENDING", "HALTED", "PAUSED"].includes(subscription.status);
      await cancelRazorpaySubscription(subscription.gatewaySubscriptionId, atCycleEnd);
      await prisma.monthlySubscription.update({
        where: { id: subscription.id },
        data: {
          cancelAtCycleEnd: atCycleEnd,
          ...(atCycleEnd ? {} : { status: "CANCELLED", cancelledAt: new Date(), nextChargeAt: null }),
        },
      });
    }
    await db.deactivateUserAccount(userId);
    await clearUserSession();
    return NextResponse.json({ success: true, message: "Your account is deactivated. Donation and receipt records are retained." });
  } catch (error) {
    console.error("Could not deactivate donor account:", error);
    if (error instanceof Error && error.message === "A subscription is still being created and cannot yet be cancelled.") {
      return NextResponse.json({ success: false, error: { message: "A monthly subscription is still being created. Wait a moment, refresh, then cancel it before deactivating your account." } }, { status: 409 });
    }
    if (error && typeof error === "object" && "status" in error && error.status === 503) {
      return NextResponse.json({ success: false, error: { message: "Razorpay is not configured, so we could not safely stop the account’s monthly subscriptions. Your account has not been deactivated." } }, { status: 503 });
    }
    if (error instanceof RazorpayApiError) {
      return NextResponse.json({ success: false, error: { message: "We could not cancel every monthly subscription, so your account has not been deactivated. Please try again or contact the Trust." } }, { status: 502 });
    }
    return NextResponse.json({ success: false, error: { message: "Could not deactivate your account." } }, { status: 500 });
  }
}
