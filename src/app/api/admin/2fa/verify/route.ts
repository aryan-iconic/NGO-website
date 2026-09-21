import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { verifyTotpCode } from "@/lib/totp";
import { z } from "zod";

const schema = z.object({ code: z.string().min(6).max(6) });

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;
  const admin = guard.admin!;

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success || !admin.twoFactorPendingSecret) {
    return NextResponse.json(
      { success: false, error: { code: "SETUP_NOT_STARTED", message: "Start 2FA setup before verifying a code." } },
      { status: 400 }
    );
  }

  const valid = verifyTotpCode(admin.email, admin.twoFactorPendingSecret, parsed.data.code);
  if (!valid) {
    return NextResponse.json(
      { success: false, error: { code: "INVALID_CODE", message: "That code didn't match. Check your authenticator app and try again." } },
      { status: 400 }
    );
  }

  db.confirmTwoFactor(admin.id);
  db.logAudit({
    actorType: "ADMIN",
    actorId: admin.id,
    actorName: admin.name,
    action: "TWO_FACTOR_ENABLED",
    entity: "admin",
    entityId: admin.id,
  });

  return NextResponse.json({ success: true });
}
