"use client";

// Lightweight, client-side i18n for chrome/marketing copy (nav, buttons,
// section headings, footer). This is a deliberately simplified stand-in for
// the spec's next-intl + locale-prefixed-routing approach (Section 13 /
// "i18n and currency"): that approach server-renders each locale at its own
// URL (/hi/campaigns) and lets every field — including admin-authored
// campaign stories and blog posts — carry a translation. Building that
// properly means giving every content model a translations table and
// restructuring routing, which is real backend/schema work beyond a UI
// layer. What's here demonstrates the mechanism end-to-end (a working
// language toggle that actually re-renders the interface) for the parts of
// the UI that are static strings, so the architecture is visibly ready to
// extend — English is complete, Hindi covers primary navigation and calls
// to action; per-campaign Hindi copy is Release 2 per the spec's own phase
// table.

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Locale = "en" | "hi";

const dictionary = {
  en: {
    "nav.campaigns": "Campaigns",
    "nav.events": "Events",
    "nav.gallery": "Gallery",
    "nav.blog": "Blog",
    "nav.volunteer": "Volunteer",
    "nav.contact": "Contact",
    "nav.login": "Login",
    "nav.donate": "Donate",
    "hero.title": "A commitment to Seva, Culture and Social Welfare",
    "hero.titleLine2": "",
    "hero.donateNow": "Donate Now",
    "hero.joinSeva": "Join Our Seva",
    "home.seva": "Our Areas of Seva",
    "home.featured": "Featured Campaigns",
    "home.viewAll": "View all",
    "home.howItWorks": "How It Works",
    "home.monthlyTitle": "Give Every Month",
    "home.monthlyBody": "A small recurring contribution provides steady, predictable support for ongoing seva work.",
    "home.monthlyCta": "Start Monthly Giving",
    "home.ctaTitle": "Every contribution carries someone forward.",
    "home.ctaBody": "Whether it's a meal, a school kit, or an hour of your time — there's a way to help today.",
    "footer.tagline": "Shri Nityanikunj Ras Seva Sansthan Trust, Varanasi",
  },
  hi: {
    "nav.campaigns": "अभियान",
    "nav.events": "कार्यक्रम",
    "nav.gallery": "गैलरी",
    "nav.blog": "ब्लॉग",
    "nav.volunteer": "स्वयंसेवक",
    "nav.contact": "संपर्क करें",
    "nav.login": "लॉगिन",
    "nav.donate": "दान करें",
    "hero.title": "सेवा, संस्कार और समाज कल्याण की ओर एक संकल्प",
    "hero.titleLine2": "",
    "hero.donateNow": "अभी दान करें",
    "hero.joinSeva": "हमारी सेवा में जुड़ें",
    "home.seva": "हमारी सेवा के क्षेत्र",
    "home.featured": "प्रमुख अभियान",
    "home.viewAll": "सभी देखें",
    "home.howItWorks": "यह कैसे काम करता है",
    "home.monthlyTitle": "हर महीने दान करें",
    "home.monthlyBody": "एक छोटा नियमित योगदान चल रहे सेवा कार्य को निरंतर सहायता प्रदान करता है।",
    "home.monthlyCta": "मासिक दान शुरू करें",
    "home.ctaTitle": "हर योगदान किसी को आगे बढ़ाता है।",
    "home.ctaBody": "चाहे एक भोजन हो, एक स्कूल किट हो, या आपका एक घंटा — आज मदद करने का एक तरीका है।",
    "footer.tagline": "श्री नित्यानिकुंज रस सेवा संस्थान ट्रस्ट, वाराणसी",
  },
} as const;

export type TranslationKey = keyof typeof dictionary["en"];

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);
const STORAGE_KEY = "snt_locale";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved === "en" || saved === "hi") setLocaleState(saved);
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem(STORAGE_KEY, l);
  };

  const t = (key: TranslationKey) => dictionary[locale][key] ?? dictionary.en[key] ?? key;

  return <I18nContext.Provider value={{ locale, setLocale, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
