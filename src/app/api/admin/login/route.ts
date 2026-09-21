import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/schemas";
import { createAdminSession, signTwoFactorPending } from "@/lib/auth";

export async function POST(req: NextRequest) {
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

  await createAdminSession(admin.id);
  return NextResponse.json({ success: true, requires2FA: false, admin: { id: admin.id, name: admin.name, role: admin.role } });
}
