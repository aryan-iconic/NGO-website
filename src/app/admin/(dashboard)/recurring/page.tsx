import { requireAdminPage } from "@/lib/require-admin-page";
import { MonthlyGivingManager } from "@/components/admin/monthly-giving-manager";

export default async function AdminRecurringPage() {
  await requireAdminPage(["SUPER_ADMIN", "ADMIN", "FINANCE_ADMIN"]);
  return <MonthlyGivingManager />;
}
