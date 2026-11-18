"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Campaign } from "@/lib/db";
import { ImageUpload } from "@/components/ui/image-upload";
import { CampaignMediaManager } from "./campaign-media-manager";
import { CampaignProductsManager } from "./campaign-products-manager";

export function CampaignEditForm({ campaign, sevaAreas }: { campaign: Campaign; sevaAreas: { id: string; name: string }[] }) {
  const [form, setForm] = useState({
    title: campaign.title,
    shortDescription: campaign.shortDescription,
    story: campaign.story,
    beneficiaryInfo: campaign.beneficiaryInfo || "",
    impactDescription: campaign.impactDescription || "",
    locationText: campaign.locationText || "",
    donationMode: campaign.donationMode,
    allowCustomAmount: campaign.allowCustomAmount,
    minimumAmountRupees: (campaign.minimumAmountPaise / 100).toString(),
    isFeatured: campaign.isFeatured,
    isUrgent: campaign.isUrgent,
    sevaAreaId: campaign.sevaAreaId || "",
    coverImage: campaign.coverImage || "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const minimumAmountPaise = Math.round(Number(form.minimumAmountRupees) * 100);
    if (!Number.isSafeInteger(minimumAmountPaise) || minimumAmountPaise < 100) {
      setError("Campaign minimum must be at least ₹1.");
      return;
    }
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/campaigns/${campaign.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          sevaAreaId: form.sevaAreaId || undefined,
          minimumAmountPaise,
          coverImage: form.coverImage || null,
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.success) throw new Error(data?.error?.message || "Could not save campaign changes.");
      setMessage("Campaign changes saved.");
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save campaign changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSave} className="space-y-4 bg-surface p-6 rounded-lg border border-border">
        <h2 className="text-xl font-serif mb-4">Basic Details</h2>
        <div>
          <label className="text-sm text-muted" htmlFor="title">Title</label>
          <input
            id="title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="mt-1.5 w-full rounded-lg border border-border px-4 py-2.5 bg-background"
          />
        </div>
        <div>
          <label className="text-sm text-muted" htmlFor="shortDescription">Short Description</label>
          <input
            id="shortDescription"
            value={form.shortDescription}
            onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
            className="mt-1.5 w-full rounded-lg border border-border px-4 py-2.5 bg-background"
          />
        </div>
        <div>
          <label className="text-sm text-muted" htmlFor="story">Story</label>
          <textarea
            id="story"
            rows={5}
            value={form.story}
            onChange={(e) => setForm({ ...form, story: e.target.value })}
            className="mt-1.5 w-full rounded-lg border border-border px-4 py-2.5 bg-background"
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-muted" htmlFor="beneficiaryInfo">Who benefits?</label>
            <textarea id="beneficiaryInfo" rows={3} value={form.beneficiaryInfo} onChange={(e) => setForm({ ...form, beneficiaryInfo: e.target.value })} className="mt-1.5 w-full rounded-lg border border-border px-4 py-2.5 bg-background" />
          </div>
          <div>
            <label className="text-sm text-muted" htmlFor="impactDescription">Expected impact</label>
            <textarea id="impactDescription" rows={3} value={form.impactDescription} onChange={(e) => setForm({ ...form, impactDescription: e.target.value })} className="mt-1.5 w-full rounded-lg border border-border px-4 py-2.5 bg-background" />
          </div>
        </div>
        <div>
          <label className="text-sm text-muted" htmlFor="locationText">Location</label>
          <input id="locationText" value={form.locationText} onChange={(e) => setForm({ ...form, locationText: e.target.value })} className="mt-1.5 w-full rounded-lg border border-border px-4 py-2.5 bg-background" />
        </div>
        <div>
          <label className="text-sm text-muted" htmlFor="sevaAreaId">Seva Area</label>
          <select
            id="sevaAreaId"
            value={form.sevaAreaId}
            onChange={(e) => setForm({ ...form, sevaAreaId: e.target.value })}
            className="mt-1.5 w-full rounded-lg border border-border px-4 py-2.5 bg-background"
          >
            <option value="">No seva area</option>
            {sevaAreas.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-muted" htmlFor="donationMode">Donation mode</label>
            <select id="donationMode" value={form.donationMode} onChange={(e) => setForm({ ...form, donationMode: e.target.value as typeof form.donationMode })} className="mt-1.5 w-full rounded-lg border border-border px-4 py-2.5 bg-background">
              <option value="GENERAL">General donations</option><option value="PRODUCTS">Products</option><option value="BOTH">Donations and products</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-muted" htmlFor="minimumAmountRupees">Minimum donation (₹)</label>
            <input id="minimumAmountRupees" type="number" min="1" step="0.01" required value={form.minimumAmountRupees} onChange={(e) => setForm({ ...form, minimumAmountRupees: e.target.value })} className="mt-1.5 w-full rounded-lg border border-border px-4 py-2.5 bg-background" />
          </div>
        </div>
        
        <div className="pt-4 border-t border-border mt-6">
          <ImageUpload
            label="Cover Image"
            value={form.coverImage}
            onChange={(url) => setForm({ ...form, coverImage: url })}
          />
        </div>

        <div className="flex flex-wrap gap-5 pt-4">
          <label className="flex items-center gap-2 text-sm text-muted">
            <input type="checkbox" checked={form.allowCustomAmount} onChange={(e) => setForm({ ...form, allowCustomAmount: e.target.checked })} />
            Allow custom donation amounts
          </label>
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
        <div className="pt-4 flex gap-3 items-center">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={saving}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save Changes"}</Button>
          {message && <span role="status" className="text-sm text-green-700">{message}</span>}
          {error && <span role="alert" className="text-sm text-red">{error}</span>}
        </div>
      </form>

      <section className="space-y-4 bg-surface p-6 rounded-lg border border-border">
        <h2 className="text-xl font-serif mb-4">Gallery & Media</h2>
        <p className="text-sm text-muted mb-6">Manage images and videos associated with this campaign.</p>
        <CampaignMediaManager campaignId={campaign.id} />
      </section>

      <CampaignProductsManager campaignId={campaign.id} />
    </div>
  );
}
