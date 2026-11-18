"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

type Account = { name: string; email: string; phone: string; emailVerified: boolean; memberSince: string };

export function AccountSettings() {
  const { t } = useI18n();
  const router = useRouter();
  const [account, setAccount] = useState<Account | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    fetch("/api/user/account")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(t(data.error?.message || "Could not load account settings."));
        setAccount(data.user);
        setName(data.user.name);
        setPhone(data.user.phone);
      })
      .catch((cause) => setError(cause instanceof Error ? t(cause.message) : t("Could not load account settings.")))
      .finally(() => setLoading(false));
  }, [t]);

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault(); setError(""); setNotice(""); setSavingProfile(true);
    try {
      const response = await fetch("/api/user/account", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, phone }) });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(t(data.error?.message || "Could not update your profile."));
      setAccount((previous) => previous ? { ...previous, ...data.user } : previous);
      router.refresh();
      setNotice(t("Your profile was updated."));
    } catch (cause) { setError(cause instanceof Error ? t(cause.message) : t("Could not update your profile.")); }
    finally { setSavingProfile(false); }
  };

  const changePassword = async (event: FormEvent) => {
    event.preventDefault(); setError(""); setNotice(""); setSavingPassword(true);
    try {
      const response = await fetch("/api/user/account/password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword, newPassword }) });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(t(data.error?.message || "Could not change your password."));
      setCurrentPassword(""); setNewPassword(""); setNotice(t("Your password was changed."));
    } catch (cause) { setError(cause instanceof Error ? t(cause.message) : t("Could not change your password.")); }
    finally { setSavingPassword(false); }
  };

  const deleteAccount = async (event: FormEvent) => {
    event.preventDefault(); setError(""); setNotice(""); setDeleting(true);
    try {
      const response = await fetch("/api/user/account/delete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword: deletePassword, confirmation: deleteConfirmation }) });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(t(data.error?.message || "Could not deactivate your account."));
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/login?account=deactivated"); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? t(cause.message) : t("Could not deactivate your account.")); }
    finally { setDeleting(false); }
  };

  if (loading) return <p role="status" className="text-muted">{t("Loading account settings…")}</p>;
  if (!account) return <p role="alert" className="text-red">{error || t("Could not load your account.")}</p>;

  return <div className="max-w-3xl space-y-8">
    <section className="rounded-xl border border-border bg-surface p-6 sm:p-8">
      <h2 className="text-xl font-serif text-maroon">{t("Profile")}</h2>
      <p className="mt-2 text-sm text-muted">{t("Your sign-in email is fixed so verified donation history remains securely connected to this account.")}</p>
      <form onSubmit={saveProfile} className="mt-5 grid gap-4 sm:grid-cols-2">
        <label htmlFor="account-name" className="text-sm text-muted">{t("Full name")}
          <input id="account-name" autoComplete="name" required minLength={2} maxLength={100} value={name} onChange={(event) => setName(event.target.value)} className="mt-1.5 w-full rounded-lg border border-border bg-background px-4 py-3 text-text" />
        </label>
        <label htmlFor="account-email" className="text-sm text-muted">{t("Email")}
          <input id="account-email" type="email" value={account.email} readOnly className="mt-1.5 w-full rounded-lg border border-border bg-background-alt px-4 py-3 text-text" />
          <span className="mt-1 block text-xs">{t(account.emailVerified ? "Verified" : "Not verified")}</span>
        </label>
        <label htmlFor="account-phone" className="text-sm text-muted sm:col-span-2">{t("Phone (optional)")}
          <input id="account-phone" type="tel" autoComplete="tel" maxLength={32} value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-1.5 w-full rounded-lg border border-border bg-background px-4 py-3 text-text" />
        </label>
        <div className="sm:col-span-2"><Button disabled={savingProfile}>{savingProfile ? t("Saving…") : t("Save profile")}</Button></div>
      </form>
    </section>

    <section className="rounded-xl border border-border bg-surface p-6 sm:p-8">
      <h2 className="text-xl font-serif text-maroon">{t("Change password")}</h2>
      <form onSubmit={changePassword} className="mt-5 grid gap-4 sm:grid-cols-2">
        <label htmlFor="current-password" className="text-sm text-muted">{t("Current password")}
          <input id="current-password" type="password" autoComplete="current-password" required value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="mt-1.5 w-full rounded-lg border border-border bg-background px-4 py-3 text-text" />
        </label>
        <label htmlFor="new-password" className="text-sm text-muted">{t("New password (at least 12 characters)")}
          <input id="new-password" type="password" autoComplete="new-password" required minLength={12} maxLength={128} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="mt-1.5 w-full rounded-lg border border-border bg-background px-4 py-3 text-text" />
        </label>
        <div className="sm:col-span-2"><Button disabled={savingPassword}>{savingPassword ? t("Updating…") : t("Change password")}</Button></div>
      </form>
    </section>

    <section className="rounded-xl border border-red/30 bg-surface p-6 sm:p-8">
      <h2 className="text-xl font-serif text-red">{t("Deactivate account")}</h2>
      <p className="mt-2 text-sm text-muted">{t("This signs you out and disables this account. Donation and receipt records are retained. To restore access later, register again with this same email and verify it; your history will be linked back. This does not erase financial records.")}</p>
      <form onSubmit={deleteAccount} className="mt-5 grid gap-4 sm:grid-cols-2">
        <label htmlFor="delete-current-password" className="text-sm text-muted">{t("Current password")}
          <input id="delete-current-password" type="password" autoComplete="current-password" required value={deletePassword} onChange={(event) => setDeletePassword(event.target.value)} className="mt-1.5 w-full rounded-lg border border-border bg-background px-4 py-3 text-text" />
        </label>
        <label htmlFor="delete-confirmation" className="text-sm text-muted">{t("Type DELETE to confirm")}
          <input id="delete-confirmation" required value={deleteConfirmation} onChange={(event) => setDeleteConfirmation(event.target.value)} className="mt-1.5 w-full rounded-lg border border-border bg-background px-4 py-3 text-text" />
        </label>
        <div className="sm:col-span-2"><Button variant="outline" disabled={deleting || deleteConfirmation !== "DELETE"}>{deleting ? t("Deactivating…") : t("Deactivate account")}</Button></div>
      </form>
    </section>

    {error && <p role="alert" className="text-sm text-red">{error}</p>}
    {notice && <p role="status" className="text-sm text-success">{notice}</p>}
  </div>;
}
