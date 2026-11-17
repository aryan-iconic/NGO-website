import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";

export async function GET() {
  const guard = await requireAdmin(["SUPER_ADMIN", "ADMIN", "FINANCE_ADMIN"]);
  if (guard.error) return guard.error;
  return NextResponse.json({ success: true, donations: await db.listAllDonations() });
}
