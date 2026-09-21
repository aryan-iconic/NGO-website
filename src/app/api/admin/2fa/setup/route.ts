import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { generateSecret, generateQrCodeDataUrl } from "@/lib/totp";

export async function POST() {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;
  const admin = guard.admin!;

  const secret = generateSecret();
  db.setTwoFactorPendingSecret(admin.id, secret);
  const qrCodeDataUrl = await generateQrCodeDataUrl(admin.email, secret);

  return NextResponse.json({ success: true, secret, qrCodeDataUrl });
}
