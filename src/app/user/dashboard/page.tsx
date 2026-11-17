import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatPaise } from "@/lib/types";
import { LinkButton } from "@/components/ui/button";
import { RecurringList } from "@/components/user/recurring-list";
import { ResendVerificationButton } from "@/components/auth/resend-verification-button";

export default async function UserDashboardPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const user = await db.findUserById(userId);
  if (!user) redirect("/login");
  if (user.emailVerifiedAt) await db.claimGuestDonationsForVerifiedUser(userId);
  const donations = user.emailVerifiedAt ? await db.listDonationsForUser(userId, user.email) : [];
  const completedDonations = donations.filter((donation: any) => donation.status === "SUCCESS");
  const totalGiven = completedDonations.reduce((sum: number, donation: any) => sum + donation.totalPaise, 0);

  return (
    <div className="container-app py-14">
      <h1 className="text-3xl">Welcome back, {user.name.split(" ")[0]}</h1>
      <p className="text-muted mt-1">Here&apos;s a summary of your giving.</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <LinkButton href="/user/settings" size="sm" variant="outline">Account settings</LinkButton>
        <LinkButton href="/user/subscriptions" size="sm" variant="outline">Monthly subscriptions</LinkButton>
      </div>

      {!user.emailVerifiedAt ? (
        <section className="mt-8 rounded-lg border border-border bg-surface p-6">
          <h2 className="text-xl">Verify your email to view donation history</h2>
          <p className="mt-2 text-muted">We only link guest donations made with {user.email} after you verify that you own this email address. Until then, donation totals and history are hidden.</p>
          <ResendVerificationButton />
        </section>
      ) : <>

      <div className="mt-8 grid sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-lg border border-border bg-surface">
          <p className="text-xs text-muted">Total Given</p>
          <p className="mt-2 text-2xl font-serif text-maroon">{formatPaise(totalGiven)}</p>
        </div>
        <div className="p-5 rounded-lg border border-border bg-surface">
          <p className="text-xs text-muted">Completed Donations</p>
          <p className="mt-2 text-2xl font-serif text-maroon">{completedDonations.length}</p>
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
        <h2 className="text-xl">Donation History</h2>
        <LinkButton href="/campaigns" size="sm" variant="outline">
          Explore Campaigns
        </LinkButton>
      </div>

      {donations.length === 0 ? (
        <p className="mt-6 text-muted">
          No donations using {user.email} are linked to this account yet. Guest donations made with this exact email will appear here after email verification.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[850px] text-sm">
            <thead className="bg-cream">
              <tr className="text-left">
                <th className="p-3 font-medium">Donation #</th>
                <th className="p-3 font-medium">Receipt #</th>
                <th className="p-3 font-medium">Date</th>
                <th className="p-3 font-medium">Amount</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Payment details</th>
              </tr>
            </thead>
            <tbody>
              {donations.map((d: any) => (
                <tr key={d.id} className="border-t border-border">
                  <td className="p-3 font-mono text-xs">{d.donationNumber}</td>
                  <td className="p-3 font-mono text-xs">{d.receipt?.receiptNumber ?? "—"}{d.receipt?.voidedAt ? " (voided)" : ""}</td>
                  <td className="p-3 text-muted">{new Date(d.createdAt).toLocaleDateString("en-IN")}</td>
                  <td className="p-3 font-medium">{formatPaise(d.totalPaise)}</td>
                  <td className="p-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${d.status === "SUCCESS" ? "bg-success/10 text-success" : d.status === "FAILED" ? "bg-red/10 text-red" : "bg-cream text-muted"}`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="p-3">
                    {d.payments?.map((payment: any, index: number) => (
                      <div key={payment.gatewayPaymentId || `${payment.status}-${index}`} className="text-xs">
                        {payment.gatewayPaymentId && <p className="font-mono">Payment ID: {payment.gatewayPaymentId}</p>}
                        {payment.method && <p className="text-muted">Method: {payment.method}</p>}
                        {payment.paidAt && <p className="text-muted">Paid: {new Date(payment.paidAt).toLocaleDateString("en-IN")}</p>}
                        {!payment.gatewayPaymentId && <p className="text-muted">{payment.status}</p>}
                      </div>
                    ))}
                    {(!d.payments || d.payments.length === 0) && <span className="text-muted">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </>}
    </div>
  );
}
