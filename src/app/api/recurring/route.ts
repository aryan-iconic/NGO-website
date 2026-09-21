import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  campaignId: z.string().optional(),
  amountPaise: z.number().int().positive(),
  donorName: z.string().min(2),
  donorEmail: z.string().email(),
});

// Mirrors the spec's monthly-giving flow (Section 8.9): amount → campaign or
// general → donor details → gateway subscription authorization → confirmation.
// The gateway subscription authorization step is mocked the same way the
// one-time donation gateway is — see /api/donations for why.
export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message } },
      { status: 400 }
    );
  }

  if (parsed.data.campaignId) {
    const campaign = db.getPublicCampaignBySlug(parsed.data.campaignId) ?? db.getCampaignById(parsed.data.campaignId);
    if (!campaign || campaign.status !== "ACTIVE") {
      return NextResponse.json(
        { success: false, error: { code: "CAMPAIGN_NOT_AVAILABLE", message: "This campaign is not currently accepting contributions." } },
        { status: 400 }
      );
    }
  }

  const userId = (await getCurrentUserId()) ?? undefined;
  const recurring = db.createRecurringDonation({
    userId,
    donorName: parsed.data.donorName,
    donorEmail: parsed.data.donorEmail,
    campaignId: parsed.data.campaignId,
    amountPaise: parsed.data.amountPaise,
  });

  return NextResponse.json({ success: true, recurring });
}

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Sign in required." } }, { status: 401 });
  }
  return NextResponse.json({ success: true, recurring: db.listRecurringForUser(userId) });
}
