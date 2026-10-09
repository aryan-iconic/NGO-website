import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { sendDonationReceiptEmail } from "@/lib/donation-email";

const schema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return NextResponse.json({ success: false, error: { message: "Payments are not configured." } }, { status: 503 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ success: false, error: { message: "Invalid payment verification details." } }, { status: 400 });

  const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = parsed.data;
  const expected = createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest();
  let supplied: Buffer;
  try { supplied = Buffer.from(signature, "hex"); } catch { supplied = Buffer.alloc(0); }
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
    return NextResponse.json({ success: false, error: { message: "Payment signature verification failed." } }, { status: 400 });
  }

  try {
    const payment = await db.getPaymentByOrder(orderId);
    if (!payment || payment.status === "FAILED" || payment.donation.status === "FAILED") {
      return NextResponse.json({ success: false, error: { message: "Payment order was not found or is no longer payable." } }, { status: 404 });
    }
    if (payment.amountPaise !== payment.donation.totalPaise) {
      return NextResponse.json({ success: false, error: { message: "Payment amount does not match the donation." } }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    if (!keyId) return NextResponse.json({ success: false, error: { message: "Payments are not configured." } }, { status: 503 });
    const gatewayResponse = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`, {
      headers: { Authorization: `Basic ${Buffer.from(`${keyId}:${secret}`).toString("base64")}` },
      cache: "no-store",
    });
    const gatewayPayment = await gatewayResponse.json();
    if (!gatewayResponse.ok || gatewayPayment.order_id !== orderId || gatewayPayment.amount !== payment.amountPaise || gatewayPayment.currency !== "INR") {
      return NextResponse.json({ success: false, error: { message: "Payment details could not be confirmed with Razorpay." } }, { status: 400 });
    }
    if (gatewayPayment.status !== "captured") {
      return NextResponse.json({ success: false, error: { message: "Payment is still being processed. Please wait for confirmation." } }, { status: 409 });
    }

    const newlySettled = await db.markDonationCompleted(payment.donationId, paymentId, orderId, gatewayPayment.method);
    const receipt = await db.getReceiptForDonation(payment.donationId);
    if (!receipt) throw new Error("Receipt was not created after payment verification");
    if (newlySettled) {
      await sendDonationReceiptEmail({ email: payment.donation.donorEmail, name: payment.donation.donorName, receiptNumber: receipt.receiptNumber, amountPaise: payment.amountPaise });
    }
    return NextResponse.json({ success: true, receiptNumber: receipt.receiptNumber, amountPaise: payment.amountPaise });
  } catch (error) {
    console.error("Donation payment verification failed", error);
    return NextResponse.json({ success: false, error: { message: "Payment was received but confirmation is pending. Contact support if it is not confirmed shortly." } }, { status: 500 });
  }
}
