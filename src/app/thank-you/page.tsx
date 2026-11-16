"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { formatPaise } from "@/lib/types";

function ThankYouContent() {
  const params = useSearchParams();
  const receipt = params.get("receipt");
  const amount = params.get("amount");
  const emailSent = params.get("email") === "sent";

  return (
    <div className="container-app py-24 max-w-md mx-auto text-center">
      <CheckCircle2 size={56} className="mx-auto text-success" />
      <h1 className="mt-6 text-3xl">Thank You</h1>
      <p className="mt-3 text-muted">
        Your contribution of{" "}
        <span className="font-semibold text-maroon">{amount ? formatPaise(Number(amount)) : ""}</span> has
        been received. Your receipt number is shown below.
      </p>
      <p className="mt-2 text-sm text-muted">
        {emailSent
          ? "The donation details have also been sent to your email."
          : "We couldn’t confirm the receipt email was sent. Please check your inbox later or contact the Trust with your receipt number."}
      </p>
      {receipt && (
        <p className="mt-4 text-sm text-muted">
          Receipt number: <span className="font-mono text-text">{receipt}</span>
        </p>
      )}
      <div className="mt-8 flex justify-center gap-3">
        <LinkButton href="/campaigns">Explore More Campaigns</LinkButton>
        <LinkButton href="/user/dashboard" variant="outline">
          View Dashboard
        </LinkButton>
      </div>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense>
      <ThankYouContent />
    </Suspense>
  );
}
