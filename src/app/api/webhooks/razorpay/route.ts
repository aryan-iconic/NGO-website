import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!secret) {
      // In development without a secret, we might mock this or reject it.
      // Production must have a secret.
      console.warn("RAZORPAY_WEBHOOK_SECRET is not configured.");
      return NextResponse.json({ error: "Webhook secret missing" }, { status: 500 });
    }

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    // Process idempotent webhook
    if (event.event === "payment.captured" || event.event === "order.paid") {
      const paymentEntity = event.payload.payment.entity;
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;

      // Find donation by orderId
      const donation = (await db.listAllDonations()).find((d: any) => d.paymentReference === orderId || d.id === orderId);

      if (donation && donation.status !== "SUCCESS") {
        // Mark as completed, generate receipt, etc.
        // In this in-memory mock, db.settlePayment handles finalizing.
        // However db doesn't expose it. We update status directly or via a new db method.
        await db.markDonationCompleted(donation.id, paymentId);
      }
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Webhook processing error:", e);
    return NextResponse.json({ error: "Webhook processing error" }, { status: 500 });
  }
}
