import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string, mediaId: string }> }) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const { id, mediaId } = await params;
  
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

  return NextResponse.json({ success: true });
}
