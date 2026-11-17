"use client";

import { useCallback, useEffect, useState } from "react";
import { formatPaise } from "@/lib/types";

type Plan = { id: string; name: string; description: string | null; amountPaise: number; totalCycles: number; isActive: boolean; createdAt: string };
type Subscription = { id: string; amountPaise: number; status: string; shortUrl: string | null; nextChargeAt: string | null; cancelAtCycleEnd: boolean; createdAt: string; user: { name: string; email: string }; plan: { name: string; totalCycles: number } };

export function MonthlyGivingManager() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [cycles, setCycles] = useState("120");

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/recurring", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error?.message || "Could not load monthly giving data.");
      setPlans(data.plans);
      setSubscriptions(data.subscriptions);
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load monthly giving data.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const createPlan = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/admin/recurring", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, amountRupees: Number(amount), totalCycles: Number(cycles) }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error?.message || "Could not create plan.");
      setName(""); setDescription(""); setAmount(""); setCycles("120");
      setNotice("Monthly plan created and linked to Razorpay.");
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not create plan."); }
    finally { setSaving(false); }
  };

  const togglePlan = async (plan: Plan) => {
    setWorkingId(plan.id); setError(""); setNotice("");
    try {
      const response = await fetch(`/api/admin/recurring/${plan.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !plan.isActive }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error?.message || "Could not update plan.");
      setNotice(plan.isActive ? "Plan hidden from new donors. Existing subscriptions continue." : "Plan is available to donors again.");
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not update plan."); }
    finally { setWorkingId(null); }
  };

  const cancel = async (subscription: Subscription) => {
    if (!window.confirm(`Schedule cancellation for ${subscription.user.name}'s ${subscription.plan.name} subscription at the end of the current billing cycle?`)) return;
    setWorkingId(subscription.id); setError(""); setNotice("");
    try {
      const response = await fetch(`/api/recurring/${subscription.id}/cancel`, { method: "POST" });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error?.message || "Could not cancel subscription.");
      setNotice("Cancellation request sent to Razorpay.");
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not cancel subscription."); }
    finally { setWorkingId(null); }
  };

  return <div className="space-y-8">
    <header>
      <h1 className="text-2xl font-serif text-maroon">Monthly Giving</h1>
      <p className="mt-1 text-sm text-muted">Create Razorpay billing plans, control which plans donors can join, and track subscription status.</p>
    </header>

    {(error || notice) && <p role={error ? "alert" : "status"} className={`rounded-lg border p-3 text-sm ${error ? "border-red/30 bg-red/5 text-red" : "border-success/30 bg-success/5 text-success"}`}>{error || notice}</p>}

    <section className="rounded-xl border border-border bg-surface p-5">
      <h2 className="text-lg font-medium text-maroon">Create a monthly plan</h2>
      <p className="mt-1 text-sm text-muted">Razorpay does not allow editing a plan after creation. Deactivate it and make a replacement if its amount or name needs to change.</p>
      <form onSubmit={createPlan} className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="text-sm">Plan name<input required minLength={2} maxLength={80} value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2" placeholder="Monthly Seva Support" /></label>
        <label className="text-sm">Amount each month (₹)<input required type="number" min="1" max="1000000" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2" placeholder="500" /></label>
        <label className="text-sm">Number of monthly payments<input required type="number" min="1" max="1200" step="1" value={cycles} onChange={(e) => setCycles(e.target.value)} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2" /></label>
        <label className="text-sm sm:col-span-2">Description (optional)<textarea maxLength={500} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2" placeholder="How this monthly contribution supports the Trust" /></label>
        <p className="text-xs text-muted sm:col-span-2">The count sets the maximum number of monthly charges. One-time authorization and recurring debits are completed securely by Razorpay.</p>
        <button disabled={saving} className="rounded-full bg-primary px-5 py-2.5 font-medium text-white disabled:opacity-60 sm:col-span-2">{saving ? "Creating plan…" : "Create plan"}</button>
      </form>
    </section>

    <section>
      <h2 className="mb-3 text-lg font-medium text-maroon">Plans</h2>
      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full min-w-[700px] text-sm"><thead className="bg-cream"><tr className="text-left"><th className="p-3">Plan</th><th className="p-3">Monthly amount</th><th className="p-3">Duration</th><th className="p-3">Status</th><th className="p-3">Action</th></tr></thead>
          <tbody>{plans.map((plan) => <tr key={plan.id} className="border-t border-border"><td className="p-3"><strong>{plan.name}</strong>{plan.description && <p className="mt-1 max-w-sm text-xs text-muted">{plan.description}</p>}<p className="mt-1 font-mono text-[11px] text-muted">{plan.id}</p></td><td className="p-3">{formatPaise(plan.amountPaise)}</td><td className="p-3">{plan.totalCycles} months</td><td className="p-3">{plan.isActive ? "Available" : "Inactive"}</td><td className="p-3"><button disabled={workingId === plan.id} onClick={() => void togglePlan(plan)} className="text-primary underline disabled:opacity-50">{plan.isActive ? "Deactivate" : "Activate"}</button></td></tr>)}</tbody>
        </table>
        {!loading && plans.length === 0 && <p className="p-6 text-center text-muted">No monthly plans created yet.</p>}
        {loading && <p className="p-6 text-center text-muted">Loading plans…</p>}
      </div>
    </section>

    <section>
      <h2 className="mb-3 text-lg font-medium text-maroon">Donor subscriptions <span className="text-sm font-normal text-muted">({subscriptions.length})</span></h2>
      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full min-w-[900px] text-sm"><thead className="bg-cream"><tr className="text-left"><th className="p-3">Donor</th><th className="p-3">Plan</th><th className="p-3">Monthly amount</th><th className="p-3">Status</th><th className="p-3">Next charge</th><th className="p-3">Started</th><th className="p-3">Action</th></tr></thead>
          <tbody>{subscriptions.map((item) => <tr key={item.id} className="border-t border-border"><td className="p-3">{item.user.name}<p className="text-xs text-muted">{item.user.email}</p></td><td className="p-3">{item.plan.name}</td><td className="p-3">{formatPaise(item.amountPaise)}</td><td className="p-3">{item.status}{item.cancelAtCycleEnd ? " · cancellation scheduled" : ""}</td><td className="p-3">{item.nextChargeAt ? new Date(item.nextChargeAt).toLocaleDateString("en-IN") : "—"}</td><td className="p-3">{new Date(item.createdAt).toLocaleDateString("en-IN")}</td><td className="p-3">{["CREATED", "AUTHENTICATED", "ACTIVE", "PENDING", "HALTED", "PAUSED"].includes(item.status) && !item.cancelAtCycleEnd ? <button disabled={workingId === item.id} onClick={() => void cancel(item)} className="text-red underline disabled:opacity-50">Schedule cancel</button> : "—"}</td></tr>)}</tbody>
        </table>
        {!loading && subscriptions.length === 0 && <p className="p-6 text-center text-muted">No donor subscriptions yet.</p>}
        {loading && <p className="p-6 text-center text-muted">Loading subscriptions…</p>}
      </div>
    </section>
  </div>;
}
