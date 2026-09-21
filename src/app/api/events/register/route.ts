import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  eventSlug: z.string(),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message } },
      { status: 400 }
    );
  }
  const event = db.getEventBySlug(parsed.data.eventSlug);
  if (!event || !event.registrationEnabled) {
    return NextResponse.json(
      { success: false, error: { code: "REGISTRATION_CLOSED", message: "Registration is not open for this event." } },
      { status: 400 }
    );
  }
  const result = db.registerForEvent(event.id, parsed.data.name, parsed.data.email, parsed.data.phone);
  if (result.alreadyRegistered) {
    return NextResponse.json(
      { success: false, error: { code: "ALREADY_REGISTERED", message: "This email is already registered for this event." } },
      { status: 409 }
    );
  }
  return NextResponse.json({ success: true });
}
