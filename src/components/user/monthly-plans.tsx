"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPaise } from "@/lib/types";

type Plan = { id: string; name: string; description: string | null; amountPaise: number; totalCycles: number };

export function MonthlyPlans() {
  const [plans, setPlans] = useState<Plan[] | null>(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/recurring/plans")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.error?.message || "Monthly plans are temporarily unavailable.");
        setPlans(data.plans);
      })
      .catch((cause) => {
        setPlans([]);
        setError(cause instanceof Error ? cause.message : "Monthly plans are temporarily unavailable.");
      });
  }, []);

  const subscribe = async (plan: Plan) => {
    setBusyId(plan.id); setError("");
    try {
      const response = await fetch("/api/recurring", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ planId: plan.id }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        if (response.status === 401) throw new Error("Sign in to a verified donor account to start monthly giving.");
        throw new Error(data.error?.message || "Could not start this monthly subscription.");
      }
      window.location.assign(data.checkoutUrl);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not start this monthly subscription."); }
    finally { setBusyId(null); }
  };

  if (plans === null) return <p className="mt-8 text-muted">Loading available plans…</p>;
  if (error && plans.length === 0) return <p role="alert" className="mt-8 text-red">{error}</p>;
  if (!plans.length) return <div className="mt-8 rounded-xl border border-border bg-surface p-6"><p className="font-medium text-maroon">Monthly plans are being prepared.</p><p className="mt-2 text-sm text-muted">The Trust has not published a monthly giving plan yet. No recurring payment will be scheduled until you choose a plan and authorize it with Razorpay.</p></div>;

  return <>
    {error && <p role="alert" className="mt-5 rounded-lg border border-red/30 bg-red/5 p-3 text-sm text-red">{error} <Link href="/login" className="underline">Sign in</Link></p>}
    <div className="mt-8 grid gap-4 sm:grid-cols-2">
      {plans.map((plan) => <article key={plan.id} className="flex flex-col rounded-xl border border-border bg-surface p-6 text-left shadow-sm">
        <h2 className="text-xl font-serif text-maroon">{plan.name}</h2>
        {plan.description && <p className="mt-2 text-sm text-muted">{plan.description}</p>}
        <p className="mt-5 text-3xl font-semibold text-maroon">{formatPaise(plan.amountPaise)}<span className="text-base font-normal text-muted"> / month</span></p>
        <p className="mt-1 text-xs text-muted">Up to {plan.totalCycles} monthly payments. Cancel from your account.</p>
        <button disabled={busyId === plan.id} onClick={() => void subscribe(plan)} className="mt-6 rounded-full bg-primary px-5 py-3 font-medium text-white disabled:opacity-60">
          {busyId === plan.id ? "Connecting to Razorpay…" : "Start monthly giving"}
        </button>
      </article>)}
    </div>
    <p className="mt-6 text-sm text-muted">You will review and authorize the recurring payment on Razorpay’s secure page. Your first and future charges are recorded in your donation history after Razorpay confirms each payment.</p>
  </>;
}
