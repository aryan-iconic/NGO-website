"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function DonationRulesForm() {
  const [minimum, setMinimum] = useState("1");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/donation-settings")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.error?.message || "Could not load donation settings.");
        const stored = data.data?.minimumAmountPaise;
        if (stored) setMinimum((Number(stored) / 100).toFixed(2).replace(/\.00$/, ""));
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Could not load donation settings."))
      .finally(() => setLoading(false));
  }, []);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    const rupees = Number(minimum);
    const paise = Math.round(rupees * 100);
    if (!Number.isFinite(rupees) || !Number.isSafeInteger(paise) || paise < 100) {
      setError("Minimum donation must be at least ₹1.");
      return;
    }
    setSaving(true); setError(null); setMessage(null);
    try {
      const response = await fetch("/api/admin/donation-settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ minimumAmountPaise: paise }) });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error?.message || "Could not save donation settings.");
      setMessage("Minimum donation saved. The payment API now enforces this amount.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not save donation settings."); }
    finally { setSaving(false); }
  };

  if (loading) return <p role="status" className="text-muted">Loading donation rules…</p>;
  return <section className="max-w-2xl rounded-xl border border-border bg-surface p-6 sm:p-8">
    <h1 className="text-2xl font-serif text-maroon">Donation Rules</h1>
    <p className="mt-2 text-muted">Set the minimum amount for general donations. Campaign-specific minimums are configured on each campaign.</p>
    <form onSubmit={save} className="mt-6 space-y-4">
      <label htmlFor="minimum-donation" className="block text-sm font-medium text-text">Minimum general donation (₹)
        <input id="minimum-donation" name="minimum-donation" type="number" min="1" step="0.01" required value={minimum} onChange={(event) => setMinimum(event.target.value)} className="mt-1.5 block w-full max-w-sm rounded-lg border border-border bg-background px-4 py-3" />
      </label>
      <p className="text-sm text-muted">The minimum cannot be lower than ₹1. Changes apply to new donations and are validated on the server.</p>
      {error && <p role="alert" className="text-sm text-red">{error}</p>}
      {message && <p role="status" className="text-sm text-success">{message}</p>}
      <Button disabled={saving}>{saving ? "Saving…" : "Save donation rule"}</Button>
    </form>
  </section>;
}
