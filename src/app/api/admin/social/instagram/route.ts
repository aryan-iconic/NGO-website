import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { z } from "zod";

const createSchema = z.object({
  instagramUrl: z.string().url().regex(/instagram\.com\/(p|reel)\/[a-zA-Z0-9_-]+/i, "Must be a valid Instagram post or reel URL"),
  title: z.string().optional(),
  caption: z.string().optional(),
  displayOrder: z.number().int().default(0),
  isPublished: z.boolean().default(true),
});

export async function GET() {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;
  return NextResponse.json({ success: true, data: await db.listInstagramPosts() });
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message } },
      { status: 400 }
    );
  }
  
  const post = await db.createInstagramPost(parsed.data);

  await db.logAudit({
    actorType: "ADMIN",
    actorId: guard.admin!.id,
    action: "INSTAGRAM_POST_CREATED",
    entity: "instagram_post",
    entityId: post.id,
  });

  return NextResponse.json({ success: true, data: post });
}
