"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

const interestOptions = [
  "Event Support",
  "Education",
  "Community Service",
  "Digital/Technology",
  "Photography/Media",
  "Fundraising Support",
  "Field Activities",
];

export default function VolunteerPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    availability: "",
    message: "",
  });
  const [interests, setInterests] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const toggleInterest = (i: string) =>
    setInterests((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    const res = await fetch("/api/volunteers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, interests }),
    });
    const data = await res.json();
    if (!data.success) {
      setStatus("error");
      setError(data.error?.message ?? "Something went wrong.");
      return;
    }
    setStatus("done");
  };

  if (status === "done") {
    return (
      <div className="container-app py-24 text-center max-w-md mx-auto">
        <h1 className="text-3xl">Thank You</h1>
        <p className="mt-3 text-muted">
          Your application has been received. A member of the team will reach out about next steps.
        </p>
      </div>
    );
  }

  return (
    <div className="container-app py-14 max-w-lg">
      <h1 className="text-4xl">Join Our Seva</h1>
      <p className="text-muted mt-2">
        Volunteering doesn&apos;t require donating — just a bit of your time and willingness to help.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
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
        <div className="grid grid-cols-2 gap-4">
          <input
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full rounded-lg border border-border px-4 py-2.5 bg-surface"
          />
          <input
            placeholder="City"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            className="w-full rounded-lg border border-border px-4 py-2.5 bg-surface"
          />
        </div>

        <div>
          <p className="text-sm text-muted mb-2">Areas of Interest</p>
          <div className="flex flex-wrap gap-2">
            {interestOptions.map((i) => (
              <button
                type="button"
                key={i}
                onClick={() => toggleInterest(i)}
                className={`px-3 py-1.5 rounded-full text-xs border ${
                  interests.includes(i)
                    ? "bg-primary text-white border-primary"
                    : "border-border text-text"
                }`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        <input
          placeholder="Availability (e.g. weekends)"
          value={form.availability}
          onChange={(e) => setForm({ ...form, availability: e.target.value })}
          className="w-full rounded-lg border border-border px-4 py-2.5 bg-surface"
        />
        <textarea
          placeholder="Anything else you'd like us to know?"
          rows={4}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="w-full rounded-lg border border-border px-4 py-2.5 bg-surface"
        />

        {error && <p className="text-sm text-red">{error}</p>}
        <Button type="submit" size="lg" className="w-full" disabled={status === "loading"}>
          {status === "loading" ? "Submitting…" : "Submit Application"}
        </Button>
      </form>
    </div>
  );
}
