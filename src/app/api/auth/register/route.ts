import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/schemas";
import { sendUserEmailVerification } from "@/lib/user-email-verification";

export async function POST(req: NextRequest) {
  const parsed = registerSchema.safeParse(await req.json());
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
