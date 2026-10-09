"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ui/image-upload";

export function CampaignCreateForm({ sevaAreas }: { sevaAreas: { id: string; name: string }[] }) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    shortDescription: "",
    story: "",
    sevaAreaId: sevaAreas[0]?.id || "",
    locationText: "",
    donationMode: "GENERAL" as "PRODUCTS" | "GENERAL" | "BOTH",
    allowCustomAmount: true,
    isFeatured: false,
    isUrgent: false,
    coverImage: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoUrls, setVideoUrls] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, minimumAmountPaise: 10100 }),
      });
      const data = await res.json();
      if (!res.ok || !data.success || !data.campaign?.id) {
        setError(data.error?.message ?? "Failed to create campaign.");
        setSubmitting(false);
        return;
      }

      const campaignId = data.campaign.id as string;
      const failedItems: string[] = [];
      for (const file of galleryImages) {
        try {
          const uploadData = new FormData();
          uploadData.append("file", file);
          const uploadResponse = await fetch("/api/admin/media/upload", { method: "POST", body: uploadData });
          const upload = await uploadResponse.json();
          if (!uploadResponse.ok || !upload.success || !upload.url) throw new Error("Upload failed");
          const mediaResponse = await fetch(`/api/admin/campaigns/${campaignId}/media`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "IMAGE", url: upload.url }),
          });
          if (!mediaResponse.ok) throw new Error("Could not attach image");
        } catch {
          failedItems.push(file.name);
        }
      }

      for (const url of videoUrls) {
        try {
          const mediaResponse = await fetch(`/api/admin/campaigns/${campaignId}/media`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "VIDEO", url }),
          });
          if (!mediaResponse.ok) throw new Error("Could not attach video");
        } catch {
          failedItems.push(url);
        }
      }

      if (failedItems.length > 0) {
        window.alert(`Campaign created, but some media could not be added. You can retry from the campaign edit page:\n${failedItems.join("\n")}`);
      }
      router.push(`/admin/campaigns/${campaignId}`);
      router.refresh();
    } catch {
      setError("Could not create the campaign. Please try again.");
      setSubmitting(false);
    }
  };

  const addVideoUrl = () => {
    const trimmedUrl = videoUrl.trim();
    if (!trimmedUrl) return;
    try {
      const parsedUrl = new URL(trimmedUrl);
      if (!["http:", "https:"].includes(parsedUrl.protocol)) throw new Error("Invalid URL");
      setVideoUrls((current) => [...current, trimmedUrl]);
      setVideoUrl("");
    } catch {
      setError("Enter a valid video URL.");
    }
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
      
      <div className="pt-2">
        <ImageUpload
          label="Cover Image"
          value={form.coverImage}
          onChange={(url) => setForm({ ...form, coverImage: url })}
        />
      </div>

      <section className="space-y-4 bg-surface p-6 rounded-lg border border-border">
        <h2 className="text-xl font-serif">Gallery &amp; Media</h2>
        <p className="text-sm text-muted">Add images and videos to the campaign draft. They will be attached after the campaign is created.</p>

        <div>
          <label className="text-sm font-medium" htmlFor="campaign-gallery-images">Add Images</label>
          <input
            id="campaign-gallery-images"
            type="file"
            accept="image/*"
            multiple
            disabled={submitting}
            onChange={(event) => {
              const selected = Array.from(event.target.files ?? []);
              const oversized = selected.filter((file) => file.size > 5 * 1024 * 1024);
              if (oversized.length) setError(`Images must be 5 MB or smaller: ${oversized.map((file) => file.name).join(", ")}`);
              const valid = selected.filter((file) => file.size <= 5 * 1024 * 1024);
              setGalleryImages((current) => [...current, ...valid]);
              event.target.value = "";
            }}
            className="mt-2 block w-full text-sm text-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cream file:text-primary hover:file:bg-cream/80"
          />
          {galleryImages.length > 0 && (
            <ul className="mt-3 space-y-2 text-sm">
              {galleryImages.map((file, index) => (
                <li key={`${file.name}-${file.lastModified}-${index}`} className="flex items-center justify-between gap-3">
                  <span className="truncate">{file.name}</span>
                  <button type="button" className="text-red hover:underline" disabled={submitting} onClick={() => setGalleryImages((current) => current.filter((_, i) => i !== index))}>Remove</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <label className="text-sm font-medium" htmlFor="campaign-video-url">Add Video</label>
          <div className="mt-2 flex gap-2">
            <input
              id="campaign-video-url"
              type="url"
              value={videoUrl}
              onChange={(event) => setVideoUrl(event.target.value)}
              placeholder="https://youtube.com/..."
              disabled={submitting}
              className="flex-1 rounded-lg border border-border px-3 py-2 text-sm bg-background"
            />
            <Button type="button" variant="outline" onClick={addVideoUrl} disabled={!videoUrl.trim() || submitting}>+ Add Video URL</Button>
          </div>
          {videoUrls.length > 0 && (
            <ul className="mt-3 space-y-2 text-sm">
              {videoUrls.map((url, index) => (
                <li key={`${url}-${index}`} className="flex items-center justify-between gap-3">
                  <span className="truncate">{url}</span>
                  <button type="button" className="text-red hover:underline" disabled={submitting} onClick={() => setVideoUrls((current) => current.filter((_, i) => i !== index))}>Remove</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

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
      <div className="flex gap-3 items-center">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Creating…" : "Create Campaign (Draft)"}
        </Button>
      </div>
    </form>
  );
}
