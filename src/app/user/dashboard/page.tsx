import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatPaise } from "@/lib/types";
import { LinkButton } from "@/components/ui/button";
import { RecurringList } from "@/components/user/recurring-list";
import { ResendVerificationButton } from "@/components/auth/resend-verification-button";
import { getServerTranslator } from "@/lib/i18n-server";

type UserDonationRow = {
  id: string;
  status: string;
  totalPaise: number;
  donationNumber: string;
  createdAt: Date | string;
  receipt: { receiptNumber: string | null; voidedAt: Date | string | null } | null;
  payments: Array<{ gatewayPaymentId: string | null; status: string; method: string | null; paidAt: Date | string | null }>;
};

export default async function UserDashboardPage() {
  const { t } = await getServerTranslator();
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const user = await db.findUserById(userId);
  if (!user) redirect("/login");
  if (user.emailVerifiedAt) await db.claimGuestDonationsForVerifiedUser(userId);
  const donations: UserDonationRow[] = user.emailVerifiedAt ? await db.listDonationsForUser(userId, user.email) : [];
  const completedDonations = donations.filter((donation) => donation.status === "SUCCESS");
  const totalGiven = completedDonations.reduce((sum, donation) => sum + donation.totalPaise, 0);

  return (
    <div className="container-app py-14">
      <h1 className="text-3xl">{t("Welcome back, {name}", { name: user.name.split(" ")[0] })}</h1>
      <p className="text-muted mt-1">{t("Here's a summary of your giving.")}</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <LinkButton href="/user/settings" size="sm" variant="outline">{t("Account settings")}</LinkButton>
        <LinkButton href="/user/subscriptions" size="sm" variant="outline">{t("Monthly subscriptions")}</LinkButton>
      </div>

      {!user.emailVerifiedAt ? (
        <section className="mt-8 rounded-lg border border-border bg-surface p-6">
          <h2 className="text-xl">{t("Verify your email to view donation history")}</h2>
          <p className="mt-2 text-muted">{t("We only link guest donations made with {email} after you verify that you own this email address. Until then, donation totals and history are hidden.", { email: user.email })}</p>
          <ResendVerificationButton />
        </section>
      ) : <>

      <div className="mt-8 grid sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-lg border border-border bg-surface">
          <p className="text-xs text-muted">{t("Total Given")}</p>
          <p className="mt-2 text-2xl font-serif text-maroon">{formatPaise(totalGiven)}</p>
        </div>
        <div className="p-5 rounded-lg border border-border bg-surface">
          <p className="text-xs text-muted">{t("Completed Donations")}</p>
          <p className="mt-2 text-2xl font-serif text-maroon">{completedDonations.length}</p>
        </div>
        <div className="p-5 rounded-lg border border-border bg-surface">
          <p className="text-xs text-muted">{t("Member Since")}</p>
          <p className="mt-2 text-2xl font-serif text-maroon">
            {new Date(user.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
          </p>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-xl mb-4">{t("Monthly Giving")}</h2>
        <RecurringList />
      </div>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="text-xl">{t("Donation History")}</h2>
        <LinkButton href="/campaigns" size="sm" variant="outline">
          {t("Explore Campaigns")}
        </LinkButton>
      </div>

      {donations.length === 0 ? (
        <p className="mt-6 text-muted">
          {t("No donations using {email} are linked to this account yet. Guest donations made with this exact email will appear here after email verification.", { email: user.email })}
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[850px] text-sm">
            <thead className="bg-cream">
              <tr className="text-left">
                <th className="p-3 font-medium">{t("Donation #")}</th>
                <th className="p-3 font-medium">{t("Receipt #")}</th>
                <th className="p-3 font-medium">{t("Date")}</th>
                <th className="p-3 font-medium">{t("Amount")}</th>
                <th className="p-3 font-medium">{t("Status")}</th>
                <th className="p-3 font-medium">{t("Payment details")}</th>
              </tr>
            </thead>
            <tbody>
              {donations.map((d) => (
                <tr key={d.id} className="border-t border-border">
                  <td className="p-3 font-mono text-xs">{d.donationNumber}</td>
                  <td className="p-3 font-mono text-xs">{d.receipt?.receiptNumber ?? "—"}{d.receipt?.voidedAt ? ` (${t("voided")})` : ""}</td>
                  <td className="p-3 text-muted">{new Date(d.createdAt).toLocaleDateString("en-IN")}</td>
                  <td className="p-3 font-medium">{formatPaise(d.totalPaise)}</td>
                  <td className="p-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${d.status === "SUCCESS" ? "bg-success/10 text-success" : d.status === "FAILED" ? "bg-red/10 text-red" : "bg-cream text-muted"}`}>
                      {t(d.status)}
                    </span>
                  </td>
                  <td className="p-3">
                    {d.payments?.map((payment, index) => (
                      <div key={payment.gatewayPaymentId || `${payment.status}-${index}`} className="text-xs">
                        {payment.gatewayPaymentId && <p className="font-mono">{t("Payment ID: {id}", { id: payment.gatewayPaymentId })}</p>}
                        {payment.method && <p className="text-muted">{t("Method: {method}", { method: payment.method })}</p>}
                        {payment.paidAt && <p className="text-muted">{t("Paid: {date}", { date: new Date(payment.paidAt).toLocaleDateString("en-IN") })}</p>}
                        {!payment.gatewayPaymentId && <p className="text-muted">{t(payment.status)}</p>}
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
