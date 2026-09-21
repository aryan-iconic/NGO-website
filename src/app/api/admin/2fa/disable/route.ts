import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";

export async function POST() {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;
  const admin = guard.admin!;

  await db.disableTwoFactor(admin.id);
  await db.logAudit({
    actorType: "ADMIN",
    actorId: admin.id,
    actorName: admin.name,
    action: "TWO_FACTOR_DISABLED",
    entity: "admin",
    entityId: admin.id,
  });

  return NextResponse.json({ success: true });
}
