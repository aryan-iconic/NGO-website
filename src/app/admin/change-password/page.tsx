"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function AdminChangePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setLoading(true); setError("");
    try {
      const response = await fetch("/api/admin/change-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password, confirmPassword }) });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error?.message || "Could not update password.");
      router.replace("/admin"); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not update password."); }
    finally { setLoading(false); }
  };
  return <main className="min-h-screen grid place-items-center bg-background-alt p-4"><section className="w-full max-w-md rounded-xl border border-border bg-white p-8 shadow-sm"><h1 className="text-2xl font-serif text-maroon">Change your admin password</h1><p className="mt-2 text-sm text-muted">Your account requires a new password before you continue. Use at least 12 characters.</p><form onSubmit={submit} className="mt-6 space-y-4"><label className="block text-sm" htmlFor="new-password">New password<input className="mt-1 w-full rounded-lg border border-border p-3" id="new-password" type="password" minLength={12} autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} /></label><label className="block text-sm" htmlFor="confirm-password">Confirm new password<input className="mt-1 w-full rounded-lg border border-border p-3" id="confirm-password" type="password" minLength={12} autoComplete="new-password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} /></label>{error && <p role="alert" className="text-sm text-red">{error}</p>}<Button className="w-full" disabled={loading}>{loading ? "Updating…" : "Save new password"}</Button></form></section></main>;
}
