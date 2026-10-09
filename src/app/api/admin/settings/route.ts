import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { z } from "zod";
import { getWhatsAppHref } from "@/lib/whatsapp";
import { ENABLED_LOCALES, hasTranslationProvider, isTranslatableSettingKey, translateTexts } from "@/lib/translation";

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
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const settings = await prisma.setting.findMany();
    const settingsMap = Object.fromEntries(settings.map((setting) => [setting.key, { value: setting.value, translations: setting.translations }]));
    
    revalidatePath("/", "layout");
    return NextResponse.json({ success: true, data: settingsMap });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: { message: "Internal Server Error" } }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const body = await request.json();
    const result = settingsSchema.safeParse(body);
    if (!result.success) return NextResponse.json({ success: false, error: result.error }, { status: 400 });

    const updates = result.data;
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

    revalidatePath("/", "layout");
    return NextResponse.json({ success: true, warning: translationWarning });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: { message: "Internal Server Error" } }, { status: 500 });
  }
}
