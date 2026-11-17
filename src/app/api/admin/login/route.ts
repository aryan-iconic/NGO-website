import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/schemas";
import { createAdminPasswordChangeSession, createAdminSession, signTwoFactorPending } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ipKey = req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`admin-login:${ipKey}`, 8, 15 * 60 * 1000)) return NextResponse.json({ success: false, error: { code: "RATE_LIMITED", message: "Too many sign-in attempts. Please wait and try again." } }, { status: 429 });
  const parsed = loginSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: "Enter a valid email and password." } },
      { status: 400 }
    );
  }
  const admin = await db.verifyAdminPassword(parsed.data.email, parsed.data.password);
  if (!admin) {
    return NextResponse.json(
      { success: false, error: { code: "INVALID_CREDENTIALS", message: "Incorrect email or password." } },
      { status: 401 }
    );
  }

  if (admin.twoFactorEnabled) {
    // Password verified, but no session yet — the client must submit a valid
    // TOTP code to /api/admin/2fa/challenge along with this pending token.
    const pendingToken = signTwoFactorPending(admin.id);
    return NextResponse.json({ success: true, requires2FA: true, pendingToken });
  }

  if (admin.mustChangePassword) {
    await createAdminPasswordChangeSession(admin.id);
    return NextResponse.json({ success: true, requires2FA: false, mustChangePassword: true });
  }

  await createAdminSession(admin.id);
  return NextResponse.json({ success: true, requires2FA: false, mustChangePassword: false, admin: { id: admin.id, name: admin.name, role: admin.role } });
}
