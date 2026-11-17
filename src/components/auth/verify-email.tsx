"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function VerifyEmail({ token }: { token: string }) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [restoreRequired, setRestoreRequired] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();

  const verify = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error?.message || "Could not verify your email.");
      if (result.restoreRequired) {
        setRestoreRequired(true);
        setMessage("This email belongs to a deactivated account. Choose a new password to restore access to your retained donation history.");
        return;
      }
      setVerified(true);
      setMessage(
        result.linkedDonations > 0
          ? `Your email is verified. ${result.linkedDonations} previous donation${result.linkedDonations === 1 ? " has" : "s have"} been linked to your account.`
          : "Your email is verified. Previous donations made with this exact email will appear in your account.",
      );
    } catch (verifyError) {
      setError(verifyError instanceof Error ? verifyError.message : "Could not verify your email.");
    } finally {
      setLoading(false);
    }
  };

  const restore = async (event: React.FormEvent) => {
    event.preventDefault(); setLoading(true); setError(null);
    try {
      const response = await fetch("/api/auth/restore-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error?.message || "Could not restore your account.");
      setVerified(true); setRestoreRequired(false);
      setMessage(result.linkedDonations > 0
        ? `Your account is restored. ${result.linkedDonations} previous guest donation${result.linkedDonations === 1 ? " has" : "s have"} been linked.`
        : "Your account is restored. Your existing donation history is available in your account.");
      router.refresh();
    } catch (restoreError) {
      setError(restoreError instanceof Error ? restoreError.message : "Could not restore your account.");
    } finally { setLoading(false); }
  };

  return (
    <div className="container-app mx-auto max-w-md py-20 text-center">
      <h1 className="text-3xl text-maroon">Verify your email</h1>
      {message ? <p className="mt-4 text-muted">{message}</p> : <p className="mt-4 text-muted">Confirm that you own this email address to finish verification and link matching guest donations.</p>}
      {error && <p role="alert" className="mt-4 text-sm text-red">{error}</p>}
      {restoreRequired ? (
        <form onSubmit={restore} className="mt-6 space-y-4 text-left">
          <label htmlFor="restore-password" className="block text-sm text-muted">New password (at least 12 characters)
            <input id="restore-password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1.5 w-full rounded-lg border border-border bg-surface px-4 py-3 text-text" />
          </label>
          <label htmlFor="restore-password-confirm" className="block text-sm text-muted">Confirm new password
            <input id="restore-password-confirm" type="password" autoComplete="new-password" minLength={12} maxLength={128} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-1.5 w-full rounded-lg border border-border bg-surface px-4 py-3 text-text" />
          </label>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? "Restoring…" : "Restore account"}</Button>
        </form>
      ) : verified ? (
        <Link href={message?.includes("restored") ? "/user/dashboard" : "/login"} className="mt-8 inline-block text-primary hover:underline">{message?.includes("restored") ? "Continue to your account" : "Continue to login"}</Link>
      ) : (
        <Button type="button" className="mt-8" disabled={!token || loading} onClick={verify}>
          {loading ? "Verifying…" : "Verify email address"}
        </Button>
      )}
      {!token && <p className="mt-4 text-sm text-red">This verification link is missing its token.</p>}
    </div>
  );
}
