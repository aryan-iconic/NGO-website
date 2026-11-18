import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { ENABLED_LOCALES, TRANSLATABLE_MODELS } from "@/lib/translation";
import { translationSourceHash } from "@/lib/translation-hash";
import { invalidateServerTranslations } from "@/lib/i18n-server";
import { dictionary } from "@/lib/i18n-dictionary";
import type { Prisma } from "@prisma/client";

type ContentRecord = Record<string, unknown> & { id: string; translations: Prisma.JsonValue | null };
type ContentDelegate = {
  findUnique(args: { where: { id: string }; select: Record<string, true> }): Promise<ContentRecord | null>;
  update(args: { where: { id: string }; data: { translations: unknown }; select: Record<string, true> }): Promise<ContentRecord>;
};

const updateSchema = z.object({
  translatedText: z.string().trim().min(1).max(20_000).optional(),
  status: z.enum(["AUTO", "REVIEW_REQUIRED", "APPROVED", "REJECTED"]).optional(),
  isManual: z.boolean().optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(["SUPER_ADMIN", "ADMIN", "CONTENT_ADMIN"]);
  if (auth.error) return auth.error;
  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ success: false, error: { message: "Invalid translation update." } }, { status: 400 });
  const { id } = await params;

  try {
    if (id.startsWith("table:")) {
      const rowId = id.slice("table:".length);
      const row = await prisma.translation.findUnique({ where: { id: rowId } });
      if (!row) return NextResponse.json({ success: false, error: { message: "Translation not found." } }, { status: 404 });
      const changedText = parsed.data.translatedText !== undefined;
      const dictionaryKey = row.sourceId ? null : Object.entries(dictionary.en).find(([, text]) => text === row.sourceText)?.[0] ?? null;
      const legacySetting = !row.sourceId && !dictionaryKey ? await prisma.setting.findFirst({ where: { value: row.sourceText }, select: { key: true, value: true } }) : null;
      const ownerKey = row.sourceId ?? dictionaryKey ?? legacySetting?.key ?? row.sourceText;
      const setting = row.sourceId ? await prisma.setting.findUnique({ where: { key: row.sourceId }, select: { value: true } }) : null;
      const currentSource = row.sourceId ? dictionary.en[row.sourceId as keyof typeof dictionary.en] ?? setting?.value ?? row.sourceText : row.sourceText;
      const stale = row.sourceType === "UI" && Boolean(row.sourceId) && (row.sourceText !== currentSource || row.sourceHash !== translationSourceHash(currentSource, row.locale, ownerKey));
      if (stale && parsed.data.status === "APPROVED" && !changedText) {
        return NextResponse.json({ success: false, error: { message: "The English source changed. Update the translation text before approving it." } }, { status: 409 });
      }
      const status = parsed.data.status ?? (changedText ? "APPROVED" : row.status);
      const updated = await prisma.translation.update({
        where: { id: rowId },
        data: {
          ...(!row.sourceId ? { sourceType: "UI", sourceId: ownerKey, sourceText: currentSource, sourceHash: translationSourceHash(currentSource, row.locale, ownerKey) } : {}),
          ...(stale && changedText ? { sourceText: currentSource, sourceHash: translationSourceHash(currentSource, row.locale, ownerKey) } : {}),
          ...(parsed.data.translatedText !== undefined ? { translatedText: parsed.data.translatedText } : {}),
          status,
          isManual: parsed.data.isManual ?? (changedText || status === "APPROVED" ? true : status === "AUTO" ? false : row.isManual),
        },
      });
      if (row.locale) invalidateServerTranslations(row.locale);
      return NextResponse.json({ success: true, data: { ...updated, id, ownerType: "UI text / stable key", ownerId: updated.sourceId, field: updated.sourceId, stale: false } });
    }

    if (!id.startsWith("content.")) return NextResponse.json({ success: false, error: { message: "Invalid translation reference." } }, { status: 400 });
    const reference = JSON.parse(Buffer.from(id.slice("content.".length), "base64url").toString("utf8")) as { delegate: string; ownerId: string; locale: string; field: string };
    const model = TRANSLATABLE_MODELS.find((entry) => entry.delegate === reference.delegate && entry.delegate !== "setting");
    if (!model || !reference.ownerId || !ENABLED_LOCALES.includes(reference.locale as (typeof ENABLED_LOCALES)[number]) || !model.fields.includes(reference.field as never)) {
      return NextResponse.json({ success: false, error: { message: "Invalid content translation reference." } }, { status: 400 });
    }
    const delegate = (prisma as unknown as Record<string, ContentDelegate>)[model.delegate];
    const record = await delegate.findUnique({ where: { id: reference.ownerId }, select: { id: true, translations: true, [reference.field]: true } });
    if (!record) return NextResponse.json({ success: false, error: { message: "Content record not found." } }, { status: 404 });
    const sourceValue = record[reference.field];
    const sourceText = typeof sourceValue === "string" ? sourceValue : "";
    const translations = record.translations && typeof record.translations === "object" && !Array.isArray(record.translations)
      ? structuredClone(record.translations) as Record<string, Record<string, unknown>>
      : {};
    const localeData: Record<string, unknown> = translations[reference.locale] ?? {};
    const metadata = localeData._meta && typeof localeData._meta === "object" ? localeData._meta as Record<string, Record<string, unknown>> : {};
    const previous = metadata[reference.field] ?? {};
    const currentHash = translationSourceHash(sourceText, reference.locale, reference.field);
    const stale = Boolean(previous.source_hash && previous.source_hash !== currentHash);
    if (stale && parsed.data.status === "APPROVED" && parsed.data.translatedText === undefined) {
      return NextResponse.json({ success: false, error: { message: "The English source changed. Update the translation text before approving it." } }, { status: 409 });
    }
    if (parsed.data.translatedText !== undefined) localeData[reference.field] = parsed.data.translatedText;
    const status = parsed.data.status ?? (parsed.data.translatedText !== undefined ? "APPROVED" : previous.status ?? "AUTO");
    metadata[reference.field] = {
      ...previous,
      source: parsed.data.isManual === false || status === "AUTO" ? "auto" : parsed.data.translatedText !== undefined || status === "APPROVED" ? "manual" : previous.source ?? "auto",
      source_hash: currentHash,
      status,
      updated_at: new Date().toISOString(),
    };
    localeData._meta = metadata;
    translations[reference.locale] = localeData;
    const updatedRecord = await delegate.update({ where: { id: reference.ownerId }, data: { translations }, select: { id: true, translations: true, [reference.field]: true } });
    const updatedTranslations = updatedRecord.translations && typeof updatedRecord.translations === "object" && !Array.isArray(updatedRecord.translations)
      ? updatedRecord.translations as Record<string, unknown>
      : {};
    const updatedLocale = updatedTranslations[reference.locale];
    const updatedValues = updatedLocale && typeof updatedLocale === "object" && !Array.isArray(updatedLocale)
      ? updatedLocale as Record<string, unknown>
      : {};
    const updatedMetadata = updatedValues._meta && typeof updatedValues._meta === "object" ? updatedValues._meta as Record<string, Record<string, unknown>> : {};
    const updatedMeta = updatedMetadata[reference.field];
    invalidateServerTranslations(reference.locale);
    return NextResponse.json({ success: true, data: {
      id,
      ownerType: model.label,
      ownerId: reference.ownerId,
      field: reference.field,
      sourceText: updatedRecord[reference.field],
      locale: reference.locale,
      translatedText: updatedValues[reference.field] ?? "",
      status: updatedMeta?.status ?? "AUTO",
      isManual: updatedMeta?.source === "manual",
      stale: false,
    } });
  } catch (error) {
    console.error("Could not update translation:", error);
    return NextResponse.json({ success: false, error: { message: "Could not update the translation." } }, { status: 500 });
  }
}
