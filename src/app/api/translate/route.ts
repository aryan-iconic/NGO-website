import { NextResponse } from "next/server";
import { isLocale } from "@/lib/locales";
import { prisma } from "@/lib/prisma";
import { createHash } from "crypto";
import { ENABLED_LOCALES, translateTexts } from "@/lib/translation";

// Fallback to memory cache if Redis is not configured
const memCache = new Map<string, string>();
type TranslateItem = { text: string; isSensitive?: boolean };

function isTranslateItem(item: unknown): item is TranslateItem {
  return !!item && typeof item === "object" && "text" in item && typeof item.text === "string";
}

function hashSource(text: string, locale: string) {
  return createHash("sha256").update(`${locale}:${text}`).digest("hex");
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as { target?: unknown; items?: unknown };
    const { target, items } = body;

    if (typeof target !== "string" || !isLocale(target) || target === "en" || !ENABLED_LOCALES.includes(target as (typeof ENABLED_LOCALES)[number])) {
      return NextResponse.json({ error: "Invalid target locale" }, { status: 400 });
    }

    if (!Array.isArray(items) || items.length === 0 || items.length > 100) {
      return NextResponse.json({ error: "Invalid items array" }, { status: 400 });
    }

    // Filter items to ensure they are valid
    const validItems = items.filter((item): item is TranslateItem =>
      isTranslateItem(item) && item.text.trim().length > 0 && item.text.length < 5000
    );
    if (validItems.length === 0) return NextResponse.json({ translations: [] });

    // Step 1: Check DB for existing translations to avoid duplicate API calls
    const sourceHashes = validItems.map(item => hashSource(item.text, target));
    const existingTranslations = await prisma.translation.findMany({
      where: {
        sourceHash: { in: sourceHashes },
        locale: target,
      }
    });

    const translationMap = new Map<string, string>();
    existingTranslations.forEach(t => {
      translationMap.set(t.sourceText, t.translatedText);
    });

    const itemsToTranslate = validItems.filter(item => !translationMap.has(item.text) && !memCache.has(hashSource(item.text, target)));
    
    // Fill memCache ones
    validItems.forEach(item => {
      const h = hashSource(item.text, target);
      if (memCache.has(h) && !translationMap.has(item.text)) {
        translationMap.set(item.text, memCache.get(h)!);
      }
    });

    const autoTranslatingItems = itemsToTranslate.filter(i => !i.isSensitive);
    const sensitiveItems = itemsToTranslate.filter(i => i.isSensitive);

    if (autoTranslatingItems.length > 0) {
      try {
        const translatedTexts = await translateTexts(autoTranslatingItems.map((item) => item.text), target);
        const newTranslations = autoTranslatingItems.map((item, index) => ({
          sourceText: item.text,
          sourceHash: hashSource(item.text, target),
          locale: target,
          translatedText: translatedTexts[index],
          status: "AUTO",
          isManual: false,
        }));
        await prisma.translation.createMany({ data: newTranslations, skipDuplicates: true });
        newTranslations.forEach((translation) => {
          translationMap.set(translation.sourceText, translation.translatedText);
          memCache.set(translation.sourceHash, translation.translatedText);
        });
      } catch (error) {
        console.error("Google Translate API Error", error);
      }
    }

    if (sensitiveItems.length > 0) {
      // Insert sensitive items as REVIEW_REQUIRED, falling back to English text initially
      const newSensitiveTranslations = sensitiveItems.map(item => ({
        sourceText: item.text,
        sourceHash: hashSource(item.text, target),
        locale: target,
        translatedText: item.text, // fallback
        status: "REVIEW_REQUIRED",
        sourceType: "LEGAL",
        isManual: false,
      }));

      await prisma.translation.createMany({
        data: newSensitiveTranslations,
        skipDuplicates: true
      });

      newSensitiveTranslations.forEach(t => {
        translationMap.set(t.sourceText, t.translatedText);
        memCache.set(t.sourceHash, t.translatedText);
      });
    }

    const finalTranslations = items.map((item) => isTranslateItem(item) ? translationMap.get(item.text) || item.text : "");

    return NextResponse.json({ translations: finalTranslations });

  } catch (error) {
    console.error("Translation route error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
