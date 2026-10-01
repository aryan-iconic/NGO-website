import { db } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CampaignCreateForm } from "@/components/admin/campaign-create-form";

export default async function NewCampaignPage() {
  const sevaAreas = await db.listSevaAreas();
  return (
    <div className="max-w-2xl">
      <div className="mb-4">
        <Link href="/admin/campaigns" className="text-sm text-muted hover:text-maroon flex items-center gap-1.5 w-fit">
          <ArrowLeft size={16} /> Back to Campaigns
        </Link>
      </div>
      <h1 className="text-2xl font-serif text-maroon">Create Campaign</h1>
      <p className="text-sm text-muted mt-1">
        Created as a Draft. Only admins can reach this screen — enforced by{" "}
        <code className="text-xs">requireAdmin()</code> on the API, not just this UI being hidden.
      </p>

      <CampaignCreateForm sevaAreas={sevaAreas} />
    </div>
  );
}
