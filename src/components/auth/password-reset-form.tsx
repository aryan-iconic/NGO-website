"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export function PasswordResetForm({ token }: { token?: string }) {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isReset = Boolean(token);

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setLoading(true); setError(""); setMessage("");
    try {
      const response = await fetch(isReset ? "/api/auth/password-reset" : "/api/auth/password-reset/request", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isReset ? { token, password, confirmPassword } : { email }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(t(data.error?.message || "Could not process your request."));
      setMessage(t(isReset ? "Your password has been changed. Sign in with the new password." : data.message));
      if (isReset) { setPassword(""); setConfirmPassword(""); }
    } catch (cause) { setError(cause instanceof Error ? cause.message : t("Could not process your request.")); }
    finally { setLoading(false); }
  };

  return <main className="container-app mx-auto max-w-md py-16 sm:py-20">
    <h1 className="text-center text-3xl font-serif text-maroon">{t(isReset ? "Choose a new password" : "Forgot your password?")}</h1>
    <p className="mt-3 text-center text-sm text-muted">{t(isReset ? "Use at least 12 characters. This will sign out other active sessions." : "Enter your verified account email and we’ll send a one-time reset link.")}</p>
    <form onSubmit={submit} className="mt-8 space-y-4">
      {isReset ? <>
        <label htmlFor="reset-password" className="block text-sm text-muted">{t("New password")}
          <input id="reset-password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1.5 w-full rounded-lg border border-border bg-surface px-4 py-3 text-text" />
        </label>
        <label htmlFor="reset-password-confirm" className="block text-sm text-muted">{t("Confirm new password")}
          <input id="reset-password-confirm" type="password" autoComplete="new-password" minLength={12} maxLength={128} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-1.5 w-full rounded-lg border border-border bg-surface px-4 py-3 text-text" />
        </label>
      </> : <label htmlFor="reset-email" className="block text-sm text-muted">{t("Email")}
        <input id="reset-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1.5 w-full rounded-lg border border-border bg-surface px-4 py-3 text-text" />
      </label>}
      {error && <p role="alert" className="text-sm text-red">{error}</p>}
      {message && <p role="status" className="rounded-lg border border-primary/20 bg-cream p-3 text-sm text-maroon">{message}</p>}
      <Button className="w-full" disabled={loading || !token && isReset}>{loading ? t("Please wait…") : t(isReset ? "Set new password" : "Send reset link")}</Button>
    </form>
    <p className="mt-6 text-center text-sm"><Link href="/login" className="text-primary underline">{t("Back to login")}</Link></p>
  </main>;
}
