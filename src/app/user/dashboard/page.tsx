import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatPaise } from "@/lib/types";
import { LinkButton } from "@/components/ui/button";
import { RecurringList } from "@/components/user/recurring-list";

export default async function UserDashboardPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const user = await db.findUserById(userId)!;
  const donations = await db.listDonationsForUser(userId);
  const totalGiven = donations.reduce((s: number, d: any) => s + d.totalPaise, 0);

  return (
    <div className="container-app py-14">
      <h1 className="text-3xl">Welcome back, {user.name.split(" ")[0]}</h1>
      <p className="text-muted mt-1">Here&apos;s a summary of your giving.</p>

      <div className="mt-8 grid sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-lg border border-border bg-surface">
          <p className="text-xs text-muted">Total Given</p>
          <p className="mt-2 text-2xl font-serif text-maroon">{formatPaise(totalGiven)}</p>
        </div>
        <div className="p-5 rounded-lg border border-border bg-surface">
          <p className="text-xs text-muted">Donations Made</p>
          <p className="mt-2 text-2xl font-serif text-maroon">{donations.length}</p>
        </div>
        <div className="p-5 rounded-lg border border-border bg-surface">
          <p className="text-xs text-muted">Member Since</p>
          <p className="mt-2 text-2xl font-serif text-maroon">
            {new Date(user.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
          </p>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-xl mb-4">Monthly Giving</h2>
        <RecurringList />
      </div>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="text-xl">Recent Donations</h2>
        <LinkButton href="/campaigns" size="sm" variant="outline">
          Explore Campaigns
        </LinkButton>
      </div>

      {donations.length === 0 ? (
        <p className="mt-6 text-muted">
          You haven&apos;t made a donation yet. Your donation history and receipts will appear here.
        </p>
      ) : (
        <div className="mt-4 border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-cream">
              <tr className="text-left">
                <th className="p-3 font-medium">Donation #</th>
                <th className="p-3 font-medium">Date</th>
                <th className="p-3 font-medium">Amount</th>
                <th className="p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {donations.map((d: any) => (
                <tr key={d.id} className="border-t border-border">
                  <td className="p-3 font-mono text-xs">{d.donationNumber}</td>
                  <td className="p-3 text-muted">{new Date(d.createdAt).toLocaleDateString("en-IN")}</td>
                  <td className="p-3 font-medium">{formatPaise(d.totalPaise)}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-success/10 text-success">
                      {d.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
