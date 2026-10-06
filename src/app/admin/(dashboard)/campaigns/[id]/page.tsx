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

      <section className="p-5 rounded-lg border border-border bg-cream">
        <h2 className="text-sm font-semibold text-maroon">
          Financials — admin only, never returned by public APIs
        </h2>
        <div className="mt-3 grid sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted">Internal target</p>
            <p className="font-medium">
              {financials?.internalTargetPaise ? formatPaise(financials.internalTargetPaise) : "—"}
            </p>
          </div>
          <div>
            <p className="text-muted">Received (this platform)</p>
            <p className="font-medium">{formatPaise(totalReceived)}</p>
          </div>
          <div>
            <p className="text-muted">Donation count</p>
            <p className="font-medium">{donations.length}</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-serif text-maroon mb-3">Products</h2>
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-cream">
              <tr className="text-left">
                <th className="p-3 font-medium">Name</th>
                <th className="p-3 font-medium">Price</th>
                <th className="p-3 font-medium">Sponsored</th>
                <th className="p-3 font-medium">Limit</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p: any) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="p-3">{p.name}</td>
                  <td className="p-3">{formatPaise(p.pricePaise)}</td>
                  <td className="p-3">{p.quantitySponsored}</td>
                  <td className="p-3 text-muted">{p.quantityLimit ?? "No limit"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
