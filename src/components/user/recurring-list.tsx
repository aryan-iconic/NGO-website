"use client";

import { useEffect, useState } from "react";
import { formatPaise } from "@/lib/types";

interface Recurring {
  id: string;
  amountPaise: number;
  status: string;
  nextChargeAt: string;
  startedAt: string;
}

export function RecurringList() {
  const [items, setItems] = useState<Recurring[] | null>(null);

  const load = () => {
    fetch("/api/recurring")
      .then((r) => r.json())
      .then((d) => d.success && setItems(d.recurring));
  };

  useEffect(load, []);

  const cancel = async (id: string) => {
    await fetch(`/api/recurring/${id}/cancel`, { method: "POST" });
    load();
  };

  if (items === null) return null;
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted">
        No monthly giving set up yet.
      </p>
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
            <button onClick={() => cancel(r.id)} className="text-sm text-red hover:underline">
              Cancel
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
