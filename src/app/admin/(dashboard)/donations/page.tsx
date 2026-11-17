import { db } from "@/lib/db";
import { DonationsManager } from "@/components/admin/donations-manager";
import { requireAdminPage } from "@/lib/require-admin-page";

export default async function AdminDonationsPage() {
  await requireAdminPage(["SUPER_ADMIN", "ADMIN", "FINANCE_ADMIN"]);
  const donations = await db.listAllDonations();

  return <DonationsManager donations={donations} />;
}
