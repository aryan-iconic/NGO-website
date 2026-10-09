import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { z } from "zod";

const schema = z.object({
  title: z.string().optional().nullable(),
  caption: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  category: z.string().optional(),
  imageUrl: z.string().trim().url().refine((url) => /^https?:\/\//i.test(url), "Image URL must use HTTPS or HTTP.").optional(),
  altText: z.string().optional().nullable(),
  isPublished: z.boolean().optional(),
  displayOrder: z.number().optional(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const { id } = await params;
  const item = await db.getGalleryItem(id);
  if (!item) return NextResponse.json({ success: false }, { status: 404 });
  revalidatePath("/gallery");
    revalidatePath("/");
    return NextResponse.json({ success: true, item });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

  const existing = await db.getGalleryItem(id);
  if (!existing) return NextResponse.json({ success: false }, { status: 404 });

  const item = await db.updateGalleryItem(id, parsed.data);

  await db.logAudit({
    actorType: "ADMIN",
    actorId: guard.admin!.id,
    actorName: guard.admin!.name,
    action: "GALLERY_ITEM_UPDATED",
    entity: "galleryItem",
    entityId: id,
  });

  revalidatePath("/gallery");
    revalidatePath("/");
    return NextResponse.json({ success: true, item });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const { id } = await params;
  const existing = await db.getGalleryItem(id);
  if (!existing) return NextResponse.json({ success: false }, { status: 404 });

  await db.deleteGalleryItem(id);

  await db.logAudit({
    actorType: "ADMIN",
    actorId: guard.admin!.id,
    actorName: guard.admin!.name,
    action: "GALLERY_ITEM_DELETED",
    entity: "galleryItem",
    entityId: id,
  });

  revalidatePath("/gallery");
    revalidatePath("/");
    return NextResponse.json({ success: true });
}
