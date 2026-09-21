import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Public endpoint. Whitelisted fields only — no internal target, budget,
// or any aggregate donation figures. See PublicCampaignDto in the spec.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const campaign = await db.getPublicCampaignBySlug(slug);
  if (!campaign) {
    return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Campaign not found." } }, { status: 404 });
  }
  return NextResponse.json({
    success: true,
    campaign: {
      id: campaign.id,
      title: campaign.title,
      slug: campaign.slug,
      minimumAmountPaise: campaign.minimumAmountPaise,
      allowCustomAmount: campaign.allowCustomAmount,
    },
  });
}
