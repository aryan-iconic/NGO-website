import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { z } from "zod";

const updateSchema = z.object({
  youtubeUrl: z.string().url().regex(/(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/)[a-zA-Z0-9_-]+/i, "Must be a valid YouTube URL").optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  displayOrder: z.number().int().optional(),
  isPublished: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const { id } = await props.params;
  const parsed = updateSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message } },
      { status: 400 }
    );
  }
  
  const video = await db.updateYouTubeVideo(id, parsed.data);

  await db.logAudit({
    actorType: "ADMIN",
    actorId: guard.admin!.id,
    action: "YOUTUBE_VIDEO_UPDATED",
    entity: "youtube_video",
    entityId: video.id,
  });

  return NextResponse.json({ success: true, data: video });
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const { id } = await props.params;
  await db.deleteYouTubeVideo(id);

  await db.logAudit({
    actorType: "ADMIN",
    actorId: guard.admin!.id,
    action: "YOUTUBE_VIDEO_DELETED",
    entity: "youtube_video",
    entityId: id,
  });

  return NextResponse.json({ success: true });
}
