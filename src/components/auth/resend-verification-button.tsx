"use client";

import { useState } from "react";

export function ResendVerificationButton() {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function resend() {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/auth/verification/resend", { method: "POST" });
      const data = await response.json();
      setMessage(data.success ? "Verification email sent. Check your inbox." : data.error?.message || "Could not send the email.");
    } catch {
      setMessage("Could not send the email. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-5">
      <button type="button" onClick={resend} disabled={busy} className="btn-primary disabled:opacity-60">
        {busy ? "Sending…" : "Resend verification email"}
      </button>
      {message && <p role="status" className="mt-3 text-sm text-muted">{message}</p>}
    </div>
  );
}
