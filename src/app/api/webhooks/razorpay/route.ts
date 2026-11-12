import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendDonationReceiptEmail } from "@/lib/donation-email";

export const runtime = "nodejs";

const paymentEvents = new Set(["payment.captured", "payment.failed"]);
const refundEvents = new Set(["refund.created", "refund.processed", "refund.failed"]);

type PaymentEntity = { id?: string; order_id?: string; amount?: number; currency?: string; method?: string };
type RefundEntity = { payment_id?: string; amount?: number };
type RazorpayEvent = {
  event?: string;
  payload?: { payment?: { entity?: PaymentEntity }; refund?: { entity?: RefundEntity } };
};

function refundAmountFromPayload(payload: unknown): number {
  if (!payload || typeof payload !== "object") return 0;
  const eventPayload = (payload as { payload?: unknown }).payload;
  if (!eventPayload || typeof eventPayload !== "object") return 0;
  const refund = (eventPayload as { refund?: unknown }).refund;
  if (!refund || typeof refund !== "object") return 0;
  const entity = (refund as { entity?: unknown }).entity;
  if (!entity || typeof entity !== "object") return 0;
  const amount = (entity as { amount?: unknown }).amount;
  return Number.isSafeInteger(amount) ? (amount as number) : 0;
}

function verifySignature(rawBody: string, signature: string, secret: string) {
  const expected = createHmac("sha256", secret).update(rawBody).digest();
  const supplied = Buffer.from(signature, "hex");
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) return NextResponse.json({ error: "Webhook is not configured." }, { status: 503 });

  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");
  if (!signature || !verifySignature(rawBody, signature, webhookSecret)) {
    return NextResponse.json({ error: "Invalid or missing signature." }, { status: 400 });
  }

  let event: RazorpayEvent;
  try {
    event = JSON.parse(rawBody) as RazorpayEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const eventType = event.event ?? "";
  if (!paymentEvents.has(eventType) && !refundEvents.has(eventType)) {
    return NextResponse.json({ received: true, ignored: true });
  }

  const paymentEntity = event.payload?.payment?.entity;
  const refundEntity = event.payload?.refund?.entity;
  const orderId = paymentEntity?.order_id;
  const paymentId = paymentEntity?.id ?? refundEntity?.payment_id;
  if (paymentEvents.has(eventType) && (typeof orderId !== "string" || typeof paymentId !== "string")) {
    return NextResponse.json({ error: "Invalid payment event." }, { status: 400 });
  }
  if (refundEvents.has(eventType) && typeof paymentId !== "string") {
    return NextResponse.json({ error: "Invalid refund event." }, { status: 400 });
  }

  // Razorpay supplies a stable ID. The body hash fallback is deterministic for
  // retries where the event ID header is absent.
  const eventId = req.headers.get("x-razorpay-event-id") || createHash("sha256").update(rawBody).digest("hex");

  try {
    const payment = paymentEvents.has(eventType)
      ? await prisma.payment.findUnique({ where: { gatewayOrderId: orderId! }, include: { donation: { include: { items: true } } } })
      : await prisma.payment.findUnique({ where: { gatewayPaymentId: paymentId! }, include: { donation: { include: { items: true } } } });
    // These may be events for other Razorpay products using the same account.
    if (!payment) return NextResponse.json({ received: true, ignored: true });

    if (paymentEvents.has(eventType) && (paymentEntity!.amount !== payment.amountPaise || paymentEntity!.currency !== "INR")) {
      return NextResponse.json({ error: "Payment amount does not match the order." }, { status: 400 });
    }
    if (eventType === "refund.processed" && (!Number.isSafeInteger(refundEntity?.amount) || refundEntity!.amount! <= 0 || refundEntity!.amount! > payment.amountPaise)) {
      return NextResponse.json({ error: "Invalid refund amount." }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.paymentEvent.create({
        data: {
          paymentId: payment.id,
          eventType,
          gatewayEventId: eventId,
          payload: event,
          processed: true,
        },
      });

      if (eventType === "payment.captured") {
        if (payment.status === "REFUNDED" || payment.status === "PARTIALLY_REFUNDED") return { newlySettled: false };

        const settlement = await tx.donation.updateMany({
          where: { id: payment.donationId, status: { not: "SUCCESS" } },
          data: { status: "SUCCESS" },
        });
        await tx.payment.update({
          where: { id: payment.id },
          data: { status: "SUCCESS", gatewayPaymentId: paymentId!, method: paymentEntity!.method, paidAt: new Date() },
        });
        await tx.receipt.upsert({
          where: { donationId: payment.donationId },
          create: { donationId: payment.donationId, receiptNumber: `REC-${payment.donation.donationNumber}` },
          update: {},
        });

        if (settlement.count > 0) {
          for (const item of payment.donation.items) {
            if (item.campaignProductId) {
              await tx.campaignProduct.update({
                where: { id: item.campaignProductId },
                data: { quantitySponsored: { increment: item.quantity } },
              });
            }
          }
        }
        return { newlySettled: settlement.count > 0 };
      }

      if (eventType === "payment.failed") {
        await tx.payment.updateMany({ where: { id: payment.id, status: { not: "SUCCESS" } }, data: { status: "FAILED" } });
        await tx.donation.updateMany({ where: { id: payment.donationId, status: "PENDING_PAYMENT" }, data: { status: "FAILED" } });
      }

      if (eventType === "refund.processed") {
        const priorRefundEvents = await tx.paymentEvent.findMany({
          where: { paymentId: payment.id, eventType: "refund.processed", processed: true },
          select: { payload: true },
        });
        const refundedPaise = priorRefundEvents.reduce((sum, row) => {
          return sum + refundAmountFromPayload(row.payload);
        }, 0);
        const fullyRefunded = refundedPaise >= payment.amountPaise;
        const newPaymentStatus = fullyRefunded ? "REFUNDED" : "PARTIALLY_REFUNDED";
        await tx.payment.update({ where: { id: payment.id }, data: { status: newPaymentStatus } });
        await tx.donation.update({ where: { id: payment.donationId }, data: { status: newPaymentStatus } });
        if (fullyRefunded) {
          await tx.receipt.updateMany({ where: { donationId: payment.donationId, voidedAt: null }, data: { voidedAt: new Date() } });
        }
      }

      return { newlySettled: false };
    });

    if (result.newlySettled) {
      try {
        const receipt = await prisma.receipt.findUnique({ where: { donationId: payment.donationId } });
        if (receipt) {
          await sendDonationReceiptEmail({
            email: payment.donation.donorEmail,
            name: payment.donation.donorName,
            receiptNumber: receipt.receiptNumber,
            amountPaise: payment.amountPaise,
          });
        }
      } catch (error) {
        // A mail provider outage must not make Razorpay retry a payment event
        // whose financial changes are already committed.
        console.error("Donation receipt email failed after Razorpay webhook", error);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    // A duplicate event violates PaymentEvent.gatewayEventId's unique index.
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      const previousEvent = await prisma.paymentEvent.findUnique({ where: { gatewayEventId: eventId }, select: { id: true } });
      if (previousEvent) return NextResponse.json({ received: true, duplicate: true });
    }
    console.error("Razorpay webhook processing failed", error);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
