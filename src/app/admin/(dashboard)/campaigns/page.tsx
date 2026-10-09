import Link from "next/link";
import { db } from "@/lib/db";
import { LinkButton } from "@/components/ui/button";
import { StatusToggle } from "@/components/admin/status-toggle";
import { CampaignDeleteButton } from "@/components/admin/campaign-delete-button";

export default async function AdminCampaignsPage() {
  const campaigns = await db.listAllCampaigns();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif text-maroon">Campaigns</h1>
        <LinkButton href="/admin/campaigns/new" size="sm">
          Create Campaign
        </LinkButton>
      </div>

      <div className="mt-6 bg-surface border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream">
            <tr className="text-left">
              <th className="p-3 font-medium">Title</th>
              <th className="p-3 font-medium">Seva Area</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Updated</th>
              <th className="p-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c: any) => (
              <CampaignRow key={c.id} c={c} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

async function CampaignRow({ c }: { c: any }) {
  const sa = await db.getSevaArea(c.sevaAreaId, false);
  return (
    <tr className="border-t border-border">
      <td className="p-3">
        <Link href={`/campaigns/${c.slug}`} className="hover:text-primary" target="_blank">
          {c.title}
        </Link>
      </td>
      <td className="p-3 text-muted">{sa?.name ?? "—"}</td>
      <td className="p-3">
        <StatusToggle campaignId={c.id} status={c.status} />
      </td>
      <td className="p-3 text-muted">{new Date(c.updatedAt).toLocaleDateString("en-IN")}</td>
      <td className="p-3 text-right">
        <div className="flex items-center justify-end gap-3">
          <Link href={`/admin/campaigns/${c.id}`} className="text-primary text-sm hover:text-secondary">
            Edit
          </Link>
          <CampaignDeleteButton id={c.id} />
        </div>
      </td>
    </tr>
  );
}
