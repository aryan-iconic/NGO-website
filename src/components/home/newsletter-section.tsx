"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function NewsletterSection() {
  const [form, setForm] = useState({ name: "", email: "", city: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!data.success) {
      setStatus("error");
      setError(data.error?.message || "Something went wrong.");
      return;
    }
    setStatus("done");
  };

  return (
    <section className="bg-surface py-20 border-t border-border">
      <div className="container-app grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="text-3xl font-serif text-maroon">Receive a Little Divine Inspiration</h2>
          <p className="mt-4 text-muted max-w-md">
            Stay Connected with Divine Seva. Receive our latest stories, seva updates, spiritual insights, campaigns, and meaningful ways to make a difference — directly in your inbox.
          </p>
        </div>
        
        <div>
          {status === "done" ? (
            <div className="p-6 rounded-lg bg-success/10 text-success text-center border border-success/20">
              <h3 className="font-semibold text-lg">Thank You!</h3>
              <p className="text-sm mt-1">You have successfully subscribed to our newsletter.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl border border-border shadow-[var(--shadow-soft)]">
              <h3 className="font-medium text-maroon mb-2">Weekly Newsletter</h3>
              <input
                required
                placeholder="Full Name *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-border px-4 py-2.5 bg-surface text-sm"
              />
              <input
                required
                type="email"
                placeholder="Email Address *"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg border border-border px-4 py-2.5 bg-surface text-sm"
              />
              <input
                placeholder="City / Location (Optional)"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full rounded-lg border border-border px-4 py-2.5 bg-surface text-sm"
              />
              
              {error && <p className="text-sm text-red">{error}</p>}
              
              <Button type="submit" className="w-full mt-2" disabled={status === "loading"}>
                {status === "loading" ? "Subscribing..." : "Subscribe Free"}
              </Button>
              
              <p className="text-xs text-muted text-center mt-3">
                🛡️ 100% Free • No Spam • Unsubscribe at any time with one click.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
