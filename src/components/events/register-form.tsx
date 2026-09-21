"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function EventRegisterForm({ eventSlug }: { eventSlug: string }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    const res = await fetch("/api/events/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventSlug, ...form }),
    });
    const data = await res.json();
    if (!data.success) {
      setStatus("error");
      setError(data.error?.message ?? "Registration failed.");
      return;
    }
    setStatus("done");
  };

  if (status === "done") {
    return (
      <div className="p-5 rounded-lg bg-success/10 text-success text-sm">
        You&apos;re registered! A confirmation has been sent to {form.email}.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        required
        placeholder="Full Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="w-full rounded-lg border border-border px-4 py-2.5 bg-surface"
      />
      <input
        required
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        className="w-full rounded-lg border border-border px-4 py-2.5 bg-surface"
      />
      <input
        placeholder="Phone (optional)"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
        className="w-full rounded-lg border border-border px-4 py-2.5 bg-surface"
      />
      {error && <p className="text-sm text-red">{error}</p>}
      <Button type="submit" className="w-full" disabled={status === "loading"}>
        {status === "loading" ? "Registering…" : "Register for this Event"}
      </Button>
    </form>
  );
}
