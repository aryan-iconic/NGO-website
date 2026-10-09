import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendDonationReceiptEmail } from "@/lib/donation-email";

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) return NextResponse.json({ error: "Webhook is not configured." }, { status: 503 });

  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  const expected = createHmac("sha256", webhookSecret).update(rawBody).digest();
  const supplied = Buffer.from(signature, "hex");
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  try {
    const event = JSON.parse(rawBody);
    if (event.event === "payment.captured" || event.event === "payment.failed") {
      const paymentEntity = event.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;
      const paymentId = paymentEntity?.id;
      if (!orderId || !paymentId) return NextResponse.json({ error: "Invalid payment event." }, { status: 400 });

      const payment = await db.getPaymentByOrder(orderId);
      if (!payment) return NextResponse.json({ received: true }); // Ignore unrelated Razorpay orders.
      if (paymentEntity.amount !== payment.amountPaise || paymentEntity.currency !== "INR") {
        return NextResponse.json({ error: "Payment amount does not match the order." }, { status: 400 });
      }

      if (event.event === "payment.captured") {
        const newlySettled = await db.markDonationCompleted(payment.donationId, paymentId, orderId, paymentEntity.method);
        if (newlySettled) {
          const receipt = await db.getReceiptForDonation(payment.donationId);
          if (receipt) await sendDonationReceiptEmail({ email: payment.donation.donorEmail, name: payment.donation.donorName, receiptNumber: receipt.receiptNumber, amountPaise: payment.amountPaise });
        }
      } else {
        await db.markDonationPaymentFailed(orderId);
      }
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Razorpay webhook processing failed", error);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
