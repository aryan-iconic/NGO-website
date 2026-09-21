import { db } from "@/lib/db";
import { formatPaise } from "@/lib/types";

export default async function AdminDashboard() {
  const campaigns = await db.listAllCampaigns();
  const donations = await db.listAllDonations();
  const totalPaise = donations.reduce((s: number, d: any) => s + d.totalPaise, 0);
  const volunteers = await db.listVolunteerApplications();

  const stats = [
    { label: "Total Donations (all-time)", value: formatPaise(totalPaise) },
    { label: "Donation Count", value: String(donations.length) },
    { label: "Active Campaigns", value: String(campaigns.filter((c: any) => c.status === "ACTIVE").length) },
    { label: "Volunteer Applications", value: String(volunteers.length) },
  ];

  return (
    <div>
      <h1 className="text-2xl font-serif text-maroon">Dashboard</h1>
      <p className="text-sm text-muted mt-1">
        Financial totals shown here are internal — never returned by public campaign APIs.
      </p>

      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="p-5 rounded-lg bg-surface border border-border">
            <p className="text-xs text-muted">{s.label}</p>
            <p className="mt-2 text-2xl font-serif text-maroon">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 p-5 rounded-lg bg-surface border border-border">
        <h2 className="text-base font-semibold text-maroon mb-4">Recent Campaigns</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted border-b border-border">
              <th className="pb-2 font-medium">Title</th>
              <th className="pb-2 font-medium">Category</th>
              <th className="pb-2 font-medium">Status</th>
              <th className="pb-2 font-medium">Updated</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c: any) => (
              <DashboardCampaignRow key={c.id} c={c} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

async function DashboardCampaignRow({ c }: { c: any }) {
  const category = await db.getCategory(c.categoryId);
  return (
    <tr className="border-b border-border/60 last:border-none">
      <td className="py-3">{c.title}</td>
      <td className="py-3 text-muted">{category?.name ?? "—"}</td>
      <td className="py-3">
        <span className="px-2 py-0.5 rounded-full text-xs bg-cream text-maroon">
          {c.status}
        </span>
      </td>
      <td className="py-3 text-muted">{new Date(c.updatedAt).toLocaleDateString("en-IN")}</td>
    </tr>
  );
}
