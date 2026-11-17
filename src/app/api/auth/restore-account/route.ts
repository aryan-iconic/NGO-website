import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createUserSession, verifyEmailVerificationToken } from "@/lib/auth";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({ token: z.string().min(1), password: z.string().min(12).max(128), confirmPassword: z.string().min(1) })
  .refine((value) => value.password === value.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match." });

export async function POST(request: NextRequest) {
  const ipKey = request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`restore-account:${ipKey}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ success: false, error: { message: "Too many attempts. Please try again later." } }, { status: 429 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ success: false, error: { message: parsed.error.issues[0]?.message || "Choose a password of at least 12 characters." } }, { status: 400 });
  const claims = verifyEmailVerificationToken(parsed.data.token);
  if (!claims) return NextResponse.json({ success: false, error: { message: "This recovery link is invalid or expired. Request a new one." } }, { status: 400 });

  try {
    const restored = await db.restoreDeletedUser(claims.userId, claims.email, parsed.data.password);
    if (!restored) return NextResponse.json({ success: false, error: { message: "This account is not awaiting restoration. Request a new recovery link if needed." } }, { status: 400 });
    await createUserSession(restored.user.id, restored.user.name);
    return NextResponse.json({ success: true, linkedDonations: restored.linkedDonations });
  } catch (error) {
    console.error("Could not restore donor account:", error);
    return NextResponse.json({ success: false, error: { message: "Could not restore your account." } }, { status: 500 });
  }
}
