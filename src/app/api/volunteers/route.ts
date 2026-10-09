import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { volunteerSchema } from "@/lib/schemas";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const parsed = volunteerSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message } },
      { status: 400 }
    );
  }
  const email = parsed.data.email;
  const existing = await prisma.volunteerApplication.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json({ success: false, error: { code: "ALREADY_APPLIED", message: "An application with this email address has already been submitted." } }, { status: 409 });
  }

  try {
    const app = await db.createVolunteerApplication(parsed.data);
    return NextResponse.json({ success: true, applicationId: app.id });
  } catch (error) {
    // The unique database constraint also closes the race between simultaneous submissions.
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return NextResponse.json({ success: false, error: { code: "ALREADY_APPLIED", message: "An application with this email address has already been submitted." } }, { status: 409 });
    }
    throw error;
  }
}
