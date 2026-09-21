import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  eventDate: z.string().min(1),
  venue: z.string().optional(),
  location: z.string().optional(),
  registrationEnabled: z.boolean().default(true),
  status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"]).default("DRAFT"),
});

function slugify(title: string) {
  return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function GET() {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;
  return NextResponse.json({ success: true, events: await db.listEvents() });
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
  while ((await db.listEvents()).some((e: any) => e.slug === slug)) slug = `${baseSlug}-${++n}`;

  const event = await db.createEvent({ ...parsed.data, slug });

  await db.logAudit({
    actorType: "ADMIN",
    actorId: guard.admin!.id,
    actorName: guard.admin!.name,
    action: "EVENT_CREATED",
    entity: "event",
    entityId: event.id,
  });

  return NextResponse.json({ success: true, event });
}
