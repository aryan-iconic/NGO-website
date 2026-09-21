"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

const statuses = ["DRAFT", "ACTIVE", "PAUSED", "COMPLETED", "ARCHIVED"];

export function StatusToggle({ campaignId, status }: { campaignId: string; status: string }) {
  const [value, setValue] = useState(status);
  const [, startTransition] = useTransition();
  const router = useRouter();

  const handleChange = async (newStatus: string) => {
    setValue(newStatus);
    await fetch(`/api/admin/campaigns/${campaignId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    startTransition(() => router.refresh());
  };

  return (
    <select
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      className="text-xs px-2 py-1 rounded-full bg-cream text-maroon border border-border"
    >
      {statuses.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
