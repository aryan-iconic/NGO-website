"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronDown, ChevronUp, ExternalLink, ImagePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Media {
  id: string;
  type: string;
  url: string;
  altText: string | null;
  sortOrder: number;
}

export function CampaignMediaManager({ campaignId }: { campaignId: string }) {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingVideo, setAddingVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [imageAltText, setImageAltText] = useState("");
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number; name: string } | null>(null);
  const [reordering, setReordering] = useState(false);

  const loadMedia = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/campaigns/${campaignId}/media`);
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success || !Array.isArray(data.media)) throw new Error(data?.error?.message || "Could not load campaign media.");
      setMedia(data.media);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load campaign media.");
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadMedia(), 0);
    return () => window.clearTimeout(timer);
  }, [loadMedia]);



  const handleAddVideo = async () => {
    const trimmedUrl = videoUrl.trim();
    try {
      const parsed = new URL(trimmedUrl);
      const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
      if (!["youtube.com", "m.youtube.com", "youtu.be", "vimeo.com", "player.vimeo.com"].includes(host)) throw new Error("Use a YouTube or Vimeo video link.");
    } catch (cause) {
      setError(cause instanceof Error && cause.message.includes("Use a") ? cause.message : "Enter a valid YouTube or Vimeo link.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/campaigns/${campaignId}/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "VIDEO", url: trimmedUrl }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.success) throw new Error(data?.error?.message || "Could not add video.");
      setAddingVideo(false);
      setVideoUrl("");
      await loadMedia();
    } catch (addError) {
      setError(addError instanceof Error ? addError.message : "Could not add video.");
      setLoading(false);
    }
  };

  const handleDelete = async (mediaId: string) => {
    if (!confirm("Remove this media item?")) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/campaigns/${campaignId}/media/${mediaId}`, { method: "DELETE" });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.success) throw new Error(data?.error?.message || "Could not remove media.");
      await loadMedia();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Could not remove media.");
      setLoading(false);
    }
  };

  const handleFiles = async (fileList: FileList | File[]) => {
    const selected = Array.from(fileList);
    if (selected.length === 0) return;
    const unsupported = selected.filter((file) => !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type));
    const oversized = selected.filter((file) => file.size > 4 * 1024 * 1024);
    const valid = selected.filter((file) => !unsupported.includes(file) && !oversized.includes(file));
    const issues = [
      ...unsupported.map((file) => `${file.name}: use JPEG, PNG, WebP, or GIF.`),
      ...oversized.map((file) => `${file.name}: file exceeds 4 MB.`),
    ];
    if (valid.length + issues.length > 10) {
      setError("Upload up to 10 images at a time.");
      return;
    }
    setError(issues.join(" ") || null);
    if (!valid.length) return;

    setLoading(true);
    const failed = [...issues];
    for (const [index, file] of valid.entries()) {
      setUploadProgress({ current: index + 1, total: valid.length, name: file.name });
      try {
        const formData = new FormData();
        formData.append("file", file);
        const response = await fetch("/api/admin/media/upload", { method: "POST", body: formData });
        const upload = await response.json().catch(() => null);
        if (!response.ok || !upload?.success || !upload.url) throw new Error(upload?.error?.message || "Upload failed.");
        const attachResponse = await fetch(`/api/admin/campaigns/${campaignId}/media`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "IMAGE", url: upload.url, altText: imageAltText.trim() || null }),
        });
        const attached = await attachResponse.json().catch(() => null);
        if (!attachResponse.ok || !attached?.success) throw new Error(attached?.error?.message || "Image uploaded but could not be attached to this campaign.");
      } catch (cause) {
        failed.push(`${file.name}: ${cause instanceof Error ? cause.message : "Upload failed."}`);
      }
    }
    setUploadProgress(null);
    setLoading(false);
    setError(failed.length ? failed.join(" ") : null);
    await loadMedia();
  };

  const moveMedia = async (mediaId: string, direction: -1 | 1) => {
    const index = media.findIndex((item) => item.id === mediaId);
    const targetIndex = index + direction;
    if (index < 0 || targetIndex < 0 || targetIndex >= media.length || reordering) return;
    const next = [...media];
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    setMedia(next);
    setReordering(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/campaigns/${campaignId}/media`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaIds: next.map((item) => item.id) }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.success) throw new Error(data?.error?.message || "Could not save the media order.");
      await loadMedia();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save the media order.");
      await loadMedia();
    } finally {
      setReordering(false);
    }
  };

  const saveAltText = async (item: Media, value: string) => {
    if (value.trim() === (item.altText || "")) return;
    try {
      const response = await fetch(`/api/admin/campaigns/${campaignId}/media/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ altText: value.trim() || null }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.success) throw new Error(data?.error?.message || "Could not save image description.");
      setMedia((current) => current.map((entry) => entry.id === item.id ? { ...entry, altText: value.trim() || null } : entry));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save image description.");
    }
  };

  if (loading && media.length === 0) return <div className="animate-pulse rounded-lg border border-border bg-cream p-6 text-sm text-muted">Loading campaign gallery…</div>;

  return (
    <div className="space-y-6">
      {error && <p className="rounded-lg border border-red/30 bg-red/5 p-3 text-sm text-red" role="alert">{error}</p>}

      <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
        <section className="rounded-xl border border-border bg-background p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <ImagePlus size={18} className="text-primary" />
            <h3 className="font-medium">Upload photos</h3>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted">JPEG, PNG, WebP, or GIF · up to 4 MB each · 10 at a time</p>
          <label className={`mt-4 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-primary/40 bg-cream/50 px-4 py-5 text-center transition hover:border-primary hover:bg-cream ${loading ? "pointer-events-none opacity-60" : ""}`}>
            <ImagePlus size={22} className="mb-2 text-primary" />
            <span className="text-sm font-medium text-maroon">Choose images from your device</span>
            <span className="mt-1 text-xs text-muted">You can select multiple photos</span>
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple disabled={loading} className="sr-only" onChange={(event) => { const files = event.currentTarget.files; event.currentTarget.value = ""; if (files) void handleFiles(files); }} />
          </label>
          <label className="mt-3 block text-xs text-muted">Image description for screen readers
            <input value={imageAltText} maxLength={300} onChange={(event) => setImageAltText(event.target.value)} placeholder="Describe what this photo shows" className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text" />
          </label>
          {uploadProgress && <div className="mt-3" role="status"><div className="flex justify-between gap-3 text-xs text-muted"><span>Uploading {uploadProgress.current} of {uploadProgress.total}</span><span className="truncate">{uploadProgress.name}</span></div><div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-border"><div className="h-full bg-primary transition-all" style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }} /></div></div>}
        </section>

        <section className="rounded-xl border border-border bg-background p-4 sm:p-5">
          <div className="flex items-center gap-2"><ExternalLink size={18} className="text-primary" /><h3 className="font-medium">Add a video</h3></div>
          <p className="mt-1 text-xs leading-relaxed text-muted">Paste a public YouTube or Vimeo link. Videos open in the campaign gallery player.</p>
          {addingVideo ? (
            <form className="mt-4 space-y-3" onSubmit={(event) => { event.preventDefault(); void handleAddVideo(); }}>
              <input type="url" required value={videoUrl} onChange={(event) => setVideoUrl(event.target.value)} placeholder="https://youtu.be/…" disabled={loading} className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm" />
              <div className="flex flex-wrap gap-2"><Button type="submit" size="sm" disabled={!videoUrl.trim() || loading}>{loading ? "Adding…" : "Add video"}</Button><Button type="button" size="sm" variant="outline" onClick={() => { setAddingVideo(false); setVideoUrl(""); }} disabled={loading}>Cancel</Button></div>
            </form>
          ) : <Button type="button" size="sm" variant="outline" className="mt-4" onClick={() => setAddingVideo(true)}>+ Add video link</Button>}
        </section>
      </div>

      <div className="flex items-end justify-between gap-4 border-b border-border pb-3">
        <div><h3 className="font-medium">Campaign gallery</h3><p className="mt-0.5 text-xs text-muted">{media.length} {media.length === 1 ? "item" : "items"} · reorder with the arrows</p></div>
        {loading && !uploadProgress && <span className="text-xs text-muted" role="status">Updating…</span>}
      </div>
      {media.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-background px-5 py-10 text-center"><ImagePlus className="mx-auto text-muted" /><p className="mt-2 font-medium text-maroon">Your gallery is empty</p><p className="mt-1 text-sm text-muted">Add photos or a video link above. They’ll appear on the public campaign page.</p></div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {media.map((item, index) => (
            <article key={item.id} className="overflow-hidden rounded-xl border border-border bg-background">
              <div className="group relative aspect-[4/3] overflow-hidden bg-cream">
                {item.type === "IMAGE" ? <img src={item.url} alt={item.altText || ""} className="h-full w-full object-cover" /> : <div className="flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-maroon to-maroon/80 p-4 text-center text-white"><span className="text-3xl">▶</span><span className="max-w-full truncate text-xs">Video link</span><a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs underline underline-offset-2">Open video</a></div>}
                <div className="absolute left-2 top-2 rounded-full bg-black/65 px-2 py-1 text-[11px] font-medium text-white">{index + 1} · {item.type === "IMAGE" ? "Photo" : "Video"}</div>
                <div className="absolute right-2 top-2 flex gap-1 rounded-full bg-black/60 p-1">
                  <button type="button" aria-label={`Move item ${index + 1} earlier`} title="Move earlier" disabled={index === 0 || reordering} onClick={() => void moveMedia(item.id, -1)} className="grid size-8 place-items-center rounded-full text-white hover:bg-white/20 disabled:opacity-40"><ChevronUp size={17} /></button>
                  <button type="button" aria-label={`Move item ${index + 1} later`} title="Move later" disabled={index === media.length - 1 || reordering} onClick={() => void moveMedia(item.id, 1)} className="grid size-8 place-items-center rounded-full text-white hover:bg-white/20 disabled:opacity-40"><ChevronDown size={17} /></button>
                  <button type="button" aria-label={`Remove media item ${index + 1}`} title="Remove item" disabled={loading} onClick={() => void handleDelete(item.id)} className="grid size-8 place-items-center rounded-full text-white hover:bg-red disabled:opacity-40"><Trash2 size={16} /></button>
                </div>
              </div>
              {item.type === "IMAGE" && <label className="block p-3 text-xs text-muted">Image description<input key={`${item.id}-${item.altText}`} defaultValue={item.altText || ""} maxLength={300} onBlur={(event) => void saveAltText(item, event.currentTarget.value)} placeholder="Add an accessible description" className="mt-1 w-full rounded-md border border-border bg-surface px-2.5 py-2 text-sm text-text" /><span className="mt-1 block text-[11px]">Saved when you leave this field</span></label>}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
