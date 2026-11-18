import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { z } from "zod";
import { getWhatsAppHref } from "@/lib/whatsapp";
import { ENABLED_LOCALES, hasTranslationProvider, isTranslatableSettingKey, translateTexts } from "@/lib/translation";
import { findUiTranslation, upsertUiTranslation } from "@/lib/translation-store";
import { invalidateServerTranslations } from "@/lib/i18n-server";

const settingsSchema = z.record(
  z.string(),
  z.union([
    z.string(),
    z.object({
      value: z.string(),
      translations: z.record(z.string(), z.string()).optional(),
    }),
  ])
);

export async function GET() {
  try {
    const auth = await requireAdmin(["SUPER_ADMIN", "ADMIN"]);
    if (auth.error) return auth.error;

    const settings = await prisma.setting.findMany();
    const settingsMap = Object.fromEntries(settings.map((setting) => [setting.key, { value: setting.value, translations: setting.translations }]));
    return NextResponse.json({ success: true, data: settingsMap });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: { message: "Internal Server Error" } }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAdmin(["SUPER_ADMIN", "ADMIN"]);
    if (auth.error) return auth.error;

    const body = await request.json();
    const result = settingsSchema.safeParse(body);
    if (!result.success) return NextResponse.json({ success: false, error: result.error }, { status: 400 });

    const updates = result.data;
    if (Object.hasOwn(updates, "donation.minimumAmountPaise")) {
      const value = updates["donation.minimumAmountPaise"];
      const amount = Number(typeof value === "string" ? value : value.value);
      if (!Number.isSafeInteger(amount) || amount < 100) {
        return NextResponse.json({ success: false, error: { message: "Minimum donation must be at least ₹1 (100 paise)." } }, { status: 400 });
      }
    }
    const keys = Object.keys(updates);
    const previousSettings = await prisma.setting.findMany({ where: { key: { in: keys } } });
    const previousByKey = new Map(previousSettings.map((setting) => [setting.key, setting]));
    const changedTextSettings = Object.entries(updates).flatMap(([key, data]) => {
      const value = typeof data === "string" ? data : data.value;
      return isTranslatableSettingKey(key) && value.trim() && previousByKey.get(key)?.value !== value ? [{ key, value }] : [];
    });
    const changedTextSettingKeys = new Set(changedTextSettings.map((setting) => setting.key));
    const generatedSettingTranslations = new Map<string, Record<string, string>>();
    let translationWarning: string | undefined;
    if (changedTextSettings.length) {
      if (!hasTranslationProvider()) {
        translationWarning = "Content was saved, but translations were not generated. Configure GOOGLE_TRANSLATE_API_KEY or LIBRETRANSLATE_URL and use Translate existing content to fill them.";
      } else {
        try {
          const translatedByLocale = await Promise.all(ENABLED_LOCALES.map(async (locale) => ({
            locale,
            texts: await translateTexts(changedTextSettings.map((setting) => setting.value), locale),
          })));
          changedTextSettings.forEach((setting, index) => {
            generatedSettingTranslations.set(setting.key, Object.fromEntries(translatedByLocale.map(({ locale, texts }) => [locale, texts[index]])));
          });
        } catch (error) {
          console.error("Could not translate site settings:", error);
          translationWarning = "Content was saved, but translations could not be generated. Check the configured translation provider and use Translate existing content to retry.";
        }
      }
    }

    if (Object.hasOwn(updates, "contact.whatsapp")) {
      const rawWhatsApp = updates["contact.whatsapp"];
      const value = typeof rawWhatsApp === "string" ? rawWhatsApp : rawWhatsApp.value;
      if (value.trim() && !getWhatsAppHref(value)) {
        return NextResponse.json({ success: false, error: { message: "Enter a WhatsApp number with country code or a valid https://wa.me link." } }, { status: 400 });
      }
    }
    
    await prisma.$transaction(
      Object.entries(updates).map(([key, data]) => {
        const val = typeof data === "string" ? data : data.value;
        const existingTranslations = { ...((previousByKey.get(key)?.translations ?? {}) as Record<string, string>) };
        if (changedTextSettingKeys.has(key)) {
          // If translation generation failed, serve the updated source text instead
          // of a stale prior translation. Newly supplied translations are merged below.
          for (const locale of ENABLED_LOCALES) delete existingTranslations[locale];
        }
        const explicitTranslations = typeof data === "string" ? {} : data.translations ?? {};
        const translations = { ...existingTranslations, ...generatedSettingTranslations.get(key), ...explicitTranslations };
        
        return prisma.setting.upsert({
          where: { key },
          update: { value: val, translations },
          create: { key, value: val, translations },
        });
      })
    );

    // Keep the UI translation table canonical for rendered settings. The JSON
    // map remains as a compatibility fallback while older clients are deployed.
    for (const [key, raw] of Object.entries(updates)) {
      if (!isTranslatableSettingKey(key)) continue;
      const value = typeof raw === "string" ? raw : raw.value;
      const explicit = typeof raw === "string" ? {} : raw.translations ?? {};
      const generated = generatedSettingTranslations.get(key) ?? {};
      const sourceChanged = changedTextSettingKeys.has(key);
      for (const locale of ENABLED_LOCALES) {
        const explicitText = explicit[locale];
        const existing = await findUiTranslation(key, locale);
        if (sourceChanged && existing?.isManual && !(typeof explicitText === "string" && explicitText.trim())) {
          if (existing.status !== "REVIEW_REQUIRED") await prisma.translation.update({ where: { id: existing.id }, data: { status: "REVIEW_REQUIRED" } });
          continue;
        }
        if (typeof explicitText === "string" && explicitText.trim()) {
          await upsertUiTranslation({ key, sourceText: value, locale, translatedText: explicitText.trim(), status: "APPROVED", isManual: true, provider: "manual" });
        } else if (typeof generated[locale] === "string" && generated[locale].trim()) {
          await upsertUiTranslation({ key, sourceText: value, locale, translatedText: generated[locale], status: "AUTO", isManual: false, provider: process.env.GOOGLE_TRANSLATE_API_KEY ? "google" : "libretranslate" });
        }
      }
    }

    revalidatePath("/", "layout");
    revalidateTag("public-site-settings", { expire: 0 });
    invalidateServerTranslations();
    return NextResponse.json({ success: true, warning: translationWarning });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: { message: "Internal Server Error" } }, { status: 500 });
  }
}
