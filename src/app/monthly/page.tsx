"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatPaise } from "@/lib/types";
import { RefreshCw } from "lucide-react";

const presets = [50000, 100000, 250000, 500000];

interface CampaignOption {
  slug: string;
  title: string;
}

export default function MonthlyGivingPage() {
  const [amount, setAmount] = useState(presets[1]);
  const [custom, setCustom] = useState("");
  const [campaignSlug, setCampaignSlug] = useState<string>("");
  const [campaigns, setCampaigns] = useState<CampaignOption[]>([]);
  const [form, setForm] = useState({ name: "", email: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/campaigns")
      .then((r) => r.json())
      .then((d) => d.success && setCampaigns(d.campaigns));
  }, []);

  const selected = custom ? Math.round(parseFloat(custom || "0") * 100) : amount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    const res = await fetch("/api/recurring", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amountPaise: selected,
        campaignId: campaignSlug || undefined,
        donorName: form.name,
        donorEmail: form.email,
      }),
    });
    const data = await res.json();
    if (!data.success) {
      setStatus("error");
      setError(data.error?.message ?? "Something went wrong.");
      return;
    }
    setStatus("done");
  };

  if (status === "done") {
    return (
      <div className="container-app py-24 max-w-md mx-auto text-center">
        <RefreshCw size={48} className="mx-auto text-success" />
        <h1 className="mt-6 text-3xl">You&apos;re All Set</h1>
        <p className="mt-3 text-muted">
          {formatPaise(selected)} will be contributed every month starting today. You can pause
          or cancel anytime from your dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="container-app py-16 max-w-lg">
      <h1 className="text-4xl">Give Every Month</h1>
      <p className="text-muted mt-2">
        Small recurring contributions provide consistent support to ongoing seva work.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-3">
        {presets.map((p) => (
          <button
            key={p}
            onClick={() => {
              setAmount(p);
              setCustom("");
            }}
            className={`py-3 rounded-lg border text-sm font-medium ${
              !custom && amount === p
                ? "bg-primary text-white border-primary"
                : "border-border text-text hover:border-primary/50"
            }`}
          >
            {formatPaise(p)}/mo
          </button>
        ))}
      </div>

      <div className="mt-4">
        <label className="text-sm text-muted" htmlFor="custom-amount">Or a custom monthly amount (₹)</label>
        <input
          id="custom-amount"
          type="number"
          min={101}
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          className="mt-1.5 w-full rounded-lg border border-border px-4 py-2.5 bg-surface"
        />
      </div>

      <div className="mt-6">
        <label className="text-sm text-muted" htmlFor="campaign">Direct this to (optional)</label>
        <select
          id="campaign"
          value={campaignSlug}
          onChange={(e) => setCampaignSlug(e.target.value)}
          className="mt-1.5 w-full rounded-lg border border-border px-4 py-2.5 bg-surface"
        >
          <option value="">General Fund</option>
          {campaigns.map((c) => (
            <option key={c.slug} value={c.slug}>{c.title}</option>
          ))}
        </select>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <input
          required
          placeholder="Full Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full rounded-lg border border-border px-4 py-2.5 bg-surface"
        />
        <input
          required
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full rounded-lg border border-border px-4 py-2.5 bg-surface"
        />

        <div className="p-4 rounded-lg bg-cream flex items-center justify-between">
          <span className="text-sm text-muted">Monthly contribution</span>
          <span className="font-semibold text-maroon text-lg">{formatPaise(selected || 0)}/mo</span>
        </div>

        {error && <p className="text-sm text-red">{error}</p>}
        <Button type="submit" size="lg" className="w-full" disabled={!selected || status === "loading"}>
          {status === "loading" ? "Setting up…" : "Start Monthly Giving"}
        </Button>
        <p className="text-xs text-muted">
          This demo authorizes the subscription immediately via a mock gateway. In production
          this step opens the payment gateway&apos;s subscription authorization flow.
        </p>
      </form>
    </div>
  );
}
