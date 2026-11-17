"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, CircleAlert, LoaderCircle } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { formatPaise } from "@/lib/types";

function ThankYouContent() {
  const params = useSearchParams();
  const confirmation = params.get("confirmation") || "";
  const [receipt, setReceipt] = useState("");
  const [state, setState] = useState<"loading" | "verified" | "invalid">("loading");
  const [amount, setAmount] = useState<number | null>(null);
  useEffect(() => {
    if (!confirmation) { setState("invalid"); return; }
    fetch(`/api/donations/receipt?confirmation=${encodeURIComponent(confirmation)}`, { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error();
        setAmount(data.amountPaise); setReceipt(data.receiptNumber); setState("verified");
      })
      .catch(() => setState("invalid"));
  }, [confirmation]);
  return <div className="container-app py-24 max-w-md mx-auto text-center">
    {state === "loading" ? <LoaderCircle size={52} className="mx-auto animate-spin text-primary" aria-label="Verifying donation" /> : state === "verified" ? <CheckCircle2 size={56} className="mx-auto text-success" /> : <CircleAlert size={56} className="mx-auto text-red" />}
    <h1 className="mt-6 text-3xl font-serif text-maroon">{state === "verified" ? "Thank You" : state === "loading" ? "Verifying your donation" : "Donation not verified"}</h1>
    {state === "verified" ? <><p className="mt-3 text-muted">Your donation of <span className="font-semibold text-maroon">{formatPaise(amount || 0)}</span> has been confirmed.</p><p className="mt-2 text-sm text-muted">Receipt number: <span className="font-mono text-text">{receipt}</span></p><p className="mt-2 text-sm text-muted">Receipt details are sent to the email used during checkout. Contact the Trust if you don’t receive them.</p></> : state === "invalid" ? <p role="alert" className="mt-3 text-muted">We could not confirm a completed donation for this receipt. Check your account or contact the Trust before retrying payment.</p> : <p className="mt-3 text-muted">Checking the payment record securely…</p>}
    <div className="mt-8 flex justify-center gap-3"><LinkButton href="/campaigns">Explore Campaigns</LinkButton><LinkButton href="/user/dashboard" variant="outline">View Dashboard</LinkButton></div>
  </div>;
}

export default function ThankYouPage() { return <Suspense><ThankYouContent /></Suspense>; }
