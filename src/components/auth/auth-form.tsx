"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!data.success) {
      setError(data.error?.message ?? "Something went wrong.");
      return;
    }
    router.push("/user/dashboard");
    router.refresh();
  };

  return (
    <div className="container-app py-20 max-w-sm mx-auto">
      <h1 className="text-3xl text-center">{mode === "login" ? "Welcome Back" : "Create Account"}</h1>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {mode === "register" && (
          <div>
            <label className="text-sm text-muted" htmlFor="name">Full Name</label>
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
          <label className="text-sm text-muted" htmlFor="email">Email</label>
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
            <label className="text-sm text-muted" htmlFor="phone">Phone (optional)</label>
            <input
              id="phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-border px-4 py-2.5 bg-surface"
            />
          </div>
        )}
        <div className="relative">
          <label className="text-sm text-muted" htmlFor="password">Password</label>
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
              className="absolute right-3 top-1/2 -translate-y-1/2 mt-[3px] text-muted hover:text-text"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        {error && <p className="text-sm text-red">{error}</p>}
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Please wait…" : mode === "login" ? "Login" : "Create Account"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        {mode === "login" ? (
          <>
            New here?{" "}
            <Link href="/register" className="text-primary hover:text-secondary">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:text-secondary">
              Login
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
