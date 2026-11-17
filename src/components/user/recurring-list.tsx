"use client";

import { useCallback, useEffect, useState } from "react";
import { formatPaise } from "@/lib/types";
import Link from "next/link";

interface Recurring {
  id: string;
  amountPaise: number;
  status: string;
  nextChargeAt: string;
  startedAt: string;
}

export function RecurringList() {
  const [items, setItems] = useState<Recurring[] | null>(null);
  const [error, setError] = useState("");
  const [available, setAvailable] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError("");
    try {
      const response = await fetch("/api/recurring");
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error?.message || "Could not load subscriptions.");
      setAvailable(Boolean(data.enabled));
      setItems(data.recurring);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load subscriptions.");
      setItems([]);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const cancel = async (id: string) => {
    setCancellingId(id); setError("");
    try {
      const response = await fetch(`/api/recurring/${id}/cancel`, { method: "POST" });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error?.message || "Could not cancel this subscription.");
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not cancel this subscription."); }
    finally { setCancellingId(null); }
  };

  if (items === null) return null;
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface p-5">
        {error ? <p role="alert" className="text-sm text-red">{error}</p> : <>
          <p className="font-medium text-text">{available ? "No monthly subscriptions on this account." : "Monthly subscriptions are not enabled yet."}</p>
          <p className="mt-1 text-sm text-muted">{available ? "When you start monthly giving, your status and billing dates will appear here." : "No automatic monthly payment will be scheduled. Once enabled, this page will show your subscription status, billing dates, and cancellation controls."}</p>
          <Link href="/monthly" className="mt-3 inline-block text-sm text-primary underline">Monthly giving information</Link>
        </>}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((r) => (
        <div key={r.id} className="flex items-center justify-between p-4 rounded-lg border border-border bg-surface">
          <div>
            <p className="font-medium text-maroon">{formatPaise(r.amountPaise)}/month</p>
            <p className="text-xs text-muted">
              {r.status === "ACTIVE" ? `Next charge ${new Date(r.nextChargeAt).toLocaleDateString("en-IN")}` : r.status}
            </p>
          </div>
          {r.status === "ACTIVE" && (
            <button disabled={cancellingId === r.id} onClick={() => cancel(r.id)} className="text-sm text-red hover:underline disabled:opacity-60">
              {cancellingId === r.id ? "Cancelling…" : "Cancel"}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
