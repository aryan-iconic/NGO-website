import { redirect } from "next/navigation";
import type { AdminRole } from "@/lib/db";
import { db } from "@/lib/db";
import { getCurrentAdminId } from "@/lib/auth";

export async function requireAdminPage(roles: AdminRole[] = ["SUPER_ADMIN", "ADMIN"]) {
  const id = await getCurrentAdminId();
  if (!id) redirect("/admin/login");
  const admin = await db.findAdminById(id);
  if (!admin) redirect("/admin/login");
  if (admin.mustChangePassword) redirect("/admin/change-password");
  if (!roles.includes(admin.role)) redirect(admin.role === "FINANCE_ADMIN" ? "/admin/donations" : "/admin/campaigns");
  return admin;
}
