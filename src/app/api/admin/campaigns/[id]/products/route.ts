import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";

const productSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(2000).optional().nullable(),
  image: z.string().trim().url().optional().nullable(),
  unitName: z.string().trim().min(1).max(80),
  pricePaise: z.number().int().min(100).max(100_000_000),
  quantityLimit: z.number().int().positive().optional().nullable(),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin(["SUPER_ADMIN", "ADMIN", "CONTENT_ADMIN"]);
  if (guard.error) return guard.error;
  const { id } = await params;
  const campaign = await db.getCampaignById(id);
  if (!campaign || campaign.deletedAt) return NextResponse.json({ success: false, error: { message: "Campaign not found." } }, { status: 404 });
  const products = await prisma.campaignProduct.findMany({ where: { campaignId: id }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
  return NextResponse.json({ success: true, products });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin(["SUPER_ADMIN", "ADMIN", "CONTENT_ADMIN"]);
  if (guard.error) return guard.error;
  const { id } = await params;
  const campaign = await db.getCampaignById(id);
  if (!campaign || campaign.deletedAt) return NextResponse.json({ success: false, error: { message: "Campaign not found." } }, { status: 404 });
  const parsed = productSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ success: false, error: { message: parsed.error.issues[0]?.message || "Invalid product details." } }, { status: 400 });
  const product = await prisma.campaignProduct.create({ data: { ...parsed.data, campaignId: id } });
  await db.logAudit({ actorType: "ADMIN", actorId: guard.admin!.id, actorName: guard.admin!.name, action: "CAMPAIGN_PRODUCT_CREATED", entity: "campaignProduct", entityId: product.id });
  revalidatePath(`/campaigns/${campaign.slug}`);
  revalidatePath("/campaigns");
  revalidatePath("/");
  return NextResponse.json({ success: true, product }, { status: 201 });
}
