"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface EventFormValues {
  title: string;
  description: string;
  eventDate: string;
  venue: string;
  location: string;
  registrationEnabled: boolean;
  status: "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";
}

export function EventForm({
  mode,
  eventId,
  initial,
}: {
  mode: "create" | "edit";
  eventId?: string;
  initial?: Partial<EventFormValues>;
}) {
  const [form, setForm] = useState<EventFormValues>({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    eventDate: initial?.eventDate ?? "",
    venue: initial?.venue ?? "",
    location: initial?.location ?? "",
    registrationEnabled: initial?.registrationEnabled ?? true,
    status: initial?.status ?? "DRAFT",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const url = mode === "create" ? "/api/admin/events" : `/api/admin/events/${eventId}`;
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
    router.push("/admin/content/events");
    router.refresh();
  };

  const handleDelete = async () => {
    if (!eventId || !confirm("Delete this event?")) return;
    await fetch(`/api/admin/events/${eventId}`, { method: "DELETE" });
    router.push("/admin/content/events");
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
        <label className="text-sm text-muted" htmlFor="description">Description</label>
        <textarea
          id="description"
          required
          rows={5}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="mt-1.5 w-full rounded-lg border border-border px-4 py-2.5 bg-surface"
        />
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="text-sm text-muted" htmlFor="eventDate">Date</label>
          <input
            id="eventDate"
            type="date"
            required
            value={form.eventDate?.slice(0, 10)}
            onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
            className="mt-1.5 w-full rounded-lg border border-border px-4 py-2.5 bg-surface"
          />
        </div>
        <div>
          <label className="text-sm text-muted" htmlFor="venue">Venue</label>
          <input
            id="venue"
            value={form.venue}
            onChange={(e) => setForm({ ...form, venue: e.target.value })}
            className="mt-1.5 w-full rounded-lg border border-border px-4 py-2.5 bg-surface"
          />
        </div>
        <div>
          <label className="text-sm text-muted" htmlFor="location">Location</label>
          <input
            id="location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="mt-1.5 w-full rounded-lg border border-border px-4 py-2.5 bg-surface"
          />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4 items-end">
        <div>
          <label className="text-sm text-muted" htmlFor="status">Status</label>
          <select
            id="status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as EventFormValues["status"] })}
            className="mt-1.5 w-full rounded-lg border border-border px-4 py-2.5 bg-surface"
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm text-muted pb-2.5">
          <input
            type="checkbox"
            checked={form.registrationEnabled}
            onChange={(e) => setForm({ ...form, registrationEnabled: e.target.checked })}
          />
          Registration enabled
        </label>
      </div>

      {error && <p className="text-sm text-red">{error}</p>}
      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : mode === "create" ? "Create Event" : "Save Changes"}
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
