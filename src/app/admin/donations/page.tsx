import { db } from "@/lib/db";
import { formatPaise } from "@/lib/types";

export default async function AdminDonationsPage() {
  const donations = await db.listAllDonations();

  return (
    <div>
      <h1 className="text-2xl font-serif text-maroon">Donations</h1>
      <p className="text-sm text-muted mt-1">{donations.length} total</p>

      <div className="mt-6 bg-surface border border-border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-cream">
            <tr className="text-left">
              <th className="p-3 font-medium">Receipt / Donation #</th>
              <th className="p-3 font-medium">Donor</th>
              <th className="p-3 font-medium">Campaign</th>
              <th className="p-3 font-medium">Amount</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {donations.map((d: any) => (
              <DonationRow key={d.id} d={d} />
            ))}
          </tbody>
        </table>
        {donations.length === 0 && (
          <p className="p-8 text-center text-muted">No donations yet.</p>
        )}
      </div>
    </div>
  );
}

async function DonationRow({ d }: { d: any }) {
  const campaign = d.campaignId ? await db.getCampaignById(d.campaignId) : null;
  const receipt = await db.getReceiptForDonation(d.id);
  return (
    <tr className="border-t border-border">
      <td className="p-3">
        <p className="font-mono text-xs">{d.donationNumber}</p>
        {receipt && <p className="font-mono text-[10px] text-muted">{receipt.receiptNumber}</p>}
      </td>
      <td className="p-3">
        {d.isAnonymous ? <span className="text-muted italic">Anonymous</span> : d.donorName}
        <p className="text-xs text-muted">{d.donorEmail}</p>
      </td>
      <td className="p-3 text-muted">{campaign?.title ?? "General Fund"}</td>
      <td className="p-3 font-medium">{formatPaise(d.totalPaise)}</td>
      <td className="p-3">
        <span className="px-2 py-0.5 rounded-full text-xs bg-success/10 text-success">
          {d.status}
        </span>
      </td>
      <td className="p-3 text-muted">{new Date(d.createdAt).toLocaleDateString("en-IN")}</td>
    </tr>
  );
}
