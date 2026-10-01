"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { T } from "@/components/i18n/t";

export default function TaxExemption80GPage() {
  const [form, setForm] = useState({
    receiptNumber: "",
    email: "",
    donorName: "",
    pan: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    const res = await fetch("/api/80g", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!data.success) {
      setStatus("error");
      setError(data.error?.message || "Verification failed. Please check your details.");
      return;
    }
    setStatus("done");
  };

  return (
    <div className="container-app py-16 max-w-3xl">
      <h1 className="text-4xl font-serif text-maroon">80G Tax Exemption</h1>
      <p className="mt-4 text-muted text-lg">
        Submit your PAN and address details to receive an 80G tax exemption certificate for your eligible donation. Your information is kept secure and is only used for statutory Form 10BD reporting.
      </p>

      <div className="mt-10">
        {status === "done" ? (
          <div className="bg-success/10 border border-success/20 p-8 rounded-lg text-center">
            <h2 className="text-2xl text-success font-serif mb-2">Information Submitted Successfully</h2>
            <p className="text-muted">
              We have securely received your 80G tax information. It will be verified against your donation receipt and included in our statutory filings. You will be notified once your Form 10BE certificate is available.
            </p>
            <Button className="mt-6" onClick={() => setStatus("idle")}>Submit Another</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 bg-surface p-8 rounded-xl border border-border shadow-[var(--shadow-soft)]">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Donation Receipt Number *</label>
                <input
                  required
                  placeholder="e.g. RCT-12345678"
                  value={form.receiptNumber}
                  onChange={e => setForm({...form, receiptNumber: e.target.value})}
                  className="w-full rounded-lg border border-border px-4 py-2.5 bg-background text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email Address *</label>
                <input
                  required
                  type="email"
                  placeholder="Email used for donation"
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  className="w-full rounded-lg border border-border px-4 py-2.5 bg-background text-sm"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name (as per PAN) *</label>
                <input
                  required
                  value={form.donorName}
                  onChange={e => setForm({...form, donorName: e.target.value})}
                  className="w-full rounded-lg border border-border px-4 py-2.5 bg-background text-sm uppercase"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">PAN Number *</label>
                <input
                  required
                  placeholder="ABCDE1234F"
                  value={form.pan}
                  onChange={e => setForm({...form, pan: e.target.value.toUpperCase()})}
                  className="w-full rounded-lg border border-border px-4 py-2.5 bg-background text-sm uppercase"
                  maxLength={10}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Address Line 1 *</label>
              <input
                required
                value={form.addressLine1}
                onChange={e => setForm({...form, addressLine1: e.target.value})}
                className="w-full rounded-lg border border-border px-4 py-2.5 bg-background text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Address Line 2 (Optional)</label>
              <input
                value={form.addressLine2}
                onChange={e => setForm({...form, addressLine2: e.target.value})}
                className="w-full rounded-lg border border-border px-4 py-2.5 bg-background text-sm"
              />
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">City *</label>
                <input
                  required
                  value={form.city}
                  onChange={e => setForm({...form, city: e.target.value})}
                  className="w-full rounded-lg border border-border px-4 py-2.5 bg-background text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">State *</label>
                <input
                  required
                  value={form.state}
                  onChange={e => setForm({...form, state: e.target.value})}
                  className="w-full rounded-lg border border-border px-4 py-2.5 bg-background text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Pincode *</label>
                <input
                  required
                  maxLength={6}
                  value={form.pincode}
                  onChange={e => setForm({...form, pincode: e.target.value})}
                  className="w-full rounded-lg border border-border px-4 py-2.5 bg-background text-sm"
                />
              </div>
            </div>

            {error && <div className="p-4 bg-red/10 text-red text-sm rounded-lg border border-red/20">{error}</div>}

            <Button type="submit" size="lg" className="w-full" disabled={status === "loading"}>
              {status === "loading" ? "Submitting..." : "Submit 80G Information"}
            </Button>
            
            <p className="text-xs text-muted text-center mt-4">
              By submitting this form, you consent to Charanvandan using your PAN and address strictly for statutory tax compliance (Form 10BD/10BE).
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
