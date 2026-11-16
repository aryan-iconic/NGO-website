import { db } from "@/lib/db";
import { DonationsManager } from "@/components/admin/donations-manager";

export default async function AdminDonationsPage() {
  const donations = await db.listAllDonations();

  return <DonationsManager donations={donations} />;
}
