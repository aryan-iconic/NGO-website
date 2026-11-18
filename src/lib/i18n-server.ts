import { cookies } from "next/headers";
import { Locale, isLocale } from "./locales";
import { dictionary } from "./i18n-dictionary";
import { prisma } from "@/lib/prisma";
import { ENABLED_LOCALES } from "./translation";
import { getServerSettings } from "./server-settings";
import { legacyTranslationSourceHash, translationSourceHash } from "./translation-hash";
import { revalidateTag, unstable_cache } from "next/cache";

const loadCachedTranslations = unstable_cache(
  async (locale: string) => prisma.translation.findMany({
    where: { locale, OR: [{ sourceType: "UI" }, { sourceId: null }] },
    select: { sourceText: true, sourceHash: true, translatedText: true, sourceType: true, sourceId: true, status: true },
  }),
  ["snt-ui-translations-v2"],
  { tags: ["snt-ui-translations"], revalidate: 60 },
);

export function invalidateServerTranslations(locale?: string) {
  // Cache tag is intentionally global because each entry may contain settings
  // and dictionary values referenced by several locales/keys.
  void locale;
  // Next's persistent cache is shared across serverless instances. Invalidate
  // it when Admin changes a translation so another Vercel instance cannot
  // continue serving its own stale module-level cache.
  revalidateTag("snt-ui-translations", { expire: 0 });
}

export async function getServerTranslator() {
  const cookieStore = await cookies();
  const saved = cookieStore.get("NEXT_LOCALE")?.value;
  const locale: Locale = saved && ["en", ...ENABLED_LOCALES].includes(saved) && isLocale(saved) ? saved : "en";

  const settingsPromise = getServerSettings().catch((error) => {
    console.error("Failed to load settings in getServerTranslator:", error);
    return [];
  });
  // English uses source text directly. Other locales use a persistent Next
  // cache with tag invalidation, avoiding a database read on every request.
  const translationsPromise = locale !== "en"
    ? loadCachedTranslations(locale).catch((error) => {
        console.error("Failed to fetch translations in getServerTranslator:", error);
        return null;
      })
    : Promise.resolve(null);
  const [settingsRows, dbTranslations] = await Promise.all([settingsPromise, translationsPromise]);

  const settings: Record<string, { value: string; translations: Record<string, string> | null }> = Object.fromEntries(
    settingsRows.map((row) => [row.key, { value: row.value, translations: asStringMap(row.translations) }]),
  );

  const blocked = new Set<string>();
  if (dbTranslations) {
    const currentSettingValues = new Map(settingsRows.map((row) => [row.key, row.value]));
    const map = dbTranslations.reduce((acc: Record<string, string>, curr) => {
      if (curr.sourceType === "UI" && curr.sourceId) {
        const currentSource = dictionary.en[curr.sourceId as keyof typeof dictionary.en] ?? currentSettingValues.get(curr.sourceId) ?? curr.sourceText;
        const current = curr.sourceText === currentSource && curr.sourceHash === translationSourceHash(currentSource, locale, curr.sourceId);
        if (curr.status === "REJECTED" || curr.status === "REVIEW_REQUIRED" || !current) blocked.add(curr.sourceId);
        else if (["APPROVED", "AUTO"].includes(curr.status)) acc[curr.sourceId] = curr.translatedText;
      } else if (curr.sourceHash === legacyTranslationSourceHash(curr.sourceText, locale)) {
        if (curr.status === "REJECTED" || curr.status === "REVIEW_REQUIRED") blocked.add(curr.sourceText);
        else if (["APPROVED", "AUTO"].includes(curr.status)) acc[curr.sourceText] = curr.translatedText;
      }
      return acc;
    }, {});
    const translationMap = map;
    const t = createTranslator(locale, settings, translationMap, blocked);
    return { t, locale };
  }

  return { t: createTranslator(locale, settings, {}), locale };
}

function createTranslator(locale: Locale, settings: Record<string, { value: string; translations: Record<string, string> | null }>, translationMap: Record<string, string>, blocked = new Set<string>()) {
  const t = (textOrKey: string, vars?: Record<string, unknown>, options?: { isSensitive?: boolean }) => {
    void options;
    if (!textOrKey) return "";
    
    // 1. Check settings overrides
    const setting = settings[textOrKey];
    if (locale !== "en" && blocked.has(textOrKey)) return interpolate(setting?.value ?? dictionary.en[textOrKey as keyof typeof dictionary.en] ?? textOrKey, vars);
    if (setting) {
      if (locale === "en") return interpolate(setting.value, vars);
      if (translationMap[textOrKey]) return interpolate(translationMap[textOrKey], vars);
      if (setting.translations && setting.translations[locale]) return interpolate(setting.translations[locale], vars);
    }
    
    // 2. Check legacy dictionary
    const localizedDictionary = (dictionary as Partial<Record<Locale, Record<string, string>>>)[locale] ?? {};
    const englishDictionary = dictionary.en as Record<string, string>;
    if (locale !== "en" && translationMap[textOrKey]) return interpolate(translationMap[textOrKey], vars);
    if (localizedDictionary[textOrKey]) return interpolate(localizedDictionary[textOrKey], vars);
    if (englishDictionary[textOrKey]) return interpolate(englishDictionary[textOrKey], vars);

    // 3. Dynamic English text translation - check pre-loaded DB translations
    if (locale === "en") return interpolate(textOrKey, vars);
    
    if (translationMap[textOrKey]) {
      return interpolate(translationMap[textOrKey], vars);
    }

    // 4. Return English fallback immediately
    return interpolate(textOrKey, vars);
  };

  return t;
}

function interpolate(text: string, vars?: Record<string, unknown>) {
  if (!vars) return text;
  return Object.keys(vars).reduce((acc, key) => {
    return acc.replace(new RegExp(`{${key}}`, "g"), String(vars[key]));
  }, text);
}

function asStringMap(value: unknown): Record<string, string> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return Object.fromEntries(Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === "string"));
}
