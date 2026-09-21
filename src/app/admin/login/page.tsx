"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";

export default function AdminLoginPage() {
  const [form, setForm] = useState({ email: "admin@nityanikunj.org", password: "" });
  const [code, setCode] = useState("");
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!data.success) {
      setError(data.error?.message ?? "Login failed.");
      return;
    }
    if (data.requires2FA) {
      setPendingToken(data.pendingToken);
      return;
    }
    router.push("/admin");
    router.refresh();
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/admin/2fa/challenge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pendingToken, code }),
    });
    const data = await res.json();
    setLoading(false);
    if (!data.success) {
      setError(data.error?.message ?? "Invalid code.");
      return;
    }
    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-alt px-4">
      <div className="w-full max-w-sm p-8 rounded-lg border border-border bg-surface">
        <Logo className="justify-center" />

        {!pendingToken ? (
          <>
            <h1 className="mt-6 text-xl text-center font-serif text-maroon">Admin Sign In</h1>
            <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4">
              <div>
                <label className="text-sm text-muted" htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-border px-4 py-2.5 bg-background"
                />
              </div>
              <div>
                <label className="text-sm text-muted" htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-border px-4 py-2.5 bg-background"
                />
              </div>
              {error && <p className="text-sm text-red">{error}</p>}
              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? "Signing in…" : "Sign In"}
              </Button>
            </form>
            <p className="mt-5 text-xs text-muted text-center">
              Demo credentials: admin@nityanikunj.org / Admin@12345
            </p>
          </>
        ) : (
          <>
            <h1 className="mt-6 text-xl text-center font-serif text-maroon">Two-Factor Verification</h1>
            <p className="mt-2 text-sm text-muted text-center">
              Enter the 6-digit code from your authenticator app.
            </p>
            <form onSubmit={handleCodeSubmit} className="mt-6 space-y-4">
              <input
                required
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                autoFocus
                className="w-full text-center text-2xl tracking-[0.5em] rounded-lg border border-border px-4 py-3 bg-background"
              />
              {error && <p className="text-sm text-red text-center">{error}</p>}
              <Button type="submit" size="lg" className="w-full" disabled={loading || code.length !== 6}>
                {loading ? "Verifying…" : "Verify"}
              </Button>
              <button
                type="button"
                onClick={() => {
                  setPendingToken(null);
                  setCode("");
                  setError(null);
                }}
                className="w-full text-xs text-muted hover:text-primary"
              >
                ← Back
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
