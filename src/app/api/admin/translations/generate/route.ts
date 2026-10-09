import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { ENABLED_LOCALES, generateAllTranslations, hasTranslationProvider, isTranslatableSettingKey, TRANSLATABLE_MODELS } from "@/lib/translation";

const cursorSchema = z.object({ modelIndex: z.number().int().min(0), skip: z.number().int().min(0) });
type TranslationDelegate = {
  findMany(args: { skip: number; take: number; orderBy: { id: "asc" } }): Promise<Array<Record<string, unknown>>>;
  update(args: { where: { id: string }; data: { translations: unknown } }): Promise<unknown>;
};

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  if (!hasTranslationProvider()) {
    return NextResponse.json({ success: false, error: { message: "Configure GOOGLE_TRANSLATE_API_KEY or LIBRETRANSLATE_URL in the hosting environment to generate translations. LIBRETRANSLATE_API_KEY is optional and depends on the instance." } }, { status: 503 });
  }
  const parsed = cursorSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ success: false, error: { message: "Invalid translation cursor." } }, { status: 400 });

  let { modelIndex, skip } = parsed.data;
  while (modelIndex < TRANSLATABLE_MODELS.length) {
    const model = TRANSLATABLE_MODELS[modelIndex];
    if (model.delegate === "setting") {
      const settings = (await prisma.setting.findMany({ orderBy: { key: "asc" } })).filter((setting) => isTranslatableSettingKey(setting.key));
      const setting = settings[skip];
      if (!setting) {
        modelIndex++;
        skip = 0;
        continue;
      }
      const oldTranslations = (setting.translations && typeof setting.translations === "object" ? setting.translations : {}) as Record<string, string>;
      const recordTranslations: Record<string, Record<string, unknown>> = {};
      for (const locale of ENABLED_LOCALES) {
        const translated = oldTranslations[locale];
        if (translated && translated !== setting.value) {
          recordTranslations[locale] = { [setting.key]: translated, _meta: { [setting.key]: { source: "manual" } } };
        }
      }
      const generated = await generateAllTranslations({ [setting.key]: setting.value, translations: recordTranslations }, [setting.key], { onlyMissing: true });
      const translations = { ...oldTranslations };
      for (const locale of ENABLED_LOCALES) {
        const value = generated[locale]?.[setting.key];
        if (typeof value === "string" && value) translations[locale] = value;
      }
      await prisma.setting.update({ where: { id: setting.id }, data: { translations } });
      return NextResponse.json({ success: true, processed: 1, model: model.label, cursor: { modelIndex, skip: skip + 1 }, done: false });
    }
    const delegate = (prisma as unknown as Record<string, TranslationDelegate>)[model.delegate];
    const records = await delegate.findMany({ skip, take: 1, orderBy: { id: "asc" } });
    if (!records.length) {
      modelIndex++;
      skip = 0;
      continue;
    }

    const record = records[0];
    const translations = await generateAllTranslations(record, [...model.fields], { onlyMissing: true });
    await delegate.update({ where: { id: String(record.id) }, data: { translations } });
    return NextResponse.json({ success: true, processed: 1, model: model.label, cursor: { modelIndex, skip: skip + 1 }, done: false });
  }

  return NextResponse.json({ success: true, processed: 0, cursor: { modelIndex, skip: 0 }, done: true });
}
