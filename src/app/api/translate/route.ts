import { NextResponse } from "next/server";
import { isLocale } from "@/lib/locales";
import { prisma } from "@/lib/prisma";
import { ENABLED_LOCALES, hasTranslationProvider, translateTexts } from "@/lib/translation";
import { legacyTranslationSourceHash, translationSourceHash } from "@/lib/translation-hash";
import { rateLimit } from "@/lib/rate-limit";
import { upsertUiTranslation } from "@/lib/translation-store";

type TranslateItem = { text: string; key?: string; fallbackText?: string; isSensitive?: boolean };
function isTranslateItem(item: unknown): item is TranslateItem {
  return !!item && typeof item === "object" && "text" in item && typeof item.text === "string";
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!rateLimit(`translate:${ip}`, 60, 60_000)) {
      return NextResponse.json({ error: "Translation request limit reached. Please wait a minute." }, { status: 429 });
    }
    const body = await request.json() as { target?: unknown; items?: unknown };
    const { target, items } = body;
    if (typeof target !== "string" || !isLocale(target) || target === "en" || !ENABLED_LOCALES.includes(target as (typeof ENABLED_LOCALES)[number])) {
      return NextResponse.json({ error: "Invalid target locale." }, { status: 400 });
    }
    if (!Array.isArray(items) || items.length < 1 || items.length > 20) {
      return NextResponse.json({ error: "Submit between 1 and 20 translation items at a time." }, { status: 400 });
    }
    const validItems = items.filter(isTranslateItem);
    if (validItems.length !== items.length || validItems.some((item) => !item.text.trim() || item.text.length > 1500 || (item.key && item.key.length > 240) || (item.fallbackText && item.fallbackText.length > 1500)) || validItems.reduce((total, item) => total + item.text.length, 0) > 10_000) {
      return NextResponse.json({ error: "Translation text or key is invalid or exceeds the request limit." }, { status: 400 });
    }

    const keys = validItems.map((item) => item.key?.trim() || item.text);
    const newHashes = validItems.map((item, index) => translationSourceHash(item.text, target, keys[index]));
    const legacyHashes = validItems.map((item) => legacyTranslationSourceHash(item.text, target));
    const existingRows = await prisma.translation.findMany({
      where: {
        locale: target,
        OR: [
          { sourceType: "UI", sourceId: { in: keys } },
          { sourceHash: { in: legacyHashes } },
        ],
      },
    });
    const byKey = new Map(existingRows.filter((row) => row.sourceType === "UI" && row.sourceId).map((row) => [row.sourceId!, row]));
    const legacyHashSet = new Set(legacyHashes);
    const byLegacyText = new Map(existingRows.filter((row) => !row.sourceId && legacyHashSet.has(row.sourceHash)).map((row) => [row.sourceText, row]));
    const resolved: Array<{ value: string; cacheable: boolean; forceSource?: boolean } | null> = validItems.map(() => null);
    const missing: number[] = [];

    for (let index = 0; index < validItems.length; index++) {
      const item = validItems[index];
      const key = keys[index];
      let row = byKey.get(key);
      if (!row) row = byLegacyText.get(item.text);
      if (row?.status === "REJECTED") {
        resolved[index] = { value: item.text, cacheable: false, forceSource: true };
        continue;
      }
      if (row?.sourceHash === newHashes[index] && ["APPROVED", "AUTO"].includes(row.status)) {
        resolved[index] = { value: row.translatedText, cacheable: true };
        continue;
      }
      if (row?.isManual) {
        if (row.status !== "REVIEW_REQUIRED") await prisma.translation.update({ where: { id: row.id }, data: { status: "REVIEW_REQUIRED" } });
        resolved[index] = { value: item.text, cacheable: false, forceSource: true };
        continue;
      }
      if (row?.status === "REVIEW_REQUIRED") {
        resolved[index] = { value: item.text, cacheable: false, forceSource: true };
        continue;
      }
      if (item.isSensitive) {
        await upsertUiTranslation({ key, sourceText: item.text, locale: target, translatedText: item.text, status: "REVIEW_REQUIRED", isManual: false, provider: "review-required", existingId: row?.id });
        resolved[index] = { value: item.text, cacheable: false, forceSource: true };
        continue;
      }
      if (item.fallbackText && item.fallbackText !== item.text) {
        await upsertUiTranslation({ key, sourceText: item.text, locale: target, translatedText: item.fallbackText, status: "AUTO", isManual: false, provider: "dictionary", existingId: row?.id });
        resolved[index] = { value: item.fallbackText, cacheable: true };
        continue;
      }
      if (!hasTranslationProvider()) {
        resolved[index] = { value: item.text, cacheable: false };
        continue;
      }
      missing.push(index);
    }

    if (missing.length) {
      const translated = await translateTexts(missing.map((index) => validItems[index].text), target);
      for (let offset = 0; offset < missing.length; offset++) {
        const index = missing[offset];
        const item = validItems[index];
        const key = keys[index];
        const row = byKey.get(key) ?? byLegacyText.get(item.text);
        await upsertUiTranslation({ key, sourceText: item.text, locale: target, translatedText: translated[offset], status: "AUTO", isManual: false, provider: process.env.GOOGLE_TRANSLATE_API_KEY ? "google" : "libretranslate", existingId: row?.id });
        resolved[index] = { value: translated[offset], cacheable: true };
      }
    }

    const results = validItems.map((item, index) => resolved[index] ?? { value: item.text, cacheable: false });
    return NextResponse.json({
      translations: results.map((result) => result.value),
      cacheable: results.map((result) => result.cacheable),
      forceSource: results.map((result) => result.forceSource ?? false),
    });
  } catch (error) {
    console.error("Translation route failed:", error);
    return NextResponse.json({ error: "Translation is temporarily unavailable. Please retry." }, { status: 503 });
  }
}
