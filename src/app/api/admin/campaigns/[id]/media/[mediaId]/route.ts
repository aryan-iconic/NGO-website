import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const altTextSchema = z.object({ altText: z.string().trim().max(300).nullable() });

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; mediaId: string }> }) {
  const guard = await requireAdmin(["SUPER_ADMIN", "ADMIN", "CONTENT_ADMIN"]);
  if (guard.error) return guard.error;
  const { id, mediaId } = await params;
  const campaign = await db.getCampaignById(id);
  if (!campaign || campaign.deletedAt) return NextResponse.json({ success: false, error: { message: "Campaign not found." } }, { status: 404 });
  const existing = await prisma.campaignMedia.findFirst({ where: { id: mediaId, campaignId: id } });
  if (!existing) return NextResponse.json({ success: false, error: { message: "Media not found." } }, { status: 404 });
  const parsed = altTextSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ success: false, error: { message: parsed.error.issues[0]?.message || "Invalid image description." } }, { status: 400 });
  const media = await prisma.campaignMedia.update({ where: { id: mediaId }, data: { altText: parsed.data.altText || null } });
  await db.logAudit({ actorType: "ADMIN", actorId: guard.admin!.id, actorName: guard.admin!.name, action: "CAMPAIGN_MEDIA_UPDATED", entity: "campaignMedia", entityId: mediaId });
  revalidatePath(`/campaigns/${campaign.slug}`);
  revalidatePath("/");
  return NextResponse.json({ success: true, media });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string, mediaId: string }> }) {
  const guard = await requireAdmin(["SUPER_ADMIN", "ADMIN", "CONTENT_ADMIN"]);
  if (guard.error) return guard.error;

  const { id, mediaId } = await params;
  const campaign = await db.getCampaignById(id);
  if (!campaign || campaign.deletedAt) {
    return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Campaign not found." } }, { status: 404 });
  }
  
  const existing = await prisma.campaignMedia.findUnique({
    where: { id: mediaId }
  });
  
  if (!existing || existing.campaignId !== id) {
    return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Media not found." } }, { status: 404 });
  }

  await prisma.campaignMedia.delete({
    where: { id: mediaId }
  });

  await db.logAudit({
    actorType: "ADMIN",
    actorId: guard.admin!.id,
    actorName: guard.admin!.name,
    action: "CAMPAIGN_MEDIA_DELETED",
    entity: "campaignMedia",
    entityId: mediaId,
  });

  revalidatePath("/campaigns");
  revalidatePath(`/campaigns/${campaign.slug}`);
  revalidatePath("/");

  return NextResponse.json({ success: true });
}
