"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Menu, X, Search, LogOut, Languages } from "lucide-react";
import { Logo } from "./logo";
import { LinkButton } from "@/components/ui/button";
import { useI18n, TranslationKey } from "@/lib/i18n";

const links: { href: string; key: TranslationKey }[] = [
  { href: "/campaigns", key: "nav.campaigns" },
  { href: "/events", key: "nav.events" },
  { href: "/gallery", key: "nav.gallery" },
  { href: "/blog", key: "nav.blog" },
  { href: "/volunteer", key: "nav.volunteer" },
  { href: "/contact", key: "nav.contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<{ name: string } | null>(null);
  const router = useRouter();
  const { locale, setLocale, t } = useI18n();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user));
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container-app flex h-16 items-center justify-between">
        <Link href="/" aria-label="Shri Nityanikunj Trust home">
          <Logo />
        </Link>

        <nav className="hidden lg:flex items-center gap-7" aria-label="Primary">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-text hover:text-primary transition-colors"
            >
              {t(l.key)}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <button aria-label="Search" className="p-2 text-muted hover:text-primary transition-colors">
            <Search size={18} />
          </button>
          <button
            aria-label={locale === "en" ? "Switch to Hindi" : "Switch to English"}
            onClick={() => setLocale(locale === "en" ? "hi" : "en")}
            className="flex items-center gap-1 p-2 text-xs font-medium text-muted hover:text-primary transition-colors"
          >
            <Languages size={16} />
            {locale === "en" ? "हिं" : "EN"}
          </button>
          {user ? (
            <>
              <LinkButton href="/user/dashboard" variant="ghost" size="sm">
                {user.name.split(" ")[0]}
              </LinkButton>
              <button
                aria-label="Logout"
                onClick={logout}
                className="p-2 text-muted hover:text-red transition-colors"
              >
                <LogOut size={17} />
              </button>
            </>
          ) : (
            <LinkButton href="/login" variant="ghost" size="sm">
              {t("nav.login")}
            </LinkButton>
          )}
          <LinkButton href="/donate" size="sm">
            {t("nav.donate")}
          </LinkButton>
        </div>

        <button
          type="button"
          className="lg:hidden p-4 -mr-4 text-maroon relative z-50 touch-manipulation cursor-pointer"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <span className="pointer-events-none flex items-center justify-center">
            {open ? <X size={28} /> : <Menu size={28} />}
          </span>
        </button>
      </div>

      {open && (
        <nav
          className="lg:hidden border-t border-border bg-background px-5 py-4 flex flex-col gap-1"
          aria-label="Mobile"
        >
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="py-3 text-base border-b border-border/60 last:border-none"
            >
              {t(l.key)}
            </Link>
          ))}
          <button
            onClick={() => setLocale(locale === "en" ? "hi" : "en")}
            className="py-3 text-left text-sm text-muted flex items-center gap-2"
          >
            <Languages size={16} />
            {locale === "en" ? "हिन्दी में देखें" : "View in English"}
          </button>
          <div className="flex gap-3 mt-4">
            <LinkButton href={user ? "/user/dashboard" : "/login"} variant="outline" className="flex-1">
              {user ? user.name.split(" ")[0] : t("nav.login")}
            </LinkButton>
            <LinkButton href="/donate" className="flex-1">
              {t("nav.donate")}
            </LinkButton>
          </div>
        </nav>
      )}
    </header>
  );
}
