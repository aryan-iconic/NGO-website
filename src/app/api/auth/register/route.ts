import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/schemas";
import { sendUserEmailVerification } from "@/lib/user-email-verification";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ipKey = req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`register:${ipKey}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ success: false, error: { code: "RATE_LIMITED", message: "Too many account creation attempts. Please try again later." } }, { status: 429 });
  }
  const parsed = registerSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message } },
      { status: 400 }
    );
  }
  const { name, email, phone, password } = parsed.data;

  if (await db.findUserByEmail(email)) {
    return NextResponse.json(
      { success: false, error: { code: "EMAIL_IN_USE", message: "An account with this email already exists." } },
      { status: 409 }
    );
  }

  const user = await db.createUser(name, email, phone, password);
  const emailSent = await sendUserEmailVerification({ id: user.id, name: user.name, email: user.email });
  if (!emailSent) {
    await db.deleteUnverifiedUser(user.id);
    return NextResponse.json(
      { success: false, error: { code: "VERIFICATION_EMAIL_FAILED", message: "We couldn’t send the verification email. Check the email settings and try creating your account again." } },
      { status: 503 },
    );
  }

  return NextResponse.json({ success: true, verificationRequired: true, email: user.email });
}
