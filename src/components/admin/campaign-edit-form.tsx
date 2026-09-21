"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Campaign } from "@/lib/db";

export function CampaignEditForm({ campaign, sevaAreas }: { campaign: Campaign; sevaAreas: { id: string; name: string }[] }) {
  const [form, setForm] = useState({
    title: campaign.title,
    shortDescription: campaign.shortDescription,
    story: campaign.story,
    isFeatured: campaign.isFeatured,
    isUrgent: campaign.isUrgent,
    sevaAreaId: campaign.sevaAreaId || sevaAreas[0]?.id || "",
  });
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    await fetch(`/api/admin/campaigns/${campaign.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <section className="space-y-4">
      <div>
        <label className="text-sm text-muted" htmlFor="title">Title</label>
        <input
          id="title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="mt-1.5 w-full rounded-lg border border-border px-4 py-2.5 bg-surface"
        />
      </div>
      <div>
        <label className="text-sm text-muted" htmlFor="shortDescription">Short Description</label>
        <input
          id="shortDescription"
          value={form.shortDescription}
          onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
          className="mt-1.5 w-full rounded-lg border border-border px-4 py-2.5 bg-surface"
        />
      </div>
      <div>
        <label className="text-sm text-muted" htmlFor="story">Story</label>
        <textarea
          id="story"
          rows={5}
          value={form.story}
          onChange={(e) => setForm({ ...form, story: e.target.value })}
          className="mt-1.5 w-full rounded-lg border border-border px-4 py-2.5 bg-surface"
        />
      </div>
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
      <Button onClick={handleSave}>{saved ? "Saved ✓" : "Save Changes"}</Button>
    </section>
  );
}
