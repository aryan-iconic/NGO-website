import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyEmailVerificationToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null) as { token?: unknown } | null;
  if (!body || typeof body.token !== "string") {
    return NextResponse.json({ success: false, error: { message: "Invalid verification link." } }, { status: 400 });
  }

  const claims = verifyEmailVerificationToken(body.token);
  if (!claims) {
    return NextResponse.json({ success: false, error: { message: "This verification link is invalid or expired. Log in to request a new one." } }, { status: 400 });
  }

  try {
    const result = await db.verifyUserEmailAndClaimGuestDonations(claims.userId, claims.email);
    if (!result.verified) {
      return NextResponse.json({ success: false, error: { message: "This verification link no longer matches the account." } }, { status: 400 });
    }
    return NextResponse.json({ success: true, linkedDonations: result.linkedDonations });
  } catch (error) {
    console.error("Email verification failed:", error);
    return NextResponse.json({ success: false, error: { message: "Could not verify your email. Please try again." } }, { status: 500 });
  }
}
