import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { volunteerSchema } from "@/lib/schemas";

export async function POST(req: NextRequest) {
  const parsed = volunteerSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message } },
      { status: 400 }
    );
  }
  const app = db.createVolunteerApplication(parsed.data);
  return NextResponse.json({ success: true, applicationId: app.id });
}
