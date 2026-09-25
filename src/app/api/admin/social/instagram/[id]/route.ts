import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { z } from "zod";

const updateSchema = z.object({
  instagramUrl: z.string().url().regex(/instagram\.com\/(p|reel)\/[a-zA-Z0-9_-]+/i, "Must be a valid Instagram post or reel URL").optional(),
  title: z.string().optional(),
  caption: z.string().optional(),
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
  
  const post = await db.updateInstagramPost(id, parsed.data);

  await db.logAudit({
    actorType: "ADMIN",
    actorId: guard.admin!.id,
    action: "INSTAGRAM_POST_UPDATED",
    entity: "instagram_post",
    entityId: post.id,
  });

  return NextResponse.json({ success: true, data: post });
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const { id } = await props.params;
  await db.deleteInstagramPost(id);

  await db.logAudit({
    actorType: "ADMIN",
    actorId: guard.admin!.id,
    action: "INSTAGRAM_POST_DELETED",
    entity: "instagram_post",
    entityId: id,
  });

  return NextResponse.json({ success: true });
}
