import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { z } from "zod";

const createSevaAreaSchema = z.object({
  name: z.string().min(1),
  hindiName: z.string().optional(),
  slug: z.string().min(1),
  description: z.string().optional(),
  objectives: z.string().optional(),
  coverImage: z.string().optional(),
  published: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
});

export async function GET() {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;
  return NextResponse.json({ success: true, sevaAreas: await db.listSevaAreas() });
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const parsed = createSevaAreaSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message } },
      { status: 400 }
    );
  }

  // Ensure unique slug
  if (await db.getSevaAreaBySlug(parsed.data.slug)) {
    return NextResponse.json(
      { success: false, error: { code: "CONFLICT", message: "Slug already exists" } },
      { status: 409 }
    );
  }

  const sevaArea = await db.createSevaArea(parsed.data);
  
  await db.logAudit({
    actorType: "ADMIN",
    actorId: guard.admin!.id,
    actorName: guard.admin!.name,
    action: "SEVA_AREA_CREATED",
    entity: "sevaArea",
    entityId: sevaArea.id,
  });

  return NextResponse.json({ success: true, sevaArea });
}
