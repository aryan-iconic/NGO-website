import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyPasswordResetToken } from "@/lib/auth";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({ token: z.string().min(1), password: z.string().min(12).max(128), confirmPassword: z.string().min(1) })
  .refine((value) => value.password === value.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match." });

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`password-reset-finish:${ip}`, 5, 60 * 60 * 1000)) return NextResponse.json({ success: false, error: { message: "Too many attempts. Try again later." } }, { status: 429 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ success: false, error: { message: parsed.error.issues[0]?.message || "Choose a password of at least 12 characters." } }, { status: 400 });
  const claims = verifyPasswordResetToken(parsed.data.token);
  if (!claims) return NextResponse.json({ success: false, error: { message: "This password reset link is invalid or expired. Request a new one." } }, { status: 400 });

  const user = await db.findUserById(claims.userId);
  if (!user || user.status !== "ACTIVE" || !user.emailVerifiedAt || user.email.toLowerCase() !== claims.email || user.sessionVersion !== claims.sessionVersion) {
    return NextResponse.json({ success: false, error: { message: "This password reset link has expired or was already used. Request a new one." } }, { status: 400 });
  }

  try {
    await db.updateUserPassword(user.id, parsed.data.password);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Could not reset donor password:", error);
    return NextResponse.json({ success: false, error: { message: "Could not reset your password." } }, { status: 500 });
  }
}
