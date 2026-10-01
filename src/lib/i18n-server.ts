import { cookies } from "next/headers";
import { Locale, isLocale } from "./locales";
import { dictionary } from "./i18n-dictionary";
import { prisma } from "@/lib/prisma";

// Module-level cache to prevent querying translation table on every server render
const serverCache = {
  translations: new Map<string, Record<string, string>>(),
  lastFetch: new Map<string, number>(),
  TTL_MS: 60000, // 60 seconds
};

export async function getServerTranslator() {
  const cookieStore = await cookies();
  const saved = cookieStore.get("NEXT_LOCALE")?.value;
  const locale: Locale = isLocale(saved) ? saved : "en";

  // Cache settings
  const settingsRows = await prisma.setting.findMany();
  const settings = settingsRows.reduce((acc: any, curr: any) => ({ 
    ...acc, 
    [curr.key]: { value: curr.value, translations: curr.translations } 
  }), {});

  // Check if we have a fresh cache for this locale
  const now = Date.now();
  const lastFetch = serverCache.lastFetch.get(locale) || 0;
  
  if (now - lastFetch > serverCache.TTL_MS) {
    const dbTranslations = await prisma.translation.findMany({
      where: { locale, status: { in: ["APPROVED", "AUTO", "REVIEW_REQUIRED"] } }
    });
    const map = dbTranslations.reduce((acc: Record<string, string>, curr: any) => {
      acc[curr.sourceText] = curr.translatedText;
      return acc;
    }, {});
    serverCache.translations.set(locale, map);
    serverCache.lastFetch.set(locale, now);
  }

  const translationMap = serverCache.translations.get(locale) || {};

  const t = (textOrKey: string, vars?: Record<string, any>) => {
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

    // 3. Dynamic English text translation - check pre-loaded DB translations
    if (locale === "en") return interpolate(textOrKey, vars);
    
    if (translationMap[textOrKey]) {
      return interpolate(translationMap[textOrKey], vars);
    }

    // 4. Return English fallback immediately
    return interpolate(textOrKey, vars);
  };

  return { t, locale };
}

function interpolate(text: string, vars?: Record<string, any>) {
  if (!vars) return text;
  return Object.keys(vars).reduce((acc, key) => {
    return acc.replace(new RegExp(`{${key}}`, "g"), vars[key]);
  }, text);
}
