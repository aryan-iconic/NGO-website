import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { z } from "zod";
import { randomUUID } from "node:crypto";

const schema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  eventDate: z.string().min(1),
  venue: z.string().optional(),
  location: z.string().optional(),
  registrationEnabled: z.boolean().default(true),
  status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"]).default("DRAFT"),
  coverImage: z.string().optional().nullable(),
});

function slugify(title: string) {
  return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function GET() {
  const guard = await requireAdmin(["SUPER_ADMIN", "ADMIN", "CONTENT_ADMIN"]);
  if (guard.error) return guard.error;
  return NextResponse.json({ success: true, events: await db.listEvents() });
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin(["SUPER_ADMIN", "ADMIN", "CONTENT_ADMIN"]);
  if (guard.error) return guard.error;

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message } },
      { status: 400 }
    );
  }

  const existingEvents = await db.listEvents();
  const existingSlugs = new Set(existingEvents.map((event: { slug: string }) => event.slug));
  const baseSlug = slugify(parsed.data.title) || `event-${randomUUID().slice(0, 8)}`;
  let slug = baseSlug;
  let n = 1;
  while (existingSlugs.has(slug)) slug = `${baseSlug}-${++n}`;

  const event = await db.createEvent({ ...parsed.data, slug });

  await db.logAudit({
    actorType: "ADMIN",
    actorId: guard.admin!.id,
    actorName: guard.admin!.name,
    action: "EVENT_CREATED",
    entity: "event",
    entityId: event.id,
  });

  revalidatePath("/events");
    revalidatePath("/");
    return NextResponse.json({ success: true, event });
}
