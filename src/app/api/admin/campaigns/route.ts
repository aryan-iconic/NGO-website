import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { z } from "zod";

const createCampaignSchema = z.object({
  title: z.string().min(3),
  shortDescription: z.string().min(10),
  story: z.string().min(20),
  categoryId: z.string().optional(),
  locationText: z.string().optional(),
  donationMode: z.enum(["PRODUCTS", "GENERAL", "BOTH"]).default("BOTH"),
  allowCustomAmount: z.boolean().default(true),
  minimumAmountPaise: z.number().int().positive().default(10100),
  isFeatured: z.boolean().default(false),
  isUrgent: z.boolean().default(false),
  sevaAreaId: z.string().optional(),
});

function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function GET() {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;
  return NextResponse.json({ success: true, campaigns: db.listAllCampaigns() });
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const parsed = createCampaignSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message } },
      { status: 400 }
    );
  }
  const input = parsed.data;
  const baseSlug = slugify(input.title);
  let slug = baseSlug;
  let n = 1;
  while (db.getCampaignById(slug) || db.listAllCampaigns().some((c) => c.slug === slug)) {
    slug = `${baseSlug}-${++n}`;
  }

  const campaign = db.createCampaign({
    ...input,
    slug,
    suggestedAmountsPaise: [10100, 50100, 100100],
    createdByAdminId: guard.admin!.id,
    status: "DRAFT",
  });

  db.logAudit({
    actorType: "ADMIN",
    actorId: guard.admin!.id,
    actorName: guard.admin!.name,
    action: "CAMPAIGN_CREATED",
    entity: "campaign",
    entityId: campaign.id,
  });

  return NextResponse.json({ success: true, campaign });
}
