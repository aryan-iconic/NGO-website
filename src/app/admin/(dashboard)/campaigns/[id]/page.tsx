import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatPaise } from "@/lib/types";
import { StatusToggle } from "@/components/admin/status-toggle";
import { CampaignEditForm } from "@/components/admin/campaign-edit-form";
import { CampaignDeleteButton } from "@/components/admin/campaign-delete-button";
import { Eye, ArrowLeft } from "lucide-react";

export default async function AdminCampaignEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const campaign = await db.getCampaignById(id);
  if (!campaign) notFound();

  const financials = await db.getCampaignFinancials(id);
  const donations = (await db.listAllDonations()).filter((d: any) => d.campaignId === id);
  const totalReceived = donations.reduce((s: number, d: any) => s + d.totalPaise, 0);
  const products = await db.getCampaignProducts(id);
  const sevaAreas = await db.listSevaAreas();

  return (
    <div className="max-w-3xl space-y-10">
      <div className="mb-4">
        <Link href="/admin/campaigns" className="text-sm text-muted hover:text-maroon flex items-center gap-1.5 w-fit">
          <ArrowLeft size={16} /> Back to Campaigns
        </Link>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif text-maroon">{campaign.title}</h1>
          <p className="text-sm text-muted mt-1">/campaigns/{campaign.slug}</p>
        </div>
        <div className="flex items-center gap-4">
          <a
            href={`/api/admin/preview?type=campaign&slug=${campaign.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm font-medium text-maroon hover:underline"
          >
            <Eye size={16} /> Preview
          </a>
          <CampaignDeleteButton id={campaign.id} />
          <StatusToggle campaignId={campaign.id} status={campaign.status} />
        </div>
      </div>

      <CampaignEditForm campaign={campaign} sevaAreas={sevaAreas} />

    </div>
  );
}
