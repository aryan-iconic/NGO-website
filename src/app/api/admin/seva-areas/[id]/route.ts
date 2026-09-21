import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { z } from "zod";

const updateSevaAreaSchema = z.object({
  name: z.string().min(1).optional(),
  hindiName: z.string().optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  objectives: z.string().optional(),
  coverImage: z.string().optional(),
  published: z.boolean().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const { id } = await params;
  const existing = db.getSevaArea(id);
  if (!existing) {
    return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Not found" } }, { status: 404 });
  }

  const parsed = updateSevaAreaSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message } },
      { status: 400 }
    );
  }

  // Ensure unique slug if provided
  if (parsed.data.slug && parsed.data.slug !== existing.slug) {
    if (db.getSevaAreaBySlug(parsed.data.slug)) {
      return NextResponse.json(
        { success: false, error: { code: "CONFLICT", message: "Slug already exists" } },
        { status: 409 }
      );
    }
  }

  const updated = db.updateSevaArea(id, parsed.data);

  db.logAudit({
    actorType: "ADMIN",
    actorId: guard.admin!.id,
    actorName: guard.admin!.name,
    action: "SEVA_AREA_UPDATED",
    entity: "sevaArea",
    entityId: id,
  });

  return NextResponse.json({ success: true, sevaArea: updated });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const { id } = await params;
  const existing = db.getSevaArea(id);
  if (!existing) {
    return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Not found" } }, { status: 404 });
  }

  // Check dependencies before allowing delete
  // (In memory mock for this demo, campaigns don't throw, but normally they'd cascade or block)
  // To keep it simple, we just allow delete.
  db.deleteSevaArea(id);

  db.logAudit({
    actorType: "ADMIN",
    actorId: guard.admin!.id,
    actorName: guard.admin!.name,
    action: "SEVA_AREA_DELETED",
    entity: "sevaArea",
    entityId: id,
  });

  return NextResponse.json({ success: true });
}
