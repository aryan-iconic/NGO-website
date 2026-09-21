import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  eventDate: z.string().optional(),
  venue: z.string().optional(),
  location: z.string().optional(),
  registrationEnabled: z.boolean().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"]).optional(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;
  const { id } = await params;
  const event = db.getEventById(id);
  if (!event) return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Event not found." } }, { status: 404 });
  return NextResponse.json({ success: true, event });
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
  const updated = db.updateEvent(id, parsed.data);
  if (!updated) return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Event not found." } }, { status: 404 });

  db.logAudit({
    actorType: "ADMIN",
    actorId: guard.admin!.id,
    actorName: guard.admin!.name,
    action: "EVENT_UPDATED",
    entity: "event",
    entityId: updated.id,
  });

  return NextResponse.json({ success: true, event: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;
  const { id } = await params;
  const ok = db.deleteEvent(id);
  if (!ok) return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Event not found." } }, { status: 404 });

  db.logAudit({
    actorType: "ADMIN",
    actorId: guard.admin!.id,
    actorName: guard.admin!.name,
    action: "EVENT_DELETED",
    entity: "event",
    entityId: id,
  });

  return NextResponse.json({ success: true });
}
