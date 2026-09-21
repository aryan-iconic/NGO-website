"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function TwoFactorPanel() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [setupData, setSetupData] = useState<{ secret: string; qrCodeDataUrl: string } | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = () => {
    fetch("/api/admin/me")
      .then((r) => r.json())
      .then((d) => d.success && setEnabled(d.admin.twoFactorEnabled));
  };

  useEffect(refresh, []);

  const startSetup = async () => {
    setError(null);
    const res = await fetch("/api/admin/2fa/setup", { method: "POST" });
    const data = await res.json();
    if (data.success) setSetupData(data);
  };

  const confirmSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/2fa/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    setLoading(false);
    if (!data.success) {
      setError(data.error?.message ?? "Invalid code.");
      return;
    }
    setSetupData(null);
    setCode("");
    refresh();
  };

  const disable = async () => {
    setLoading(true);
    await fetch("/api/admin/2fa/disable", { method: "POST" });
    setLoading(false);
    refresh();
  };

  if (enabled === null) return null;

  return (
    <div className="p-5 rounded-lg border border-border bg-surface max-w-md">
      <p className="font-medium text-maroon">Two-Factor Authentication</p>
      <p className="text-sm text-muted mt-1">
        {enabled
          ? "Enabled — an authenticator app code is required at every sign-in."
          : "Not enabled. Strongly recommended for Super Admin and Finance Admin accounts."}
      </p>

      {enabled && (
        <Button variant="outline" size="sm" className="mt-4" onClick={disable} disabled={loading}>
          {loading ? "Disabling…" : "Disable 2FA"}
        </Button>
      )}

      {!enabled && !setupData && (
        <Button size="sm" className="mt-4" onClick={startSetup}>
          Set Up 2FA
        </Button>
      )}

      {setupData && (
        <div className="mt-4 space-y-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={setupData.qrCodeDataUrl} alt="Scan this QR code with your authenticator app" className="rounded-lg border border-border" width={180} height={180} />
          <p className="text-xs text-muted">
            Scan with Google Authenticator, Authy, or similar. Can't scan? Enter this key manually:{" "}
            <code className="text-[11px]">{setupData.secret}</code>
          </p>
          <form onSubmit={confirmSetup} className="flex gap-2">
            <input
              required
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="6-digit code"
              className="flex-1 rounded-lg border border-border px-3 py-2 text-sm bg-background"
            />
            <Button type="submit" size="sm" disabled={loading || code.length !== 6}>
              {loading ? "Verifying…" : "Confirm"}
            </Button>
          </form>
          {error && <p className="text-sm text-red">{error}</p>}
        </div>
      )}
    </div>
  );
}
