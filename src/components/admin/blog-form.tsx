"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface BlogFormValues {
  title: string;
  excerpt: string;
  content: string;
  author: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
}

export function BlogForm({
  mode,
  postId,
  initial,
}: {
  mode: "create" | "edit";
  postId?: string;
  initial?: Partial<BlogFormValues>;
}) {
  const [form, setForm] = useState<BlogFormValues>({
    title: initial?.title ?? "",
    excerpt: initial?.excerpt ?? "",
    content: initial?.content ?? "",
    author: initial?.author ?? "",
    status: initial?.status ?? "DRAFT",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const url = mode === "create" ? "/api/admin/blog" : `/api/admin/blog/${postId}`;
    const method = mode === "create" ? "POST" : "PATCH";
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
    router.push("/admin/content/blog");
    router.refresh();
  };

  const handleDelete = async () => {
    if (!postId || !confirm("Delete this post?")) return;
    await fetch(`/api/admin/blog/${postId}`, { method: "DELETE" });
    router.push("/admin/content/blog");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
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
        <label className="text-sm text-muted" htmlFor="excerpt">Excerpt</label>
        <input
          id="excerpt"
          required
          value={form.excerpt}
          onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
          className="mt-1.5 w-full rounded-lg border border-border px-4 py-2.5 bg-surface"
        />
      </div>
      <div>
        <label className="text-sm text-muted" htmlFor="content">Content</label>
        <textarea
          id="content"
          required
          rows={10}
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          className="mt-1.5 w-full rounded-lg border border-border px-4 py-2.5 bg-surface"
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-muted" htmlFor="author">Author</label>
          <input
            id="author"
            value={form.author}
            onChange={(e) => setForm({ ...form, author: e.target.value })}
            className="mt-1.5 w-full rounded-lg border border-border px-4 py-2.5 bg-surface"
          />
        </div>
        <div>
          <label className="text-sm text-muted" htmlFor="status">Status</label>
          <select
            id="status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as BlogFormValues["status"] })}
            className="mt-1.5 w-full rounded-lg border border-border px-4 py-2.5 bg-surface"
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      {error && <p className="text-sm text-red">{error}</p>}
      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : mode === "create" ? "Create Post" : "Save Changes"}
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
