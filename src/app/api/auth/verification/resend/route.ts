import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { sendUserEmailVerification } from "@/lib/user-email-verification";

export async function POST() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ success: false, error: { message: "Please log in first." } }, { status: 401 });

  const user = await db.findUserById(userId);
  if (!user) return NextResponse.json({ success: false, error: { message: "Account not found." } }, { status: 404 });
  if (user.emailVerifiedAt) return NextResponse.json({ success: true, alreadyVerified: true });

  const sent = await sendUserEmailVerification({ id: user.id, name: user.name, email: user.email });
  if (!sent) {
    return NextResponse.json({ success: false, error: { message: "Could not send the verification email. Please try again later." } }, { status: 503 });
  }
  return NextResponse.json({ success: true });
}
