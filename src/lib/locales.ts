export const LOCALES = [
  "en",
  "hi",
  "te",
  "ta",
  "bn",
  "mr",
  "gu",
  "kn",
  "ml",
  "pa",
  "or",
  "as",
  "ne",
  "sa",
  "ur",
  "es",
  "fr",
  "de",
  "ar",
  "zh",
  "ja",
] as const;

export type Locale = typeof LOCALES[number];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  hi: "हिन्दी",
  te: "తెలుగు",
  ta: "தமிழ்",
  bn: "বাংলা",
  mr: "मराठी",
  gu: "ગુજરાતી",
  kn: "ಕನ್ನಡ",
  ml: "മലയാളം",
  pa: "ਪੰਜਾਬੀ",
  or: "ଓଡ଼ିଆ",
  as: "অসমীয়া",
  ne: "नेपाली",
  sa: "संस्कृतम्",
  ur: "اردو",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  ar: "العربية",
  zh: "中文",
  ja: "日本語",
};

export const RTL_LOCALES = new Set<Locale>(["ur", "ar"]);

export function isLocale(locale: any): locale is Locale {
  return LOCALES.includes(locale as Locale);
}

export const BRAND = {
  en: "Shri Nityanikunj Ras Seva Sansthan Trust, Varanasi",
  hi: "श्री नित्यानिकुंज रस सेवा संस्थान ट्रस्ट, वाराणसी",
  te: "శ్రీ నిత్యానికుంజ్ రస్ సేవా సంస్థాన్ ట్రస్ట్, వారణాసి",
  ta: "ஸ்ரீ நித்யானிகுஞ்ச் ரஸ் சேவா சன்ஸ்தான் அறக்கட்டளை, வாரணாசி",
};
