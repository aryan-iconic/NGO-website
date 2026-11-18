import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUserId } from "@/lib/auth";
import { RecurringList } from "@/components/user/recurring-list";
import { getServerTranslator } from "@/lib/i18n-server";

export default async function UserSubscriptionsPage() {
  const { t } = await getServerTranslator();
  if (!await getCurrentUserId()) redirect("/login");
  return <main className="container-app min-h-[60vh] py-12 sm:py-16">
    <Link href="/user/dashboard" className="text-sm text-primary hover:underline">← {t("Back to your account")}</Link>
    <h1 className="mt-4 text-3xl font-serif text-maroon">{t("Monthly subscriptions")}</h1>
    <p className="mt-2 mb-8 text-muted">{t("View your monthly giving status and upcoming billing details.")}</p>
    <div className="max-w-3xl"><RecurringList /></div>
  </main>;
}
