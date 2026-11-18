import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { z } from "zod";
import { getMinimumDonationAmountPaise } from "@/lib/server-settings";
import { randomUUID } from "node:crypto";

const createCampaignSchema = z.object({
  title: z.string().min(3),
  shortDescription: z.string().min(10),
  story: z.string().min(20),
  beneficiaryInfo: z.string().optional().nullable(),
  impactDescription: z.string().optional().nullable(),
  categoryId: z.string().optional(),
  locationText: z.string().optional(),
  donationMode: z.enum(["PRODUCTS", "GENERAL", "BOTH"]).default("BOTH"),
  allowCustomAmount: z.boolean().default(true),
  minimumAmountPaise: z.number().int().min(100).max(100_000_000).optional(),
  isFeatured: z.boolean().default(false),
  isUrgent: z.boolean().default(false),
  sevaAreaId: z.string().optional(),
  coverImage: z.string().optional(),
});

function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function GET() {
  const guard = await requireAdmin(["SUPER_ADMIN", "ADMIN", "CONTENT_ADMIN"]);
  if (guard.error) return guard.error;
  return NextResponse.json({ success: true, campaigns: await db.listAllCampaigns() });
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin(["SUPER_ADMIN", "ADMIN", "CONTENT_ADMIN"]);
  if (guard.error) return guard.error;

  const parsed = createCampaignSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message } },
      { status: 400 }
    );
  }
  const input = parsed.data;
  const minimumAmountPaise = input.minimumAmountPaise ?? await getMinimumDonationAmountPaise();
  const existingSlugs = new Set((await db.listAllCampaigns()).map((campaign: { slug: string }) => campaign.slug));
  const baseSlug = slugify(input.title) || `campaign-${randomUUID().slice(0, 8)}`;
  let slug = baseSlug;
  let suffix = 1;
  while (existingSlugs.has(slug)) slug = `${baseSlug}-${++suffix}`;

  const campaign = await db.createCampaign({
    ...input,
    slug,
    minimumAmountPaise,
    createdByAdminId: guard.admin!.id,
    status: "DRAFT",
  });

  await db.logAudit({
    actorType: "ADMIN",
    actorId: guard.admin!.id,
    actorName: guard.admin!.name,
    action: "CAMPAIGN_CREATED",
    entity: "campaign",
    entityId: campaign.id,
  });

  revalidatePath("/campaigns");
  revalidatePath("/donate");
  revalidatePath("/");
  return NextResponse.json({ success: true, campaign });
}
