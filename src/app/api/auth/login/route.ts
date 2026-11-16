import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/schemas";
import { createUserSession } from "@/lib/auth";
import { sendUserEmailVerification } from "@/lib/user-email-verification";

export async function POST(req: NextRequest) {
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
    const emailSent = await sendUserEmailVerification({ id: user.id, name: user.name, email: user.email });
    if (!emailSent) {
      return NextResponse.json(
        { success: false, error: { code: "VERIFICATION_EMAIL_FAILED", message: "Your account exists but its email is not verified. We couldn’t send a verification link; please contact the Trust." } },
        { status: 503 },
      );
    }
    return NextResponse.json({ success: true, verificationRequired: true, email: user.email });
  }

  await db.claimGuestDonationsForVerifiedUser(user.id);
  await createUserSession(user.id, user.name);
  return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
}
