import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  type: z.enum(["IMAGE", "VIDEO"]),
  url: z.string().url(),
  altText: z.string().optional().nullable(),
  sortOrder: z.number().default(0),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const { id } = await params;
  const media = await prisma.campaignMedia.findMany({
    where: { campaignId: id },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json({ success: true, media });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const { id } = await params;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message } },
      { status: 400 }
    );
  }

  const media = await prisma.campaignMedia.create({
    data: {
      campaignId: id,
      ...parsed.data
    }
  });

  await db.logAudit({
    actorType: "ADMIN",
    actorId: guard.admin!.id,
    actorName: guard.admin!.name,
    action: "CAMPAIGN_MEDIA_ADDED",
    entity: "campaignMedia",
    entityId: media.id,
  });

  return NextResponse.json({ success: true, media });
}
