import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUserId } from "@/lib/auth";
import { AccountSettings } from "@/components/user/account-settings";
import { getServerTranslator } from "@/lib/i18n-server";

export default async function UserSettingsPage() {
  const { t } = await getServerTranslator();
  if (!await getCurrentUserId()) redirect("/login");
  return <main className="container-app py-12 sm:py-16">
    <Link href="/user/dashboard" className="text-sm text-primary hover:underline">← {t("Back to your account")}</Link>
    <h1 className="mt-4 text-3xl font-serif text-maroon">{t("Account settings")}</h1>
    <p className="mt-2 mb-8 text-muted">{t("Manage your profile, password, and account access.")}</p>
    <AccountSettings />
  </main>;
}
