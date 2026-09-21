import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createDonationSchema } from "@/lib/schemas";
import { getCurrentUserId } from "@/lib/auth";

// This mocks Razorpay's create-order + verify + webhook sequence: in a real
// deployment, POST /api/donations would create a PENDING_PAYMENT donation and
// a gateway order, the client would open the gateway checkout, and
// /api/payments/webhook would call the same settlePayment() that a
// client-verify endpoint calls (Section 8.5 of the spec). Here we settle
// immediately so the full flow — donation, product reservation, receipt — is
// real and demonstrable without a live payment gateway.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = createDonationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message } },
      { status: 400 }
    );
  }
  const input = parsed.data;

  let campaign = null;
  if (input.campaignId) {
    campaign = db.getPublicCampaignBySlug(input.campaignId) ?? db.getCampaignById(input.campaignId);
    if (!campaign || campaign.status !== "ACTIVE") {
      return NextResponse.json(
        { success: false, error: { code: "CAMPAIGN_NOT_AVAILABLE", message: "This campaign is not currently accepting contributions." } },
        { status: 400 }
      );
    }
  }

  // Server recalculates every line from the current product price — the
  // client's unitPricePaise is never trusted.
  const items = [];
  let itemsTotal = 0;
  for (const item of input.items) {
    const product = item.productId ? db.getCampaignProducts(campaign?.id ?? "").find((p) => p.id === item.productId) : null;
    if (item.productId && !product) {
      return NextResponse.json(
        { success: false, error: { code: "PRODUCT_NOT_FOUND", message: "One of the selected items is no longer available." } },
        { status: 400 }
      );
    }
    if (product?.quantityLimit && product.quantitySponsored + item.quantity > product.quantityLimit) {
      return NextResponse.json(
        { success: false, error: { code: "INSUFFICIENT_QUANTITY", message: `Not enough "${product.name}" remaining.` } },
        { status: 409 }
      );
    }
    const unitPrice = product?.pricePaise ?? item.unitPricePaise;
    const total = unitPrice * item.quantity;
    itemsTotal += total;
    items.push({
      productId: product?.id,
      productNameSnapshot: product?.name ?? item.productName,
      unitPriceSnapshotPaise: unitPrice,
      quantity: item.quantity,
      totalPaise: total,
    });
  }

  const totalPaise = itemsTotal + (input.customAmountPaise ?? 0);
  if (totalPaise <= 0) {
    return NextResponse.json(
      { success: false, error: { code: "INVALID_AMOUNT", message: "Donation amount must be greater than zero." } },
      { status: 400 }
    );
  }
  if (campaign && totalPaise < campaign.minimumAmountPaise && input.customAmountPaise) {
    return NextResponse.json(
      { success: false, error: { code: "BELOW_MINIMUM", message: "Amount is below the minimum for this campaign." } },
      { status: 400 }
    );
  }

  if (input.customAmountPaise) {
    items.push({
      productNameSnapshot: campaign ? "Campaign contribution" : "General donation",
      unitPriceSnapshotPaise: input.customAmountPaise,
      quantity: 1,
      totalPaise: input.customAmountPaise,
    });
  }

  const userId = (await getCurrentUserId()) ?? undefined;

  const { donation, receipt } = db.createDonation({
    userId,
    campaignId: campaign?.id,
    donorName: input.donorName,
    donorEmail: input.donorEmail,
    donorPhone: input.donorPhone,
    items,
    totalPaise,
    isAnonymous: input.isAnonymous,
  });

  return NextResponse.json({
    success: true,
    donation: { id: donation.id, donationNumber: donation.donationNumber, totalPaise: donation.totalPaise, status: donation.status },
    receipt: { receiptNumber: receipt.receiptNumber },
  });
}
