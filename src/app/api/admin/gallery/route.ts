import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { z } from "zod";

const schema = z.object({
  title: z.string().optional(),
  caption: z.string().optional(),
  description: z.string().optional(),
  category: z.string().default("All"),
  imageUrl: z.string().trim().url().refine((url) => /^https?:\/\//i.test(url), "Image URL must use HTTPS or HTTP."),
  altText: z.string().optional(),
  isPublished: z.boolean().default(true),
  displayOrder: z.number().default(0),
});

export async function GET() {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;
  revalidatePath("/gallery");
    revalidatePath("/");
    return NextResponse.json({ success: true, items: await db.listGalleryItems(true) });
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

  const item = await db.createGalleryItem(parsed.data);

  await db.logAudit({
    actorType: "ADMIN",
    actorId: guard.admin!.id,
    actorName: guard.admin!.name,
    action: "GALLERY_ITEM_CREATED",
    entity: "galleryItem",
    entityId: item.id,
  });

  revalidatePath("/gallery");
    revalidatePath("/");
    return NextResponse.json({ success: true, item });
}
