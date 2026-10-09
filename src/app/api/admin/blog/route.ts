import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(3),
  excerpt: z.string().min(5),
  content: z.string().min(20),
  author: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  coverImage: z.string().optional().nullable(),
});

function slugify(title: string) {
  return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function GET() {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;
  return NextResponse.json({ success: true, posts: await db.listBlogPosts(false) });
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message } },
      { status: 400 }
    );
  }

  const baseSlug = slugify(parsed.data.title);
  let slug = baseSlug;
  let n = 1;
  while ((await db.listBlogPosts(false)).some((p: any) => p.slug === slug)) slug = `${baseSlug}-${++n}`;

  const post = await db.createBlogPost({
    ...parsed.data,
    slug,
    publishedAt: parsed.data.status === "PUBLISHED" ? new Date().toISOString() : undefined,
  });

  await db.logAudit({
    actorType: "ADMIN",
    actorId: guard.admin!.id,
    actorName: guard.admin!.name,
    action: "BLOG_POST_CREATED",
    entity: "blog_post",
    entityId: post.id,
  });

  revalidatePath("/blog");
  revalidatePath("/");
  return NextResponse.json({ success: true, post });
}
