import { prisma } from "@/lib/prisma";
import { translationSourceHash } from "@/lib/translation-hash";

export async function findUiTranslation(key: string, locale: string) {
  return prisma.translation.findFirst({ where: { sourceType: "UI", sourceId: key, locale } });
}

export async function upsertUiTranslation(input: {
  key: string;
  sourceText: string;
  locale: string;
  translatedText: string;
  status: "AUTO" | "APPROVED" | "REVIEW_REQUIRED" | "REJECTED";
  isManual?: boolean;
  provider?: string;
  existingId?: string;
}) {
  const sourceHash = translationSourceHash(input.sourceText, input.locale, input.key);
  const existing = input.existingId
    ? await prisma.translation.findUnique({ where: { id: input.existingId } })
    : await findUiTranslation(input.key, input.locale);
  const data = {
    sourceText: input.sourceText,
    sourceHash,
    locale: input.locale,
    translatedText: input.translatedText,
    status: input.status,
    isManual: input.isManual ?? input.status === "APPROVED",
    sourceType: "UI",
    sourceId: input.key,
    provider: input.provider ?? "google",
  };
  if (existing) return prisma.translation.update({ where: { id: existing.id }, data });
  try {
    return await prisma.translation.create({ data });
  } catch (error) {
    // A concurrent first request may have inserted the same stable key.
    const raced = await findUiTranslation(input.key, input.locale);
    if (!raced) throw error;
    return prisma.translation.update({ where: { id: raced.id }, data });
  }
}
