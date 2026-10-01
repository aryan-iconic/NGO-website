import { NextResponse } from "next/server";
import { isLocale } from "@/lib/locales";
import { prisma } from "@/lib/prisma";
import { createHash } from "crypto";
import { Redis } from "@upstash/redis";

// Initialize Redis only if configured
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN 
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    }) 
  : null;

// Fallback to memory cache if Redis is not configured
const memCache = new Map<string, string>();

function hashSource(text: string, locale: string) {
  return createHash("sha256").update(`${locale}:${text}`).digest("hex");
}

export async function POST(req: Request) {
  try {
    const { target, items } = await req.json();

    if (!isLocale(target) || target === "en") {
      return NextResponse.json({ error: "Invalid target locale" }, { status: 400 });
    }

    if (!Array.isArray(items) || items.length === 0 || items.length > 100) {
      return NextResponse.json({ error: "Invalid items array" }, { status: 400 });
    }

    // Filter items to ensure they are valid
    const validItems = items.filter((item: any) => 
      item && typeof item.text === "string" && item.text.trim().length > 0 && item.text.length < 5000
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
      // Fetch from Google Translate API
      const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
      if (apiKey) {
        try {
          const res = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              q: autoTranslatingItems.map(i => i.text),
              target: target,
              source: "en",
              format: "html" // preserves placeholders better, though custom placeholder protection is ideal
            })
          });

          if (res.ok) {
            const data = await res.json();
            const translatedTexts = data.data.translations.map((t: any) => t.translatedText);

            // Save to DB and MemCache
            const newTranslations = autoTranslatingItems.map((item, i) => ({
              sourceText: item.text,
              sourceHash: hashSource(item.text, target),
              locale: target,
              translatedText: translatedTexts[i],
              status: "AUTO",
              isManual: false,
            }));

            await prisma.translation.createMany({
              data: newTranslations,
              skipDuplicates: true
            });

            newTranslations.forEach(t => {
              translationMap.set(t.sourceText, t.translatedText);
              memCache.set(t.sourceHash, t.translatedText);
            });
          }
        } catch (e) {
          console.error("Google Translate API Error", e);
        }
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

    const finalTranslations = items.map((item: any) => translationMap.get(item.text) || item.text);

    return NextResponse.json({ translations: finalTranslations });

  } catch (error) {
    console.error("Translation route error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
