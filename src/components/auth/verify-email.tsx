"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function VerifyEmail({ token }: { token: string }) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);

  const verify = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error?.message || "Could not verify your email.");
      setVerified(true);
      setMessage(
        result.linkedDonations > 0
          ? `Your email is verified. ${result.linkedDonations} previous donation${result.linkedDonations === 1 ? " has" : "s have"} been linked to your account.`
          : "Your email is verified. Previous donations made with this exact email will appear in your account.",
      );
    } catch (verifyError) {
      setError(verifyError instanceof Error ? verifyError.message : "Could not verify your email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-app mx-auto max-w-md py-20 text-center">
      <h1 className="text-3xl text-maroon">Verify your email</h1>
      {message ? <p className="mt-4 text-muted">{message}</p> : <p className="mt-4 text-muted">Confirm that you own this email address to finish verification and link matching guest donations.</p>}
      {error && <p role="alert" className="mt-4 text-sm text-red">{error}</p>}
      {verified ? (
        <Link href="/login" className="mt-8 inline-block text-primary hover:underline">Continue to login</Link>
      ) : (
        <Button type="button" className="mt-8" disabled={!token || loading} onClick={verify}>
          {loading ? "Verifying…" : "Verify email address"}
        </Button>
      )}
      {!token && <p className="mt-4 text-sm text-red">This verification link is missing its token.</p>}
    </div>
  );
}
