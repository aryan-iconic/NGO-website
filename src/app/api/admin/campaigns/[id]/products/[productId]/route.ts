import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";

const productSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  description: z.string().trim().max(2000).optional().nullable(),
  image: z.string().trim().url().optional().nullable(),
  unitName: z.string().trim().min(1).max(80).optional(),
  pricePaise: z.number().int().min(100).max(100_000_000).optional(),
  quantityLimit: z.number().int().positive().optional().nullable(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string; productId: string }> }) {
  const guard = await requireAdmin(["SUPER_ADMIN", "ADMIN", "CONTENT_ADMIN"]);
  if (guard.error) return guard.error;
  const { id, productId } = await params;
  const campaign = await db.getCampaignById(id);
  if (!campaign || campaign.deletedAt) return NextResponse.json({ success: false, error: { message: "Campaign not found." } }, { status: 404 });
  const existing = await prisma.campaignProduct.findFirst({ where: { id: productId, campaignId: id } });
  if (!existing) return NextResponse.json({ success: false, error: { message: "Product not found." } }, { status: 404 });
  const parsed = productSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ success: false, error: { message: parsed.error.issues[0]?.message || "Invalid product details." } }, { status: 400 });
  if (parsed.data.quantityLimit !== undefined && parsed.data.quantityLimit !== null && parsed.data.quantityLimit < existing.quantitySponsored + existing.quantityReserved) {
    return NextResponse.json({ success: false, error: { message: "Quantity limit cannot be lower than units already sponsored or reserved." } }, { status: 400 });
  }
  const product = await prisma.campaignProduct.update({ where: { id: productId }, data: parsed.data });
  await db.logAudit({ actorType: "ADMIN", actorId: guard.admin!.id, actorName: guard.admin!.name, action: "CAMPAIGN_PRODUCT_UPDATED", entity: "campaignProduct", entityId: product.id });
  revalidatePath(`/campaigns/${campaign.slug}`);
  revalidatePath("/campaigns");
  return NextResponse.json({ success: true, product });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string; productId: string }> }) {
  const guard = await requireAdmin(["SUPER_ADMIN", "ADMIN", "CONTENT_ADMIN"]);
  if (guard.error) return guard.error;
  const { id, productId } = await params;
  const campaign = await db.getCampaignById(id);
  if (!campaign || campaign.deletedAt) return NextResponse.json({ success: false, error: { message: "Campaign not found." } }, { status: 404 });
  const existing = await prisma.campaignProduct.findFirst({ where: { id: productId, campaignId: id } });
  if (!existing) return NextResponse.json({ success: false, error: { message: "Product not found." } }, { status: 404 });
  const product = await prisma.campaignProduct.update({ where: { id: productId }, data: { isActive: false } });
  await db.logAudit({ actorType: "ADMIN", actorId: guard.admin!.id, actorName: guard.admin!.name, action: "CAMPAIGN_PRODUCT_DEACTIVATED", entity: "campaignProduct", entityId: product.id });
  revalidatePath(`/campaigns/${campaign.slug}`);
  revalidatePath("/campaigns");
  return NextResponse.json({ success: true });
}
