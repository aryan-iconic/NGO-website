"use client";

import { useState } from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!data.success) {
      setStatus("error");
      setError(data.error?.message ?? "Something went wrong.");
      return;
    }
    setStatus("done");
  };

  return (
    <div className="container-app py-14 grid lg:grid-cols-2 gap-14">
      <div>
        <h1 className="text-4xl">Contact Us</h1>
        <p className="text-muted mt-2">Questions about a campaign, donation, or volunteering? Reach out.</p>

        <div className="mt-8 space-y-4 text-sm">
          <p className="flex items-center gap-3 text-muted">
            <Mail size={16} className="text-primary" /> Contact email will appear here once provided by the Trust
          </p>
          <p className="flex items-center gap-3 text-muted">
            <Phone size={16} className="text-primary" /> Contact phone will appear here once provided by the Trust
          </p>
          <p className="flex items-center gap-3 text-muted">
            <MapPin size={16} className="text-primary" /> Address will appear here once provided by the Trust
          </p>
        </div>
      </div>

      <div>
        {status === "done" ? (
          <div className="p-6 rounded-lg bg-success/10 text-success">
            Your message has been received — we&apos;ll respond soon.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
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
            <input
              placeholder="Subject"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full rounded-lg border border-border px-4 py-2.5 bg-surface"
            />
            <textarea
              required
              rows={5}
              placeholder="Message"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full rounded-lg border border-border px-4 py-2.5 bg-surface"
            />
            {error && <p className="text-sm text-red">{error}</p>}
            <Button type="submit" size="lg" className="w-full" disabled={status === "loading"}>
              {status === "loading" ? "Sending…" : "Send Message"}
            </Button>
          </form>
        )}
      </div>
      </div>
      
      {/* Map Embed */}
      <div className="lg:col-span-2 mt-8 rounded-lg overflow-hidden border border-border h-[400px]">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d115408.0979979313!2d82.9087067!3d25.3207397!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x398e2db74afd32cb%3A0x76eff6fe42404642!2sVaranasi%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1714498305886!5m2!1sen!2sin"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Shri Nityanikunj Ras Seva Sansthan Trust Location"
        />
      </div>
    </div>
  );
}
