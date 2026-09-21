import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createAdminSession, verifyTwoFactorPending } from "@/lib/auth";
import { verifyTotpCode } from "@/lib/totp";
import { z } from "zod";

const schema = z.object({ pendingToken: z.string(), code: z.string().min(6).max(6) });

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: "Enter the 6-digit code from your authenticator app." } },
      { status: 400 }
    );
  }

  const adminId = verifyTwoFactorPending(parsed.data.pendingToken);
  if (!adminId) {
    return NextResponse.json(
      { success: false, error: { code: "EXPIRED", message: "This login attempt expired. Please sign in again." } },
      { status: 401 }
    );
  }

  const admin = db.findAdminById(adminId);
  if (!admin || !admin.twoFactorEnabled || !admin.twoFactorSecret) {
    return NextResponse.json(
      { success: false, error: { code: "INVALID_STATE", message: "Two-factor authentication is not set up for this account." } },
      { status: 400 }
    );
  }

  const valid = verifyTotpCode(admin.email, admin.twoFactorSecret, parsed.data.code);
  if (!valid) {
    return NextResponse.json(
      { success: false, error: { code: "INVALID_CODE", message: "Incorrect code. Please try again." } },
      { status: 401 }
    );
  }

  await createAdminSession(admin.id);
  return NextResponse.json({ success: true, admin: { id: admin.id, name: admin.name, role: admin.role } });
}
