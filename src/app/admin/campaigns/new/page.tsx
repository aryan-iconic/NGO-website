import { db } from "@/lib/db";
import { CampaignCreateForm } from "@/components/admin/campaign-create-form";

export default async function NewCampaignPage() {
  const sevaAreas = db.listSevaAreas();
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-serif text-maroon">Create Campaign</h1>
      <p className="text-sm text-muted mt-1">
        Created as a Draft. Only admins can reach this screen — enforced by{" "}
        <code className="text-xs">requireAdmin()</code> on the API, not just this UI being hidden.
      </p>

      <CampaignCreateForm sevaAreas={sevaAreas} />
    </div>
  );
}
