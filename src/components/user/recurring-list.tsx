"use client";

import { useCallback, useEffect, useState } from "react";
import { formatPaise } from "@/lib/types";
import Link from "next/link";

interface Recurring {
  id: string;
  amountPaise: number;
  status: string;
  shortUrl: string | null;
  nextChargeAt: string | null;
  lastChargeAt: string | null;
  cancelAtCycleEnd: boolean;
  cancelledAt: string | null;
  createdAt: string;
  plan: { name: string; totalCycles: number };
}

const cancellable = new Set(["CREATED", "AUTHENTICATED", "ACTIVE", "PENDING", "HALTED", "PAUSED"]);

export function RecurringList() {
  const [items, setItems] = useState<Recurring[] | null>(null);
  const [error, setError] = useState("");
  const [verified, setVerified] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError("");
    try {
      const response = await fetch("/api/recurring", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error?.message || "Could not load subscriptions.");
      setVerified(Boolean(data.verified));
      setItems(data.recurring);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load subscriptions.");
      setItems([]);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const cancel = async (id: string) => {
    if (!window.confirm("Schedule cancellation at the end of the current billing cycle? Your current cycle will remain in effect until then.")) return;
    setCancellingId(id); setError("");
    try {
      const response = await fetch(`/api/recurring/${id}/cancel`, { method: "POST" });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error?.message || "Could not cancel this subscription.");
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not cancel this subscription."); }
    finally { setCancellingId(null); }
  };

  if (items === null) return <p className="text-sm text-muted">Loading your subscriptions…</p>;
  if (error && items.length === 0) return <p role="alert" className="rounded-lg border border-red/30 bg-red/5 p-4 text-sm text-red">{error}</p>;
  if (items.length === 0) return <div className="rounded-lg border border-border bg-surface p-5">
    {!verified ? <><p className="font-medium text-text">Verify your email before starting monthly giving.</p><p className="mt-1 text-sm text-muted">This connects subscription charges safely to your donor account and donation history.</p><Link href="/user/settings" className="mt-3 inline-block text-sm text-primary underline">Account settings</Link></> : <><p className="font-medium text-text">No monthly subscriptions on this account.</p><p className="mt-1 text-sm text-muted">When you start monthly giving, the status and billing dates will appear here.</p><Link href="/monthly" className="mt-3 inline-block text-sm text-primary underline">View monthly plans</Link></>}
  </div>;

  return <div className="space-y-3">
    {error && <p role="alert" className="text-sm text-red">{error}</p>}
    {items.map((item) => <article key={item.id} className="flex flex-col justify-between gap-4 rounded-lg border border-border bg-surface p-4 sm:flex-row sm:items-center">
      <div>
        <p className="font-medium text-maroon">{item.plan.name} · {formatPaise(item.amountPaise)}/month</p>
        <p className="mt-1 text-xs text-muted">Status: {item.cancelAtCycleEnd ? "Cancellation scheduled" : item.status} · Up to {item.plan.totalCycles} monthly payments</p>
        {item.nextChargeAt && !item.cancelAtCycleEnd && <p className="mt-1 text-xs text-muted">Next charge: {new Date(item.nextChargeAt).toLocaleDateString("en-IN")}</p>}
        {item.lastChargeAt && <p className="mt-1 text-xs text-muted">Last successful charge: {new Date(item.lastChargeAt).toLocaleDateString("en-IN")}</p>}
        {item.cancelledAt && <p className="mt-1 text-xs text-muted">Ended: {new Date(item.cancelledAt).toLocaleDateString("en-IN")}</p>}
      </div>
      <div className="flex shrink-0 flex-wrap gap-3">
        {item.status === "CREATED" && item.shortUrl && <a href={item.shortUrl} className="text-sm text-primary underline">Finish Razorpay authorization</a>}
        {cancellable.has(item.status) && !item.cancelAtCycleEnd && <button disabled={cancellingId === item.id} onClick={() => void cancel(item.id)} className="text-sm text-red underline disabled:opacity-50">{cancellingId === item.id ? "Requesting…" : "Cancel subscription"}</button>}
      </div>
    </article>)}
  </div>;
}
