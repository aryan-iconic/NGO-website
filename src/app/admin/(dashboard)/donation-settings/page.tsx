import { DonationRulesForm } from "@/components/admin/donation-rules-form";
import { requireAdminPage } from "@/lib/require-admin-page";

export default async function AdminDonationSettingsPage() {
  await requireAdminPage(["SUPER_ADMIN", "ADMIN", "FINANCE_ADMIN"]);
  return <DonationRulesForm />;
}
