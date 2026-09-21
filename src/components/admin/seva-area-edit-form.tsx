"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

import { SevaArea } from "@/lib/db";

export function SevaAreaEditForm({
  sevaArea,
  isNew = false,
}: {
  sevaArea?: SevaArea;
  isNew?: boolean;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: sevaArea?.name || "",
    hindiName: sevaArea?.hindiName || "",
    slug: sevaArea?.slug || "",
    description: sevaArea?.description || "",
    objectives: sevaArea?.objectives || "",
    coverImage: sevaArea?.coverImage || "",
    published: sevaArea?.published ?? false,
    isActive: sevaArea?.isActive ?? true,
    sortOrder: sevaArea?.sortOrder ?? 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const url = isNew ? "/api/admin/seva-areas" : `/api/admin/seva-areas/${sevaArea?.id}`;
    const method = isNew ? "POST" : "PATCH";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setSaving(false);

    if (!data.success) {
      setError(data.error?.message || "Failed to save Seva Area");
      return;
    }

    router.push("/admin/seva-areas");
    router.refresh();
  };

  return (
    <form onSubmit={handleSave} className="space-y-4 max-w-2xl bg-surface p-6 rounded-lg border border-border">
      <div>
        <label className="text-sm text-muted" htmlFor="name">Name (English)</label>
        <input
          id="name"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="mt-1.5 w-full rounded-lg border border-border px-4 py-2 bg-background"
        />
      </div>
      <div>
        <label className="text-sm text-muted" htmlFor="hindiName">Name (Hindi)</label>
        <input
          id="hindiName"
          value={form.hindiName}
          onChange={(e) => setForm({ ...form, hindiName: e.target.value })}
          className="mt-1.5 w-full rounded-lg border border-border px-4 py-2 bg-background"
        />
      </div>
      <div>
        <label className="text-sm text-muted" htmlFor="slug">Slug</label>
        <input
          id="slug"
          required
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          className="mt-1.5 w-full rounded-lg border border-border px-4 py-2 bg-background"
        />
      </div>
      <div>
        <label className="text-sm text-muted" htmlFor="description">Description</label>
        <textarea
          id="description"
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="mt-1.5 w-full rounded-lg border border-border px-4 py-2 bg-background"
        />
      </div>
      <div>
        <label className="text-sm text-muted" htmlFor="objectives">Objectives</label>
        <textarea
          id="objectives"
          rows={3}
          value={form.objectives}
          onChange={(e) => setForm({ ...form, objectives: e.target.value })}
          className="mt-1.5 w-full rounded-lg border border-border px-4 py-2 bg-background"
        />
      </div>
      <div>
        <label className="text-sm text-muted" htmlFor="coverImage">Cover Image URL</label>
        <input
          id="coverImage"
          value={form.coverImage}
          onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
          className="mt-1.5 w-full rounded-lg border border-border px-4 py-2 bg-background"
        />
      </div>
      <div className="flex gap-4 items-center">
        <label className="text-sm text-muted" htmlFor="sortOrder">Sort Order</label>
        <input
          id="sortOrder"
          type="number"
          value={form.sortOrder}
          onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
          className="w-24 rounded-lg border border-border px-4 py-2 bg-background"
        />
      </div>
      
      <div className="flex gap-6 mt-2">
        <label className="flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setForm({ ...form, published: e.target.checked })}
          />
          Published
        </label>
        <label className="flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          />
          Active
        </label>
      </div>

      {error && <p className="text-red text-sm">{error}</p>}
      
      <Button type="submit" disabled={saving} className="mt-4">
        {saving ? "Saving..." : isNew ? "Create Seva Area" : "Save Changes"}
      </Button>
    </form>
  );
}
