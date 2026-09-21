"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function CampaignCreateForm({ sevaAreas }: { sevaAreas: { id: string; name: string }[] }) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    shortDescription: "",
    story: "",
    sevaAreaId: sevaAreas[0]?.id || "",
    locationText: "",
    donationMode: "BOTH" as "PRODUCTS" | "GENERAL" | "BOTH",
    allowCustomAmount: true,
    isFeatured: false,
    isUrgent: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/admin/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, minimumAmountPaise: 10100 }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!data.success) {
      setError(data.error?.message ?? "Failed to create campaign.");
      return;
    }
    router.push("/admin/campaigns");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
      <div>
        <label className="text-sm text-muted" htmlFor="title">Title</label>
        <input
          id="title"
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="mt-1.5 w-full rounded-lg border border-border px-4 py-2.5 bg-surface"
        />
      </div>
      <div>
        <label className="text-sm text-muted" htmlFor="shortDescription">Short Description</label>
        <input
          id="shortDescription"
          required
          value={form.shortDescription}
          onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
          className="mt-1.5 w-full rounded-lg border border-border px-4 py-2.5 bg-surface"
        />
      </div>
      <div>
        <label className="text-sm text-muted" htmlFor="story">Story</label>
        <textarea
          id="story"
          required
          rows={5}
          value={form.story}
          onChange={(e) => setForm({ ...form, story: e.target.value })}
          className="mt-1.5 w-full rounded-lg border border-border px-4 py-2.5 bg-surface"
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-muted" htmlFor="sevaAreaId">Seva Area</label>
          <select
            id="sevaAreaId"
            value={form.sevaAreaId}
            onChange={(e) => setForm({ ...form, sevaAreaId: e.target.value })}
            className="mt-1.5 w-full rounded-lg border border-border px-4 py-2.5 bg-surface"
          >
            {sevaAreas.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm text-muted" htmlFor="locationText">Location</label>
          <input
            id="locationText"
            value={form.locationText}
            onChange={(e) => setForm({ ...form, locationText: e.target.value })}
            className="mt-1.5 w-full rounded-lg border border-border px-4 py-2.5 bg-surface"
          />
        </div>
      </div>
      <div>
        <label className="text-sm text-muted" htmlFor="donationMode">Donation Mode</label>
        <select
          id="donationMode"
          value={form.donationMode}
          onChange={(e) => setForm({ ...form, donationMode: e.target.value as typeof form.donationMode })}
          className="mt-1.5 w-full rounded-lg border border-border px-4 py-2.5 bg-surface"
        >
          <option value="BOTH">Products + Custom Amount</option>
          <option value="PRODUCTS">Products Only</option>
          <option value="GENERAL">Custom Amount Only</option>
        </select>
      </div>
      <div className="flex flex-wrap gap-5">
        {[
          ["isFeatured", "Featured"],
          ["isUrgent", "Urgent"],
        ].map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={form[key as keyof typeof form] as boolean}
              onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
            />
            {label}
          </label>
        ))}
      </div>

      {error && <p className="text-sm text-red">{error}</p>}
      <Button type="submit" disabled={submitting}>
        {submitting ? "Creating…" : "Create Campaign (Draft)"}
      </Button>
    </form>
  );
}
