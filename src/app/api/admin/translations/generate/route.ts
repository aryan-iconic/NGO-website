import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { dictionary } from "@/lib/i18n-dictionary";
import { ENABLED_LOCALES, generateAllTranslations, hasTranslationProvider, isTranslatableSettingKey, translateText, TRANSLATABLE_MODELS } from "@/lib/translation";
import { translationSourceHash } from "@/lib/translation-hash";
import { findUiTranslation, upsertUiTranslation } from "@/lib/translation-store";
import { invalidateServerTranslations } from "@/lib/i18n-server";

const cursorSchema = z.object({ modelIndex: z.number().int().min(0), lastId: z.string().nullable().default(null) });
type TranslationDelegate = {
  findMany(args: { where?: { id?: { gt: string } }; take: number; orderBy: { id: "asc" } }): Promise<Array<Record<string, unknown>>>;
  update(args: { where: { id: string }; data: { translations: unknown } }): Promise<unknown>;
};
const PAGE_MODELS = TRANSLATABLE_MODELS.filter((model) => model.delegate !== "setting");

async function processDictionaryKey(key: string) {
  const sourceText = dictionary.en[key as keyof typeof dictionary.en];
  if (!sourceText) return;
  for (const locale of ENABLED_LOCALES) {
    let translatedText = (dictionary[locale] as Record<string, string>)[key];
    const existing = await findUiTranslation(key, locale);
    const currentHash = translationSourceHash(sourceText, locale, key);
    if (existing?.status === "REJECTED") continue;
    if (existing?.sourceHash === currentHash && ["AUTO", "APPROVED"].includes(existing.status)) continue;
    if (existing?.isManual) {
      if (existing.status !== "REVIEW_REQUIRED") await prisma.translation.update({ where: { id: existing.id }, data: { status: "REVIEW_REQUIRED" } });
      continue;
    }
    let provider = "dictionary";
    if (!translatedText && hasTranslationProvider()) {
      translatedText = await translateText(sourceText, locale);
      provider = process.env.GOOGLE_TRANSLATE_API_KEY ? "google" : "libretranslate";
    }
    if (!translatedText) continue;
    await upsertUiTranslation({ key, sourceText, locale, translatedText, status: "AUTO", isManual: false, provider });
  }
}

async function processSetting(setting: { key: string; value: string; translations: unknown }) {
  if (!setting.value.trim()) return;
  const legacy = setting.translations && typeof setting.translations === "object" ? setting.translations as Record<string, unknown> : {};
  for (const locale of ENABLED_LOCALES) {
    const existing = await findUiTranslation(setting.key, locale);
    const currentHash = translationSourceHash(setting.value, locale, setting.key);
    if (existing?.status === "REJECTED") continue;
    if (existing?.sourceHash === currentHash && ["AUTO", "APPROVED"].includes(existing.status)) continue;
    if (existing?.isManual) {
      if (existing.status !== "REVIEW_REQUIRED") await prisma.translation.update({ where: { id: existing.id }, data: { status: "REVIEW_REQUIRED" } });
      continue;
    }
    const oldTranslation = legacy[locale];
    if (typeof oldTranslation === "string" && oldTranslation.trim()) {
      await upsertUiTranslation({ key: setting.key, sourceText: setting.value, locale, translatedText: oldTranslation, status: "AUTO", isManual: false, provider: "legacy-settings" });
      continue;
    }
    if (!hasTranslationProvider()) continue;
    const translatedText = await translateText(setting.value, locale);
    await upsertUiTranslation({ key: setting.key, sourceText: setting.value, locale, translatedText, status: "AUTO", isManual: false, provider: process.env.GOOGLE_TRANSLATE_API_KEY ? "google" : "libretranslate" });
  }
}

export async function POST(request: Request) {
  const auth = await requireAdmin(["SUPER_ADMIN", "ADMIN", "CONTENT_ADMIN"]);
  if (auth.error) return auth.error;
  const parsed = cursorSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ success: false, error: { message: "Backfill cursor is invalid. Reset it and start again." } }, { status: 400 });
  let { modelIndex, lastId } = parsed.data;

  try {
    // Phase 0: seed the stable UI keys from the reviewed, bundled dictionaries.
    if (modelIndex === 0) {
      const keys = Object.keys(dictionary.en).sort();
      const key = keys.find((candidate) => !lastId || candidate > lastId);
      if (key) {
        await processDictionaryKey(key);
        return NextResponse.json({ success: true, processed: 1, model: "UI dictionary", cursor: { modelIndex, lastId: key }, done: false });
      }
      modelIndex = 1;
      lastId = null;
    }

    // Phase 1: move page settings out of their legacy JSON maps and into the
    // same stable-key UI translation table used by public page text.
    if (modelIndex === 1) {
      const settings = await prisma.setting.findMany({ orderBy: { key: "asc" } });
      const setting = settings.find((row) => (!lastId || row.key > lastId) && isTranslatableSettingKey(row.key));
      if (setting) {
        await processSetting(setting);
        return NextResponse.json({ success: true, processed: 1, model: "Site settings", cursor: { modelIndex, lastId: setting.key }, done: false });
      }
      modelIndex = 2;
      lastId = null;
    }

    let pageModelIndex = modelIndex - 2;
    while (pageModelIndex < PAGE_MODELS.length) {
      const model = PAGE_MODELS[pageModelIndex];
      const delegate = (prisma as unknown as Record<string, TranslationDelegate>)[model.delegate];
      const records = await delegate.findMany({ where: lastId ? { id: { gt: lastId } } : undefined, take: 1, orderBy: { id: "asc" } });
      if (!records.length) {
        modelIndex += 1;
        pageModelIndex += 1;
        lastId = null;
        continue;
      }
      const record = records[0];
      const id = String(record.id);
      const translations = await generateAllTranslations(record, [...model.fields], { onlyMissing: true });
      await delegate.update({ where: { id }, data: { translations } });
      return NextResponse.json({ success: true, processed: 1, model: model.label, cursor: { modelIndex, lastId: id }, done: false });
    }
    invalidateServerTranslations();
    return NextResponse.json({ success: true, processed: 0, cursor: { modelIndex: 2 + PAGE_MODELS.length, lastId: null }, done: true });
  } catch (error) {
    console.error("Translation backfill failed:", error);
    return NextResponse.json({ success: false, error: { message: "Backfill could not process this source. Check the translation provider and server logs, then continue from the saved cursor." } }, { status: 503 });
  }
}
