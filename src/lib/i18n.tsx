"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Locale, isLocale } from "./locales";
import { dictionary, TranslationKey } from "./i18n-dictionary";

export type { Locale, TranslationKey };

type TranslateItem = { text: string; key: string; fallbackText?: string; isSensitive?: boolean };
type SiteSetting = { value?: unknown; translations?: unknown };
const translationCache: Record<string, Record<string, string>> = {};
const unavailableTranslations = new Set<string>();
const unavailableUntil = new Map<string, number>();
const translationCacheAt = new Map<string, number>();
const TRANSLATION_CACHE_TTL_MS = 60_000;
const forceEnglishFallback = new Set<string>();
const forceEnglishUntil = new Map<string, number>();
const inFlightTranslations = new Set<string>();
const failedAttempts = new Map<string, number>();
const retryTimers = new Map<string, ReturnType<typeof setTimeout>>();
let batchQueue: { locale: Locale; item: TranslateItem }[] = [];
let batchTimer: ReturnType<typeof setTimeout> | null = null;
const subscribers = new Set<() => void>();

const notifySubscribers = () => subscribers.forEach((callback) => callback());

async function fetchTranslations(locale: Locale, items: TranslateItem[]) {
  try {
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target: locale, items }),
    });
    if (!response.ok) throw new Error(`Translation service returned ${response.status}.`);
    const result = await response.json() as { translations?: string[]; cacheable?: boolean[]; forceSource?: boolean[] };
    if (!Array.isArray(result.translations) || result.translations.length !== items.length) {
      throw new Error("Translation service returned an invalid response.");
    }
    let changed = false;
    items.forEach((item, index) => {
      const id = `${locale}:${item.key}`;
      if (result.cacheable?.[index] === false) {
        unavailableTranslations.add(id);
        unavailableUntil.set(id, Date.now() + TRANSLATION_CACHE_TTL_MS);
        if (result.forceSource?.[index]) {
          forceEnglishFallback.add(id);
          forceEnglishUntil.set(id, Date.now() + TRANSLATION_CACHE_TTL_MS);
        }
        changed ||= Boolean(result.forceSource?.[index]);
        return;
      }
      if (!translationCache[locale]) translationCache[locale] = {};
      translationCache[locale][item.key] = result.translations![index];
      translationCacheAt.set(id, Date.now());
      unavailableUntil.delete(id);
      failedAttempts.delete(id);
      changed = true;
    });
    if (changed) notifySubscribers();
  } catch (error) {
    console.error("Translation request failed:", error);
    for (const item of items) {
      const id = `${locale}:${item.key}`;
      const attempt = (failedAttempts.get(id) ?? 0) + 1;
      failedAttempts.set(id, attempt);
      // Retry transient provider, network, and rate-limit errors a bounded
      // number of times. Failed source text is never stored as a translation.
      if (attempt <= 2 && !retryTimers.has(id)) {
        retryTimers.set(id, setTimeout(() => {
          retryTimers.delete(id);
          queueTranslation(locale, item);
        }, attempt * 1500));
      } else {
        unavailableTranslations.add(id);
        unavailableUntil.set(id, Date.now() + TRANSLATION_CACHE_TTL_MS);
      }
    }
  } finally {
    items.forEach((item) => inFlightTranslations.delete(`${locale}:${item.key}`));
  }
}

function flushTranslationQueue() {
  const queue = batchQueue;
  batchQueue = [];
  batchTimer = null;
  for (const locale of new Set(queue.map((entry) => entry.locale))) {
    void fetchTranslations(locale, queue.filter((entry) => entry.locale === locale).map((entry) => entry.item));
  }
}

function queueTranslation(locale: Locale, item: TranslateItem) {
  if (locale === "en") return;
  const id = `${locale}:${item.key}`;
  if (readTranslationCache(locale, item.key) !== undefined) return;
  if (unavailableTranslations.has(id)) {
    if (Date.now() < (unavailableUntil.get(id) ?? Number.POSITIVE_INFINITY)) return;
    unavailableTranslations.delete(id);
    unavailableUntil.delete(id);
    forceEnglishFallback.delete(id);
    forceEnglishUntil.delete(id);
  }
  if (inFlightTranslations.has(id)) return;
  inFlightTranslations.add(id);
  batchQueue.push({ locale, item });
  if (batchTimer) clearTimeout(batchTimer);
  if (batchQueue.length >= 20) flushTranslationQueue();
  else batchTimer = setTimeout(flushTranslationQueue, 40);
}

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (textOrKey: string, vars?: Record<string, unknown>, options?: { isSensitive?: boolean }) => string;
  getSetting: (key: string, fallback?: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);
const STORAGE_KEY = "snt_locale";

export function I18nProvider({ children, settings = {} }: { children: ReactNode; settings?: Record<string, SiteSetting> }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [, setTick] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const match = document.cookie.match(/(?:^| )NEXT_LOCALE=([^;]+)/);
    const saved = match?.[1] ?? localStorage.getItem(STORAGE_KEY);
    if (isLocale(saved) && ["en", "hi", "te", "ta"].includes(saved)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Restore the visitor's saved locale after hydration.
      setLocaleState(saved);
      document.documentElement.lang = saved;
      document.documentElement.dir = ["ur", "ar"].includes(saved) ? "rtl" : "ltr";
    }
    const subscriber = () => setTick((tick) => tick + 1);
    subscribers.add(subscriber);
    const handleAdminTranslation = (event: Event) => {
      const detail = (event as CustomEvent<{ locale: Locale; key: string; translatedText: string; status: string }>).detail;
      if (!detail?.locale || !detail.key) return;
      const id = `${detail.locale}:${detail.key}`;
      if (["APPROVED", "AUTO"].includes(detail.status)) {
        unavailableTranslations.delete(id);
        unavailableUntil.delete(id);
        if (!translationCache[detail.locale]) translationCache[detail.locale] = {};
        translationCache[detail.locale][detail.key] = detail.translatedText;
        translationCacheAt.set(id, Date.now());
        forceEnglishFallback.delete(id);
        forceEnglishUntil.delete(id);
      } else {
        unavailableTranslations.add(id);
        unavailableUntil.set(id, Date.now() + TRANSLATION_CACHE_TTL_MS);
        translationCacheAt.delete(id);
        if (translationCache[detail.locale]) delete translationCache[detail.locale][detail.key];
        if (["REJECTED", "REVIEW_REQUIRED"].includes(detail.status)) {
          forceEnglishFallback.add(id);
          forceEnglishUntil.set(id, Date.now() + TRANSLATION_CACHE_TTL_MS);
        } else {
          forceEnglishFallback.delete(id);
          forceEnglishUntil.delete(id);
        }
      }
      notifySubscribers();
    };
    window.addEventListener("translation-updated", handleAdminTranslation);
    return () => {
      subscribers.delete(subscriber);
      window.removeEventListener("translation-updated", handleAdminTranslation);
    };
  }, []);

  const [, startTransition] = useTransition();
  const setLocale = (nextLocale: Locale) => {
    if (!["en", "hi", "te", "ta"].includes(nextLocale)) return;
    localStorage.setItem(STORAGE_KEY, nextLocale);
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
    document.documentElement.dir = ["ur", "ar"].includes(nextLocale) ? "rtl" : "ltr";
    document.documentElement.lang = nextLocale;
    startTransition(() => {
      setLocaleState(nextLocale);
      router.refresh();
    });
  };

  const t = useCallback((textOrKey: string, vars?: Record<string, unknown>, options?: { isSensitive?: boolean }) => {
    if (!textOrKey) return "";
    const setting = settings[textOrKey];
    const englishDictionary = dictionary.en as Record<string, string>;
    const localeDictionary = (dictionary as Partial<Record<Locale, Record<string, string>>>)[locale] ?? {};
    const sourceText = typeof setting?.value === "string" ? setting.value : englishDictionary[textOrKey] ?? textOrKey;
    if (locale === "en") return interpolate(sourceText, vars);

    const cached = readTranslationCache(locale, textOrKey);
    if (cached !== undefined) return interpolate(cached, vars);
    if (hasForcedEnglish(locale, textOrKey)) return interpolate(sourceText, vars);

    const legacyTranslation = readSettingTranslation(setting, locale);
    const fallback = legacyTranslation ?? localeDictionary[textOrKey] ?? sourceText;
    const item: TranslateItem = {
      key: textOrKey,
      text: sourceText,
      ...(fallback !== sourceText ? { fallbackText: fallback } : {}),
      ...(options?.isSensitive ? { isSensitive: true } : {}),
    };
    queueTranslation(locale, item);
    return interpolate(fallback, vars);
  }, [locale, settings]);

  const getSetting = useCallback((key: string, fallback = "") => {
    const setting = settings[key];
    if (!setting || typeof setting.value !== "string" || !setting.value.trim()) return fallback;
    if (locale === "en") return setting.value;
    if (hasForcedEnglish(locale, key)) return setting.value;
    const cached = readTranslationCache(locale, key);
    if (cached !== undefined) return cached;
    const legacyTranslation = readSettingTranslation(setting, locale);
    queueTranslation(locale, { key, text: setting.value, ...(legacyTranslation ? { fallbackText: legacyTranslation } : {}) });
    return legacyTranslation || setting.value;
  }, [locale, settings]);

  return <I18nContext.Provider value={{ locale, setLocale, t, getSetting }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used within I18nProvider");
  return context;
}

function readSettingTranslation(setting: SiteSetting | undefined, locale: Locale): string | undefined {
  if (!setting?.translations || typeof setting.translations !== "object" || Array.isArray(setting.translations)) return undefined;
  const translation = (setting.translations as Record<string, unknown>)[locale];
  return typeof translation === "string" ? translation : undefined;
}

function readTranslationCache(locale: Locale, key: string): string | undefined {
  const id = `${locale}:${key}`;
  const cached = translationCache[locale]?.[key];
  if (cached === undefined) return undefined;
  if (Date.now() - (translationCacheAt.get(id) ?? 0) < TRANSLATION_CACHE_TTL_MS) return cached;
  delete translationCache[locale][key];
  translationCacheAt.delete(id);
  return undefined;
}

function hasForcedEnglish(locale: Locale, key: string) {
  const id = `${locale}:${key}`;
  if (!forceEnglishFallback.has(id)) return false;
  if (Date.now() < (forceEnglishUntil.get(id) ?? Number.POSITIVE_INFINITY)) return true;
  forceEnglishFallback.delete(id);
  forceEnglishUntil.delete(id);
  return false;
}

function interpolate(text: string, vars?: Record<string, unknown>) {
  if (!vars) return text;
  return Object.keys(vars).reduce((result, key) => result.replace(new RegExp(`{${key}}`, "g"), String(vars[key])), text);
}
