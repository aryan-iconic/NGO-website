import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createDonationSchema } from "@/lib/schemas";
import { getCurrentUserId } from "@/lib/auth";

const jsonError = (message: string, status: number) =>
  NextResponse.json({ success: false, error: { message } }, { status });

export async function POST(req: NextRequest) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return jsonError("Payments are not configured.", 503);

  let body: unknown;
  try { body = await req.json(); } catch { return jsonError("Invalid request body.", 400); }
  const parsed = createDonationSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid donation details.", 400);
  const input = parsed.data;

  try {
    let campaign = null;
    if (input.campaignId) {
      campaign = await db.getPublicCampaignBySlug(input.campaignId) ?? await db.getCampaignById(input.campaignId);
      if (!campaign || campaign.status !== "ACTIVE") return jsonError("This campaign is not accepting donations.", 400);
    }

    const items = [];
    let itemsTotal = 0;
    for (const item of input.items) {
      const product = item.productId
        ? (await db.getCampaignProducts(campaign?.id ?? "")).find((p: any) => p.id === item.productId)
        : null;
      if (item.productId && !product) return jsonError("A selected product is no longer available.", 400);
      if (product?.quantityLimit && product.quantitySponsored + item.quantity > product.quantityLimit) {
        return jsonError(`Not enough "${product.name}" remaining.`, 409);
      }
      const unitPricePaise = product?.pricePaise ?? item.unitPricePaise;
      const totalPaise = unitPricePaise * item.quantity;
      if (!Number.isSafeInteger(totalPaise) || !Number.isSafeInteger(itemsTotal + totalPaise)) return jsonError("Donation amount is too large.", 400);
      itemsTotal += totalPaise;
      items.push({ productId: product?.id, productNameSnapshot: product?.name ?? item.productName, unitPriceSnapshotPaise: unitPricePaise, quantity: item.quantity, totalPaise });
    }

    const customAmountPaise = input.customAmountPaise ?? 0;
    const totalPaise = itemsTotal + customAmountPaise;
    if (!Number.isSafeInteger(totalPaise) || totalPaise <= 0) return jsonError("Donation amount must be greater than zero.", 400);
    if (campaign && customAmountPaise > 0 && totalPaise < campaign.minimumAmountPaise) return jsonError("Amount is below this campaign's minimum.", 400);
    if (customAmountPaise > 0) items.push({ productNameSnapshot: campaign ? "Campaign contribution" : "General donation", unitPriceSnapshotPaise: customAmountPaise, quantity: 1, totalPaise: customAmountPaise });

    const receipt = `don_${randomUUID()}`;
    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount: totalPaise, currency: "INR", receipt, notes: { campaignId: campaign?.id ?? "general" } }),
      cache: "no-store",
    });
    const order = await razorpayResponse.json();
    if (!razorpayResponse.ok || !order.id || order.amount !== totalPaise || order.currency !== "INR") {
      console.error("Razorpay order creation failed", order);
      return jsonError("Could not start payment. Please try again.", 502);
    }

    const donation = await db.createDonationWithOrder({
      userId: (await getCurrentUserId()) ?? undefined,
      campaignId: campaign?.id,
      donorName: input.donorName,
      donorEmail: input.donorEmail,
      donorPhone: input.donorPhone,
      items,
      totalPaise,
      isAnonymous: input.isAnonymous,
      idempotencyKey: receipt,
    }, order.id);

    return NextResponse.json({
      success: true,
      donationId: donation.id,
      orderId: order.id,
      amount: totalPaise,
      currency: "INR",
      keyId,
      donorName: input.donorName,
      donorEmail: input.donorEmail,
      donorPhone: input.donorPhone ?? undefined,
    });
  } catch (error) {
    console.error("Donation order creation failed", error);
    return jsonError("Could not start payment. Please try again.", 500);
  }
}
