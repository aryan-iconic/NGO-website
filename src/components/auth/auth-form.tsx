"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const { t } = useI18n();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [resendAvailable, setResendAvailable] = useState(false);
  const [resending, setResending] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (mode === "login" && new URLSearchParams(window.location.search).get("account") === "deactivated") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Show the one-time status from the current URL after hydration.
      setNotice(t("Your account is deactivated. Your donation records are retained; register again with the same email and verify it to restore access."));
    }
  }, [mode, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setResendAvailable(false);
    setLoading(true);
    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!data.success) {
      setError(t(data.error?.message ?? "Something went wrong."));
      if (data.error?.code === "VERIFICATION_EMAIL_FAILED" || data.error?.code === "EMAIL_IN_USE") setResendAvailable(true);
      return;
    }
    if (data.verificationRequired) {
      setResendAvailable(true);
      setNotice(t(mode === "login"
        ? "This account’s email is not verified yet. Request a verification link below, then use the link in your inbox before logging in."
        : data.accountRestored
          ? "We sent an account recovery link to {email}. Open it, verify this same email, and choose a new password to restore access to your retained donation history."
          : "We sent a verification link to {email}. Open it to verify your email, then log in. Only donations made with that exact email address will be linked to your account.", { email: data.email || form.email }));
      return;
    }
    router.push("/user/dashboard");
    router.refresh();
    } catch {
      setError(t("We couldn’t reach the server. Check your connection and try again."));
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async () => {
    setError(null); setResending(true);
    try {
      const res = await fetch("/api/auth/verification/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(t(data.error?.message || "Could not send the verification email."));
      setNotice(t(data.message || "If this address needs verification, we’ve sent an email with the next steps."));
    } catch (cause) { setError(cause instanceof Error ? cause.message : t("Could not send the verification email.")); }
    finally { setResending(false); }
  };

  return (
    <div className="container-app py-20 max-w-sm mx-auto">
      <h1 className="text-3xl text-center">{t(mode === "login" ? "Welcome Back" : "Create Account")}</h1>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {mode === "register" && (
          <div>
            <label className="text-sm text-muted" htmlFor="name">{t("Full Name")}</label>
            <input
              id="name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-border px-4 py-2.5 bg-surface"
            />
          </div>
        )}
        <div>
          <label className="text-sm text-muted" htmlFor="email">{t("Email")}</label>
          <input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="mt-1.5 w-full rounded-lg border border-border px-4 py-2.5 bg-surface"
          />
        </div>
        {mode === "register" && (
          <div>
            <label className="text-sm text-muted" htmlFor="phone">{t("Phone (optional)")}</label>
            <input
              id="phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-border px-4 py-2.5 bg-surface"
            />
          </div>
        )}
        <div className="relative">
          <label className="text-sm text-muted" htmlFor="password">{t("Password")}</label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={mode === "register" ? 8 : undefined}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-border px-4 py-2.5 bg-surface pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={t(showPassword ? "Hide password" : "Show password")}
              className="absolute right-3 top-1/2 -translate-y-1/2 mt-[3px] text-muted hover:text-text"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        {error && <p role="alert" className="text-sm text-red">{error}</p>}
        {notice && <p role="status" className="rounded-lg border border-primary/20 bg-cream p-3 text-sm text-maroon">{notice}</p>}
        {resendAvailable && <button type="button" disabled={resending || !form.email} onClick={resendVerification} className="w-full text-sm font-medium text-primary underline disabled:opacity-60">{resending ? t("Sending verification email…") : t("Resend verification email")}</button>}
        {mode === "login" && <div className="text-right"><Link href="/forgot-password" className="text-sm text-primary hover:underline">{t("Forgot password?")}</Link></div>}
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? t("Please wait…") : t(mode === "login" ? "Login" : "Create Account")}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        {mode === "login" ? (
          <>
            {t("New here?")} {" "}
            <Link href="/register" className="text-primary hover:text-secondary">
              {t("Create an account")}
            </Link>
          </>
        ) : (
          <>
            {t("Already have an account?")} {" "}
            <Link href="/login" className="text-primary hover:text-secondary">
              {t("Login")}
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
