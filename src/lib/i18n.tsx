"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useTransition, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Locale, isLocale, LOCALES } from "./locales";
import { dictionary, TranslationKey } from "./i18n-dictionary";

export type { Locale, TranslationKey };

// Client-side translation cache
const translationCache: Record<string, Record<string, string>> = {};

let batchQueue: { text: string, isSensitive?: boolean }[] = [];
let batchTimer: any = null;
let activeTranslations = new Set<string>();

type NotifyCallback = () => void;
const subscribers = new Set<NotifyCallback>();

const notifySubscribers = () => {
  subscribers.forEach((cb) => cb());
};

const fetchTranslations = async (locale: Locale, items: { text: string, isSensitive?: boolean }[]) => {
  if (items.length === 0 || locale === "en") return;
  try {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target: locale, items }),
    });
    if (!res.ok) return;
    const data = await res.json();
    if (data.translations && Array.isArray(data.translations)) {
      if (!translationCache[locale]) translationCache[locale] = {};
      items.forEach((item, i) => {
        translationCache[locale][item.text] = data.translations[i];
      });
      notifySubscribers();
    }
  } catch (error) {
    console.error("Translation error", error);
  }
};

const queueTranslation = (locale: Locale, text: string, options?: { isSensitive?: boolean }) => {
  if (locale === "en") return;
  if (!translationCache[locale]) translationCache[locale] = {};
  if (translationCache[locale][text] !== undefined) return;
  if (activeTranslations.has(`${locale}:${text}`)) return;
  
  activeTranslations.add(`${locale}:${text}`);
  batchQueue.push({ text, isSensitive: options?.isSensitive });

  if (batchTimer) clearTimeout(batchTimer);
  
  if (batchQueue.length >= 50) {
    const queueToProcess = [...batchQueue];
    batchQueue = [];
    fetchTranslations(locale, queueToProcess);
  } else {
    batchTimer = setTimeout(() => {
      const queueToProcess = [...batchQueue];
      batchQueue = [];
      fetchTranslations(locale, queueToProcess);
    }, 40);
  }
};

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (textOrKey: string, vars?: Record<string, any>, options?: { isSensitive?: boolean }) => string;
  getSetting: (key: string, fallback?: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);
const STORAGE_KEY = "snt_locale";

export function I18nProvider({ children, settings = {} }: { children: ReactNode, settings?: Record<string, any> }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [, setTick] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const match = document.cookie.match(new RegExp('(^| )NEXT_LOCALE=([^;]+)'));
    let saved = match ? match[2] : null;
    if (!saved) {
      saved = localStorage.getItem(STORAGE_KEY);
    }
    if (isLocale(saved)) {
      setLocaleState(saved);
      document.documentElement.dir = ["ur", "ar"].includes(saved) ? "rtl" : "ltr";
    }
    
    const unsubscribe = () => setTick(t => t + 1);
    subscribers.add(unsubscribe);
    return () => {
      subscribers.delete(unsubscribe);
    };
  }, []);

  const [isPending, startTransition] = useTransition();

  const setLocale = (l: Locale) => {
    localStorage.setItem(STORAGE_KEY, l);
    document.cookie = `NEXT_LOCALE=${l}; path=/; max-age=31536000; SameSite=Lax`;
    document.documentElement.dir = ["ur", "ar"].includes(l) ? "rtl" : "ltr";
    
    startTransition(() => {
      setLocaleState(l);
      router.refresh();
    });
  };

  const t = useCallback((textOrKey: string, vars?: Record<string, any>, options?: { isSensitive?: boolean }) => {
    if (!textOrKey) return "";
    
    // 1. Check settings overrides
    const setting = settings[textOrKey];
    if (setting) {
      if (locale === "en") return interpolate(setting.value, vars);
      if (setting.translations && setting.translations[locale]) return interpolate(setting.translations[locale], vars);
    }
    
    // 2. Check legacy dictionary
    const legacyDict = dictionary as any;
    if (legacyDict[locale]?.[textOrKey]) return interpolate(legacyDict[locale][textOrKey], vars);
    if (legacyDict.en?.[textOrKey]) return interpolate(legacyDict.en[textOrKey], vars);

    // 3. Dynamic English text translation
    if (locale === "en") return interpolate(textOrKey, vars);

    // Check client cache
    if (translationCache[locale]?.[textOrKey]) {
      return interpolate(translationCache[locale][textOrKey], vars);
    }

    // Queue for translation
    queueTranslation(locale, textOrKey, options);

    // 4. Return English fallback immediately
    return interpolate(textOrKey, vars);
  }, [locale, settings]);

  const getSetting = useCallback((key: string, fallback = "") => {
    const setting = settings[key];
    if (!setting || typeof setting.value !== "string" || !setting.value.trim()) return fallback;
    if (locale !== "en" && typeof setting.translations?.[locale] === "string" && setting.translations[locale].trim()) {
      return setting.translations[locale];
    }
    return setting.value;
  }, [locale, settings]);

  return <I18nContext.Provider value={{ locale, setLocale, t, getSetting }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

function interpolate(text: string, vars?: Record<string, any>) {
  if (!vars) return text;
  return Object.keys(vars).reduce((acc, key) => {
    return acc.replace(new RegExp(`{${key}}`, "g"), vars[key]);
  }, text);
}
