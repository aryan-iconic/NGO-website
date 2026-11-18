import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const schema = z.object({
  type: z.enum(["IMAGE", "VIDEO"]),
  url: z.string().url().refine((value) => ["http:", "https:"].includes(new URL(value).protocol), "URL must use HTTP or HTTPS."),
  altText: z.string().optional().nullable(),
  sortOrder: z.number().int().min(0).optional(),
}).superRefine((item, context) => {
  if (item.type !== "VIDEO") return;
  const hostname = new URL(item.url).hostname.toLowerCase().replace(/^www\./, "");
  if (!["youtube.com", "m.youtube.com", "youtu.be", "vimeo.com", "player.vimeo.com"].includes(hostname)) {
    context.addIssue({ code: "custom", path: ["url"], message: "Use a public YouTube or Vimeo video link." });
  }
});

const reorderSchema = z.object({ mediaIds: z.array(z.string()).max(100) });

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin(["SUPER_ADMIN", "ADMIN", "CONTENT_ADMIN"]);
  if (guard.error) return guard.error;

  const { id } = await params;
  const campaign = await db.getCampaignById(id);
  if (!campaign || campaign.deletedAt) return NextResponse.json({ success: false, error: { message: "Campaign not found." } }, { status: 404 });
  const media = await prisma.campaignMedia.findMany({
    where: { campaignId: id },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json({ success: true, media });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin(["SUPER_ADMIN", "ADMIN", "CONTENT_ADMIN"]);
  if (guard.error) return guard.error;

  const { id } = await params;
  const campaign = await db.getCampaignById(id);
  if (!campaign || campaign.deletedAt) {
    return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Campaign not found." } }, { status: 404 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message } },
      { status: 400 }
    );
  }

  const lastItem = await prisma.campaignMedia.findFirst({ where: { campaignId: id }, orderBy: { sortOrder: "desc" }, select: { sortOrder: true } });
  const media = await prisma.campaignMedia.create({
    data: {
      campaignId: id,
      ...parsed.data,
      sortOrder: parsed.data.sortOrder ?? (lastItem?.sortOrder ?? -1) + 1,
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

  revalidatePath("/campaigns");
  revalidatePath(`/campaigns/${campaign.slug}`);
  revalidatePath("/");

  return NextResponse.json({ success: true, media });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin(["SUPER_ADMIN", "ADMIN", "CONTENT_ADMIN"]);
  if (guard.error) return guard.error;
  const { id } = await params;
  const campaign = await db.getCampaignById(id);
  if (!campaign || campaign.deletedAt) return NextResponse.json({ success: false, error: { message: "Campaign not found." } }, { status: 404 });
  const parsed = reorderSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: { message: parsed.error.issues[0]?.message || "Invalid media order." } }, { status: 400 });
  }
  if (new Set(parsed.data.mediaIds).size !== parsed.data.mediaIds.length) {
    return NextResponse.json({ success: false, error: { message: "Invalid media order." } }, { status: 400 });
  }
  const current = await prisma.campaignMedia.findMany({ where: { campaignId: id }, select: { id: true } });
  const currentIds = new Set(current.map((item) => item.id));
  if (parsed.data.mediaIds.length !== current.length || parsed.data.mediaIds.some((mediaId) => !currentIds.has(mediaId))) {
    return NextResponse.json({ success: false, error: { message: "Media list changed. Reload and try again." } }, { status: 409 });
  }
  await prisma.$transaction(parsed.data.mediaIds.map((mediaId, sortOrder) => prisma.campaignMedia.updateMany({ where: { id: mediaId, campaignId: id }, data: { sortOrder } })));
  await db.logAudit({ actorType: "ADMIN", actorId: guard.admin!.id, actorName: guard.admin!.name, action: "CAMPAIGN_MEDIA_REORDERED", entity: "campaign", entityId: id });
  revalidatePath("/campaigns");
  revalidatePath(`/campaigns/${campaign.slug}`);
  revalidatePath("/");
  return NextResponse.json({ success: true });
}
