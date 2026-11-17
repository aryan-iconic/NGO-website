import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/schemas";
import { createUserSession } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const emailKey = req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`login:${emailKey}`, 10, 15 * 60 * 1000)) return NextResponse.json({ success: false, error: { code: "RATE_LIMITED", message: "Too many sign-in attempts. Please wait and try again." } }, { status: 429 });
  const parsed = loginSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: "Enter a valid email and password." } },
      { status: 400 }
    );
  }
  const user = await db.verifyUserPassword(parsed.data.email, parsed.data.password);
  if (!user) {
    // Generic message — avoids account enumeration.
    return NextResponse.json(
      { success: false, error: { code: "INVALID_CREDENTIALS", message: "Incorrect email or password." } },
      { status: 401 }
    );
  }

  if (!user.emailVerifiedAt) {
    return NextResponse.json({ success: true, verificationRequired: true, email: user.email });
  }

  await db.claimGuestDonationsForVerifiedUser(user.id);
  await createUserSession(user.id, user.name);
  return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
}
