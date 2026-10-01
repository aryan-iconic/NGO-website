"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export function NewsletterSection() {
  const { t } = useI18n();
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
          <h2 className="text-3xl font-serif text-maroon">{t("nl.title")}</h2>
          <p className="mt-4 text-muted max-w-md">
            {t("nl.body")}
          </p>
        </div>
        
        <div>
          {status === "done" ? (
            <div className="p-6 rounded-lg bg-success/10 text-success text-center border border-success/20">
              <h3 className="font-semibold text-lg">{t("nl.success")}</h3>
              <p className="text-sm mt-1">You have successfully subscribed to our newsletter.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl border border-border shadow-[var(--shadow-soft)]">
              <h3 className="font-medium text-maroon mb-2">{t("nl.label")}</h3>
              <input
                required
                placeholder={t("nl.f.name")}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-border px-4 py-2.5 bg-surface text-sm"
              />
              <input
                required
                type="email"
                placeholder={t("nl.f.email")}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg border border-border px-4 py-2.5 bg-surface text-sm"
              />
              <input
                placeholder={t("nl.f.city")}
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full rounded-lg border border-border px-4 py-2.5 bg-surface text-sm"
              />
              
              {error && <p className="text-sm text-red">{error}</p>}
              
              <Button type="submit" className="w-full mt-2" disabled={status === "loading"}>
                {status === "loading" ? t("nl.submitting") : t("nl.submit")}
              </Button>
              
              <p className="text-xs text-muted text-center mt-3">
                {t("nl.footer")}
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
