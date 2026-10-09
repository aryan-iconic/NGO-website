export const ENABLED_LOCALES = ["hi", "te", "ta"] as const;

export const TRANSLATABLE_MODELS = [
  { key: "category", label: "Categories", delegate: "category", fields: ["name"] },
  { key: "sevaArea", label: "Seva areas", delegate: "sevaArea", fields: ["name", "description", "objectives"] },
  { key: "campaign", label: "Campaigns", delegate: "campaign", fields: ["title", "shortDescription", "story", "beneficiaryInfo", "impactDescription", "locationText"] },
  { key: "campaignProduct", label: "Campaign products", delegate: "campaignProduct", fields: ["name", "description", "unitName"] },
  { key: "campaignUpdate", label: "Campaign updates", delegate: "campaignUpdate", fields: ["title", "content"] },
  { key: "campaignMilestone", label: "Campaign milestones", delegate: "campaignMilestone", fields: ["title", "unit"] },
  { key: "campaignFaq", label: "Campaign FAQs", delegate: "campaignFaq", fields: ["question", "answer"] },
  { key: "event", label: "Events", delegate: "event", fields: ["title", "description", "venue", "location", "organizer"] },
  { key: "blogPost", label: "Blog posts", delegate: "blogPost", fields: ["title", "excerpt", "content", "author"] },
  { key: "faq", label: "FAQs", delegate: "faq", fields: ["question", "answer", "category"] },
  { key: "instagramPost", label: "Instagram posts", delegate: "instagramPost", fields: ["title", "caption"] },
  { key: "youTubeVideo", label: "YouTube videos", delegate: "youTubeVideo", fields: ["title", "description"] },
  { key: "galleryItem", label: "Gallery items", delegate: "galleryItem", fields: ["title", "caption", "description", "category", "altText"] },
  { key: "teamMember", label: "Team members", delegate: "teamMember", fields: ["name", "role", "bio"] },
  { key: "statutoryRegistration", label: "Transparency records", delegate: "statutoryRegistration", fields: ["title", "description", "issuingAuthority"] },
  { key: "siteSettings", label: "Homepage, About, and legal page text", delegate: "setting", fields: [] },
] as const;

export function isTranslatableSettingKey(key: string) {
  return /^(home\.(hero\.(title|subtitle)|giveOnce|featured|seva|upcomingInitiatives|followOurJourney|watchOurVideos|howItWorks|step[1-5]|ctaTitle|ctaBody)|about\.(title|subtitle|s[1-7]\.(h|p\d*|btn))|(priv|terms|don|ref)\.(title|s\d+\.(h|p))|footer\.tagline|contact\.address)$/.test(key);
}

const PROTECTED_TERMS = [
  "Shri Nityanikunj Ras Seva Sansthan Trust",
  "Shri Nityanikunj Trust",
  "Nityanikunj",
  "BrandName",
];

type TranslationMetadata = { source?: string; updated_at?: string };
type LocaleTranslations = Record<string, string | Record<string, TranslationMetadata>> & {
  _meta?: Record<string, TranslationMetadata>;
};
type Translations = Record<string, LocaleTranslations>;

function protectTerms(text: string) {
  const placeholders: Record<string, string> = {};
  let protectedText = text;
  PROTECTED_TERMS.forEach((term, index) => {
    const regex = new RegExp(term, "gi");
    protectedText = protectedText.replace(regex, (match) => {
      const placeholder = `__PRTCTD${index}__`;
      placeholders[placeholder] = match;
      return placeholder;
    });
  });
  return { text: protectedText, placeholders };
}

function splitLongText(text: string, maxLength: number) {
  const chunks: string[] = [];
  let remaining = text;
  while (remaining.length > maxLength) {
    let splitAt = remaining.lastIndexOf(" ", maxLength);
    if (splitAt < maxLength * 0.5) splitAt = maxLength;
    chunks.push(remaining.slice(0, splitAt));
    remaining = remaining.slice(splitAt);
  }
  if (remaining) chunks.push(remaining);
  return chunks;
}

async function callGoogleTranslate(text: string, locale: string): Promise<string> {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_TRANSLATE_API_KEY is not configured.");
  const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: text, target: locale, source: "en", format: "text" }),
  });
  if (!response.ok) throw new Error(`Google Translate returned ${response.status}.`);
  const payload: unknown = await response.json();
  const translatedText = payload && typeof payload === "object"
    ? (payload as { data?: { translations?: Array<{ translatedText?: unknown }> } }).data?.translations?.[0]?.translatedText
    : undefined;
  if (typeof translatedText !== "string") throw new Error("Google Translate returned an invalid response.");
  return translatedText;
}

async function callLibreTranslate(text: string, locale: string): Promise<string> {
  const baseUrl = process.env.LIBRETRANSLATE_URL?.trim().replace(/\/$/, "");
  if (!baseUrl) throw new Error("LIBRETRANSLATE_URL is not configured.");
  const response = await fetch(`${baseUrl}/translate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      q: text,
      target: locale,
      source: "en",
      format: "text",
      ...(process.env.LIBRETRANSLATE_API_KEY ? { api_key: process.env.LIBRETRANSLATE_API_KEY } : {}),
    }),
  });
  if (!response.ok) throw new Error(`LibreTranslate returned ${response.status}.`);
  const payload: unknown = await response.json();
  const translatedText = payload && typeof payload === "object"
    ? (payload as { translatedText?: unknown }).translatedText
    : undefined;
  if (typeof translatedText !== "string") {
    throw new Error("LibreTranslate returned an invalid response.");
  }
  return translatedText;
}

export function hasTranslationProvider() {
  return Boolean(process.env.GOOGLE_TRANSLATE_API_KEY || process.env.LIBRETRANSLATE_URL);
}

async function translateWithAvailableProvider(text: string, locale: string): Promise<string> {
  const googleConfigured = Boolean(process.env.GOOGLE_TRANSLATE_API_KEY);
  const libreConfigured = Boolean(process.env.LIBRETRANSLATE_URL);
  if (googleConfigured) {
    try {
      return await callGoogleTranslate(text, locale);
    } catch (error) {
      if (!libreConfigured) throw error;
      console.warn("Google translation failed; trying LibreTranslate.", error);
    }
  }
  if (libreConfigured) return callLibreTranslate(text, locale);
  throw new Error("No translation provider is configured. Set GOOGLE_TRANSLATE_API_KEY or LIBRETRANSLATE_URL.");
}

export async function translateTexts(texts: string[], targetLocale: string): Promise<string[]> {
  if (targetLocale === "en") return texts;
  if (!ENABLED_LOCALES.includes(targetLocale as (typeof ENABLED_LOCALES)[number])) {
    throw new Error(`Translation is not enabled for locale ${targetLocale}.`);
  }
  const prepared = texts.map((text) => protectTerms(text));
  const output = new Array<string>(texts.length);
  const work: Array<{ index: number; chunks: string[]; placeholders: Record<string, string> }> = [];
  prepared.forEach(({ text, placeholders }, index) => {
    work.push({ index, chunks: splitLongText(text, 4000), placeholders });
  });

  const requests: Array<{ workIndex: number; chunkIndex: number; text: string }> = [];
  work.forEach((item, workIndex) => item.chunks.forEach((text, chunkIndex) => requests.push({ workIndex, chunkIndex, text })));
  const translatedChunks: string[][] = work.map((item) => new Array<string>(item.chunks.length));

  // Keep concurrent request groups small for both hosted providers.
  for (let start = 0; start < requests.length; start += 5) {
    const batch = requests.slice(start, start + 5);
    const translations = await Promise.all(batch.map((item) => translateWithAvailableProvider(item.text, targetLocale)));
    batch.forEach((item, index) => { translatedChunks[item.workIndex][item.chunkIndex] = translations[index]; });
  }

  work.forEach((item) => {
    let translated = translatedChunks[item.index].join("");
    Object.entries(item.placeholders).forEach(([placeholder, original]) => {
      translated = translated.split(placeholder).join(original);
    });
    output[item.index] = translated;
  });
  return output;
}

export async function translateText(text: string, targetLocale: string): Promise<string> {
  if (!text || typeof text !== "string" || targetLocale === "en") return text;
  return (await translateTexts([text], targetLocale))[0];
}

export async function generateAllTranslations(
  sourceRecord: Record<string, unknown>,
  fieldsToTranslate: string[],
  options: { onlyMissing?: boolean } = {},
): Promise<Translations> {
  const savedTranslations = sourceRecord.translations;
  const translations: Translations = savedTranslations && typeof savedTranslations === "object"
    ? structuredClone(savedTranslations) as Translations
    : {};
  for (const locale of ENABLED_LOCALES) {
    if (!translations[locale]) translations[locale] = {};
  }

  const jobs = ENABLED_LOCALES.map(async (locale) => {
    const fields: string[] = [];
    const sourceTexts: string[] = [];
    for (const field of fieldsToTranslate) {
      const text = sourceRecord[field];
      if (typeof text !== "string" || !text.trim()) continue;
      const metadata = translations[locale]._meta?.[field];
      if (metadata?.source === "manual") continue;
      if (options.onlyMissing && typeof translations[locale][field] === "string" && translations[locale][field] !== text) continue;
      fields.push(field);
      sourceTexts.push(text);
    }
    if (!fields.length) return;

    const translatedTexts = await translateTexts(sourceTexts, locale);
    const updatedAt = new Date().toISOString();
    fields.forEach((field, index) => {
      translations[locale][field] = translatedTexts[index];
      if (!translations[locale]._meta) translations[locale]._meta = {};
      translations[locale]._meta[field] = { source: "auto", updated_at: updatedAt };
    });
  });
  await Promise.all(jobs);
  return translations;
}

export function resolveLocalizedRecord<T extends Record<string, unknown>>(record: T, locale: string): T {
  if (!record || locale === "en") return record;
  const translations = record.translations as Translations | null;
  const localeData = translations?.[locale];
  if (!localeData) return record;
  const localized = { ...record };
  for (const [key, value] of Object.entries(localeData)) {
    if (key !== "_meta" && typeof value === "string" && value) (localized as Record<string, unknown>)[key] = value;
  }
  return localized;
}
