"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, CircleAlert, LoaderCircle } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { formatPaise } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

function ThankYouContent() {
  const { t } = useI18n();
  const params = useSearchParams();
  const confirmation = params.get("confirmation") || "";
  const [receipt, setReceipt] = useState("");
  const [state, setState] = useState<"loading" | "verified" | "invalid">("loading");
  const [amount, setAmount] = useState<number | null>(null);
  useEffect(() => {
    if (!confirmation) return;
    fetch(`/api/donations/receipt?confirmation=${encodeURIComponent(confirmation)}`, { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error();
        setAmount(data.amountPaise); setReceipt(data.receiptNumber); setState("verified");
      })
      .catch(() => setState("invalid"));
  }, [confirmation]);
  const displayState = confirmation ? state : "invalid";
  return <div className="container-app py-24 max-w-md mx-auto text-center">
    {displayState === "loading" ? <LoaderCircle size={52} className="mx-auto animate-spin text-primary" aria-label={t("Verifying donation")} /> : displayState === "verified" ? <CheckCircle2 size={56} className="mx-auto text-success" /> : <CircleAlert size={56} className="mx-auto text-red" />}
    <h1 className="mt-6 text-3xl font-serif text-maroon">{t(displayState === "verified" ? "Thank You" : displayState === "loading" ? "Verifying your donation" : "Donation not verified")}</h1>
    {displayState === "verified" ? <><p className="mt-3 text-muted">{t("Your donation of {amount} has been confirmed.", { amount: formatPaise(amount || 0) })}</p><p className="mt-2 text-sm text-muted">{t("Receipt number: {receipt}", { receipt })}</p><p className="mt-2 text-sm text-muted">{t("Receipt details are sent to the email used during checkout. Contact the Trust if you don’t receive them.")}</p></> : displayState === "invalid" ? <p role="alert" className="mt-3 text-muted">{t("We could not confirm a completed donation for this receipt. Check your account or contact the Trust before retrying payment.")}</p> : <p className="mt-3 text-muted">{t("Checking the payment record securely…")}</p>}
    <div className="mt-8 flex justify-center gap-3"><LinkButton href="/campaigns">{t("Explore Campaigns")}</LinkButton><LinkButton href="/user/dashboard" variant="outline">{t("View Dashboard")}</LinkButton></div>
  </div>;
}

export default function ThankYouPage() { return <Suspense><ThankYouContent /></Suspense>; }
