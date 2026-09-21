import { db } from "@/lib/db";
import { formatPaise } from "@/lib/types";

export default function AdminRecurringPage() {
  const recurring = db.listAllRecurring();
  const activeTotal = recurring.filter((r) => r.status === "ACTIVE").reduce((s, r) => s + r.amountPaise, 0);

  return (
    <div>
      <h1 className="text-2xl font-serif text-maroon">Monthly Giving</h1>
      <p className="text-sm text-muted mt-1">
        {recurring.filter((r) => r.status === "ACTIVE").length} active subscriptions ·{" "}
        {formatPaise(activeTotal)}/month committed
      </p>

      <div className="mt-6 bg-surface border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream">
            <tr className="text-left">
              <th className="p-3 font-medium">Donor</th>
              <th className="p-3 font-medium">Campaign</th>
              <th className="p-3 font-medium">Amount / mo</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Started</th>
            </tr>
          </thead>
          <tbody>
            {recurring.map((r) => {
              const campaign = r.campaignId ? db.getCampaignById(r.campaignId) : null;
              return (
                <tr key={r.id} className="border-t border-border">
                  <td className="p-3">
                    {r.donorName}
                    <p className="text-xs text-muted">{r.donorEmail}</p>
                  </td>
                  <td className="p-3 text-muted">{campaign?.title ?? "General Fund"}</td>
                  <td className="p-3 font-medium">{formatPaise(r.amountPaise)}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-cream text-maroon">{r.status}</span>
                  </td>
                  <td className="p-3 text-muted">{new Date(r.startedAt).toLocaleDateString("en-IN")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {recurring.length === 0 && <p className="p-8 text-center text-muted">No recurring donations yet.</p>}
      </div>
    </div>
  );
}
