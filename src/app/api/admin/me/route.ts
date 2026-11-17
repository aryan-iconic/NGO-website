import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";

export async function GET() {
  const guard = await requireAdmin(["SUPER_ADMIN", "ADMIN", "CONTENT_ADMIN", "FINANCE_ADMIN"]);
  if (guard.error) return guard.error;
  const admin = guard.admin!;
  return NextResponse.json({
    success: true,
    admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role, twoFactorEnabled: admin.twoFactorEnabled, mustChangePassword: admin.mustChangePassword },
  });
}
