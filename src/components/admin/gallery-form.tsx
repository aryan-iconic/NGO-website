"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface GalleryFormValues {
  title: string;
  caption: string;
  description: string;
  category: string;
  imageUrl: string;
  altText: string;
  isPublished: boolean;
  displayOrder: number;
}

const CATEGORIES = ["All", "Initiatives", "Seva", "Community", "Education", "Spiritual", "Volunteers"];

export function GalleryForm({
  mode,
  itemId,
  initial,
}: {
  mode: "create" | "edit";
  itemId?: string;
  initial?: Partial<GalleryFormValues>;
}) {
  const [form, setForm] = useState<GalleryFormValues>({
    title: initial?.title ?? "",
    caption: initial?.caption ?? "",
    description: initial?.description ?? "",
    category: initial?.category ?? "All",
    imageUrl: initial?.imageUrl ?? "",
    altText: initial?.altText ?? "",
    isPublished: initial?.isPublished ?? true,
    displayOrder: initial?.displayOrder ?? 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const url = mode === "create" ? "/api/admin/gallery" : `/api/admin/gallery/${itemId}`;
    const method = mode === "create" ? "POST" : "PUT";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!data.success) {
      setError(data.error?.message ?? "Something went wrong.");
      return;
    }
    router.push("/admin/content/gallery");
    router.refresh();
  };

  const handleDelete = async () => {
    if (!itemId || !confirm("Delete this gallery item?")) return;
    await fetch(`/api/admin/gallery/${itemId}`, { method: "DELETE" });
    router.push("/admin/content/gallery");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <div>
        <label className="text-sm text-muted" htmlFor="imageUrl">Image URL *</label>
        <input
          id="imageUrl"
          required
          value={form.imageUrl}
          onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          className="mt-1.5 w-full rounded-lg border border-border px-4 py-2.5 bg-surface"
        />
        {form.imageUrl && (
          <div className="mt-4 w-48 h-48 rounded-lg overflow-hidden border border-border">
            <img src={form.imageUrl} alt="Preview" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-muted" htmlFor="title">Title (Internal/Optional)</label>
          <input
            id="title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="mt-1.5 w-full rounded-lg border border-border px-4 py-2.5 bg-surface"
          />
        </div>
        <div>
          <label className="text-sm text-muted" htmlFor="category">Category</label>
          <select
            id="category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="mt-1.5 w-full rounded-lg border border-border px-4 py-2.5 bg-surface"
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-sm text-muted" htmlFor="caption">Caption (Visible to users)</label>
        <input
          id="caption"
          value={form.caption}
          onChange={(e) => setForm({ ...form, caption: e.target.value })}
          className="mt-1.5 w-full rounded-lg border border-border px-4 py-2.5 bg-surface"
        />
      </div>

      <div>
        <label className="text-sm text-muted" htmlFor="description">Long Description</label>
        <textarea
          id="description"
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="mt-1.5 w-full rounded-lg border border-border px-4 py-2.5 bg-surface"
        />
      </div>

      <div className="grid sm:grid-cols-3 gap-4 items-end">
        <div>
          <label className="text-sm text-muted" htmlFor="altText">Alt Text (Accessibility)</label>
          <input
            id="altText"
            value={form.altText}
            onChange={(e) => setForm({ ...form, altText: e.target.value })}
            className="mt-1.5 w-full rounded-lg border border-border px-4 py-2.5 bg-surface"
          />
        </div>
        <div>
          <label className="text-sm text-muted" htmlFor="displayOrder">Display Order</label>
          <input
            id="displayOrder"
            type="number"
            value={form.displayOrder}
            onChange={(e) => setForm({ ...form, displayOrder: parseInt(e.target.value) || 0 })}
            className="mt-1.5 w-full rounded-lg border border-border px-4 py-2.5 bg-surface"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-muted pb-2.5">
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
          />
          Published
        </label>
      </div>

      {error && <p className="text-sm text-red">{error}</p>}
      <div className="flex gap-3 mt-6">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : mode === "create" ? "Add to Gallery" : "Save Changes"}
        </Button>
        {mode === "edit" && (
          <Button type="button" variant="outline" onClick={handleDelete}>
            Delete
          </Button>
        )}
      </div>
    </form>
  );
}
