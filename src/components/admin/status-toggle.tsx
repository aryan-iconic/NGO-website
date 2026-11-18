"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

const statuses = ["DRAFT", "ACTIVE", "PAUSED", "COMPLETED", "ARCHIVED"];

export function StatusToggle({ campaignId, status }: { campaignId: string; status: string }) {
  const [value, setValue] = useState(status);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();

  const handleChange = async (newStatus: string) => {
    const previous = value;
    setPending(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/campaigns/${campaignId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.success) throw new Error(data?.error?.message || "Status update failed.");
      setValue(newStatus);
      startTransition(() => router.refresh());
    } catch (updateError) {
      setValue(previous);
      setError(updateError instanceof Error ? updateError.message : "Status update failed.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div>
      <select
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        disabled={pending}
        aria-label="Campaign status"
        aria-invalid={Boolean(error)}
        className="text-xs px-2 py-1 rounded-full bg-cream text-maroon border border-border disabled:opacity-60"
      >
        {statuses.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      {error && <span role="alert" className="mt-1 block max-w-40 text-xs text-red">{error}</span>}
    </div>
  );
}
