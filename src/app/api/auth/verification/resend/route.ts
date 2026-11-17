import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { sendUserEmailVerification } from "@/lib/user-email-verification";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const genericResponse = () => NextResponse.json({ success: true, message: "If this address needs verification, we’ve sent an email with the next steps." });

export async function POST(request: NextRequest) {
  const ipKey = request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`verification-resend-ip:${ipKey}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ success: false, error: { code: "RATE_LIMITED", message: "Too many requests. Please try again later." } }, { status: 429 });
  }

  const userId = await getCurrentUserId();
  let user = userId ? await db.findUserById(userId) : null;
  if (!userId) {
    const body = await request.json().catch(() => null);
    const parsed = z.object({ email: z.string().trim().email().max(254) }).safeParse(body);
    if (!parsed.success) return NextResponse.json({ success: false, error: { message: "Enter the email address used for your account." } }, { status: 400 });
    user = await db.findUserByEmail(parsed.data.email);
    // Do not reveal whether an address is registered or already verified.
    if (!user || (user.status !== "ACTIVE" && user.status !== "DELETED")) return genericResponse();
    if (!rateLimit(`verification-resend-email:${user.email.toLowerCase()}`, 3, 60 * 60 * 1000)) return genericResponse();
    if (user.status === "ACTIVE" && user.emailVerifiedAt) return genericResponse();
  } else {
    if (!user) return genericResponse();
    if (!rateLimit(`verification-resend-user:${userId}`, 3, 60 * 60 * 1000)) {
      return NextResponse.json({ success: false, error: { code: "RATE_LIMITED", message: "A verification email was recently sent. Please try again later." } }, { status: 429 });
    }
    if (user.status === "ACTIVE" && user.emailVerifiedAt) return NextResponse.json({ success: true, alreadyVerified: true });
  }

  const restoringAccount = user.status === "DELETED";
  const sent = await sendUserEmailVerification({ id: user.id, name: user.name, email: user.email }, { restoringAccount });
  if (!sent) {
    return NextResponse.json({ success: false, error: { code: "EMAIL_DELIVERY_FAILED", message: "We couldn’t send the email. Please contact the Trust to verify your account." } }, { status: 503 });
  }
  return userId ? NextResponse.json({ success: true, message: "Verification email sent." }) : genericResponse();
}
