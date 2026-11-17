import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { sendUserPasswordReset } from "@/lib/user-email-verification";

const schema = z.object({ email: z.string().trim().email().max(254) });
const generic = () => NextResponse.json({ success: true, message: "If a verified account uses that email, a password reset link will arrive shortly." });

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`password-reset-ip:${ip}`, 5, 60 * 60 * 1000)) return NextResponse.json({ success: false, error: { message: "Too many requests. Try again later." } }, { status: 429 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ success: false, error: { message: "Enter a valid email address." } }, { status: 400 });
  const email = parsed.data.email.toLowerCase();
  if (!rateLimit(`password-reset-email:${email}`, 3, 60 * 60 * 1000)) return generic();

  const user = await db.findUserByEmail(email);
  if (!user || user.status !== "ACTIVE" || !user.emailVerifiedAt) return generic();
  const sent = await sendUserPasswordReset({ id: user.id, name: user.name, email: user.email, sessionVersion: user.sessionVersion });
  if (!sent) return NextResponse.json({ success: false, error: { message: "We couldn’t send the reset email. Please contact the Trust for help." } }, { status: 503 });
  return generic();
}
