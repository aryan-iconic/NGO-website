import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentAdminId } from "@/lib/auth";

// Every /api/admin/* route calls this first. A non-admin — including a
// normal logged-in user — gets 403, even if they craft the request by hand.
// This is the actual backend enforcement behind Rule 1 ("only admins can
// create/edit/delete campaigns"), not just a hidden UI button.
export async function requireAdmin() {
  const adminId = await getCurrentAdminId();
  if (!adminId) {
    return { error: NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Admin sign-in required." } }, { status: 401 }) };
  }
  const admin = await db.findAdminById(adminId);
  if (!admin) {
    return { error: NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Not authorized." } }, { status: 403 }) };
  }
  return { admin };
}
