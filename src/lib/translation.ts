export const ENABLED_LOCALES = ["hi", "te", "ta"];

const PROTECTED_TERMS = [
  "Shri Nityanikunj Ras Seva Sansthan Trust",
  "Shri Nityanikunj Trust",
  "Nityanikunj",
  "BrandName"
];

export async function translateText(text: string, targetLocale: string): Promise<string> {
  if (!text || typeof text !== "string") return text;
  if (targetLocale === "en") return text;

  // Protect terms
  let processableText = text;
  const placeholders: Record<string, string> = {};
  
  PROTECTED_TERMS.forEach((term, index) => {
    // Use regex to replace all occurrences ignoring case, but retaining exact case for restoration
    const regex = new RegExp(term, "gi");
    processableText = processableText.replace(regex, (match) => {
      const ph = `__PRTCTD${index}__`;
      placeholders[ph] = match;
      return ph;
    });
  });

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLocale}&dt=t&q=${encodeURIComponent(processableText)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Translation API failed");
    const data = await response.json();
    let translated = data[0].map((item: any) => item[0]).join("");
    
    // Restore protected terms
    Object.keys(placeholders).forEach((ph) => {
      translated = translated.split(ph).join(placeholders[ph]);
    });
    
    return translated;
  } catch (error) {
    console.error(`Translation error for ${targetLocale}:`, error);
    return text; // fallback to English on error
  }
}

export async function generateAllTranslations(sourceRecord: any, fieldsToTranslate: string[]): Promise<any> {
  const translations: any = sourceRecord.translations || {};

  for (const locale of ENABLED_LOCALES) {
    if (!translations[locale]) {
      translations[locale] = {};
    }

    for (const field of fieldsToTranslate) {
      const sourceText = sourceRecord[field];
      if (!sourceText) continue;

      // Check if translation exists and is manually overridden
      const existingMeta = translations[locale]._meta?.[field];
      if (existingMeta && existingMeta.source === "manual") {
        continue; // Do not overwrite manual translations
      }

      // Generate automatic translation
      const translated = await translateText(sourceText, locale);
      translations[locale][field] = translated;
      
      // Update meta
      if (!translations[locale]._meta) translations[locale]._meta = {};
      translations[locale]._meta[field] = {
        source: "auto",
        updated_at: new Date().toISOString()
      };
    }
  }

  return translations;
}

export function resolveLocalizedRecord<T extends Record<string, any>>(record: T, locale: string): T {
  if (!record || locale === "en") return record;
  
  const translations = record.translations as any;
  if (!translations || !translations[locale]) return record;

  const localized = { ...record };
  const localeData = translations[locale];

  for (const key of Object.keys(localeData)) {
    if (key === "_meta") continue;
    if (localeData[key]) {
      (localized as any)[key] = localeData[key];
    }
  }

  return localized;
}
