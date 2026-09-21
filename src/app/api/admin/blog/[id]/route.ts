import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(3).optional(),
  excerpt: z.string().min(5).optional(),
  content: z.string().min(20).optional(),
  author: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;
  const { id } = await params;
  const post = db.getPostById(id);
  if (!post) return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Post not found." } }, { status: 404 });
  return NextResponse.json({ success: true, post });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

  const existing = db.getPostById(id);
  const patch = { ...parsed.data } as Record<string, unknown>;
  if (parsed.data.status === "PUBLISHED" && existing && !existing.publishedAt) {
    patch.publishedAt = new Date().toISOString();
  }

  const updated = db.updatePost(id, patch);
  if (!updated) {
    return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Post not found." } }, { status: 404 });
  }

  db.logAudit({
    actorType: "ADMIN",
    actorId: guard.admin!.id,
    actorName: guard.admin!.name,
    action: "BLOG_POST_UPDATED",
    entity: "blog_post",
    entityId: updated.id,
  });

  return NextResponse.json({ success: true, post: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;
  const { id } = await params;
  const ok = db.deletePost(id);
  if (!ok) return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Post not found." } }, { status: 404 });

  db.logAudit({
    actorType: "ADMIN",
    actorId: guard.admin!.id,
    actorName: guard.admin!.name,
    action: "BLOG_POST_DELETED",
    entity: "blog_post",
    entityId: id,
  });

  return NextResponse.json({ success: true });
}
