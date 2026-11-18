import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdminId } from "@/lib/auth";
import { TRANSLATABLE_MODELS } from "@/lib/translation";
import { dictionary } from "@/lib/i18n-dictionary";
import { translationSourceHash } from "@/lib/translation-hash";
import type { Prisma } from "@prisma/client";

const PAGE_SIZE = 50;
type ContentCursor = { modelIndex: number; lastId: string | null; lastLocale?: string | null; lastField?: string | null };
function decodeCursor(value: string | null): ContentCursor {
  if (!value) return { modelIndex: 0, lastId: null };
  try {
    const cursor = JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
    if (Number.isInteger(cursor.modelIndex) && cursor.modelIndex >= 0 && (cursor.lastId === null || typeof cursor.lastId === "string") && (cursor.lastLocale == null || typeof cursor.lastLocale === "string") && (cursor.lastField == null || typeof cursor.lastField === "string")) return cursor;
  } catch { /* start at the first record for an invalid cursor */ }
  return { modelIndex: 0, lastId: null };
}

export async function GET(request: NextRequest) {
  try {
    if (!(await getCurrentAdminId())) return NextResponse.json({ success: false, error: { message: "Unauthorized" } }, { status: 401 });
    const params = request.nextUrl.searchParams;
    const locale = params.get("locale") || undefined;
    const status = params.get("status") || undefined;
    const q = params.get("q")?.trim() || undefined;
    const source = params.get("source") === "content" ? "content" : "ui";
    const cursor = params.get("cursor");

    if (source === "ui") {
      const where: Prisma.TranslationWhereInput = { OR: [{ sourceType: "UI" }, { sourceId: null }] };
      if (locale) where.locale = locale;
      if (status) where.status = status;
      if (q) where.AND = [{ OR: [
        { sourceText: { contains: q, mode: "insensitive" } },
        { translatedText: { contains: q, mode: "insensitive" } },
        { sourceId: { contains: q, mode: "insensitive" } },
      ] }];
      const rows = await prisma.translation.findMany({
        where,
        orderBy: { id: "asc" },
        take: PAGE_SIZE + 1,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      });
      const hasMore = rows.length > PAGE_SIZE;
      const page = hasMore ? rows.slice(0, PAGE_SIZE) : rows;
      const settingKeys = page.map((row) => row.sourceId).filter((key): key is string => Boolean(key));
      const legacyTexts = page.filter((row) => !row.sourceId).map((row) => row.sourceText);
      const pageSettings = settingKeys.length || legacyTexts.length ? await prisma.setting.findMany({
        where: { OR: [...(settingKeys.length ? [{ key: { in: settingKeys } }] : []), ...(legacyTexts.length ? [{ value: { in: legacyTexts } }] : [])] },
        select: { key: true, value: true },
      }) : [];
      const settingValues = new Map(pageSettings.map((setting) => [setting.key, setting.value]));
      const settingKeyByValue = new Map<string, string>();
      pageSettings.forEach((setting) => { if (!settingKeyByValue.has(setting.value)) settingKeyByValue.set(setting.value, setting.key); });
      return NextResponse.json({
        success: true,
        data: page.map((row) => ({
          ...row,
          id: `table:${row.id}`,
          ownerType: row.sourceId || Object.entries(dictionary.en).some(([, text]) => text === row.sourceText) || settingKeyByValue.has(row.sourceText) ? "UI text / stable key" : row.sourceType === "LEGAL" ? "Sensitive text" : "Legacy free text",
          ownerId: row.sourceId ?? Object.entries(dictionary.en).find(([, text]) => text === row.sourceText)?.[0] ?? settingKeyByValue.get(row.sourceText) ?? null,
          field: row.sourceId ?? Object.entries(dictionary.en).find(([, text]) => text === row.sourceText)?.[0] ?? settingKeyByValue.get(row.sourceText) ?? null,
          stale: row.sourceType === "UI" && Boolean(row.sourceId) && (() => {
            const currentSource = dictionary.en[row.sourceId as keyof typeof dictionary.en] ?? settingValues.get(row.sourceId!) ?? row.sourceText;
            return row.sourceText !== currentSource || row.sourceHash !== translationSourceHash(currentSource, row.locale, row.sourceId!);
          })(),
        })),
        nextCursor: hasMore ? page[page.length - 1]?.id ?? null : null,
      });
    }

    const models = TRANSLATABLE_MODELS.filter((model) => model.delegate !== "setting");
    let { modelIndex, lastId, lastLocale, lastField } = decodeCursor(cursor);
    const data: Array<Record<string, unknown>> = [];
    let hasMore = false;
    while (modelIndex < models.length && data.length < PAGE_SIZE) {
      const model = models[modelIndex];
      const where: { id?: { gt?: string; gte?: string } } = {};
      if (lastId) where.id = lastLocale && lastField ? { gte: lastId } : { gt: lastId };
      const delegate = (prisma as unknown as Record<string, { findMany(args: unknown): Promise<Array<Record<string, unknown>>> }>)[model.delegate];
      const records = await delegate.findMany({
        where,
        select: { id: true, translations: true, ...Object.fromEntries(model.fields.map((field) => [field, true])) },
        orderBy: { id: "asc" },
        take: PAGE_SIZE,
      });
      if (!records.length) {
        modelIndex += 1;
        lastId = null;
        continue;
      }
      let stopPage = false;
      for (const record of records) {
        const recordId = String(record.id);
        const locales = record.translations as Record<string, Record<string, unknown>> | null;
        const sortedLocales = Object.entries(locales ?? {}).sort(([a], [b]) => a.localeCompare(b));
        for (const [rowLocale, values] of sortedLocales) {
          if (locale && locale !== rowLocale) continue;
          for (const field of model.fields) {
            if (recordId === lastId && lastLocale && lastField && (rowLocale < lastLocale || (rowLocale === lastLocale && field <= lastField))) continue;
            const sourceText = record[field];
            const translatedText = values[field];
            if (typeof sourceText !== "string" || typeof translatedText !== "string") continue;
            const metadataMap = values._meta && typeof values._meta === "object" ? values._meta as Record<string, unknown> : {};
            const metadata = metadataMap[field] && typeof metadataMap[field] === "object" ? metadataMap[field] as { source?: string; source_hash?: string; status?: string; updated_at?: string } : undefined;
            const currentHash = translationSourceHash(sourceText, rowLocale, field);
            const stale = Boolean(metadata?.source_hash && metadata.source_hash !== currentHash);
            const rowStatus = stale ? "REVIEW_REQUIRED" : metadata?.status || (metadata?.source === "manual" ? "APPROVED" : "AUTO");
            if (status && rowStatus !== status) continue;
            if (q && !sourceText.toLowerCase().includes(q.toLowerCase()) && !translatedText.toLowerCase().includes(q.toLowerCase())) continue;
            const ownerRef = Buffer.from(JSON.stringify({ delegate: model.delegate, ownerId: recordId, locale: rowLocale, field }), "utf8").toString("base64url");
            data.push({ id: `content.${ownerRef}`, ownerType: model.label, ownerId: recordId, field, sourceText, locale: rowLocale, translatedText, sourceType: model.label, status: rowStatus, isManual: metadata?.source === "manual", stale, updatedAt: metadata?.updated_at ?? null });
            lastId = recordId;
            lastLocale = rowLocale;
            lastField = field;
            if (data.length >= PAGE_SIZE) { stopPage = true; break; }
          }
          if (stopPage) break;
        }
        if (stopPage) break;
        lastId = recordId;
        lastLocale = null;
        lastField = null;
      }
      if (stopPage) {
        hasMore = true;
        break;
      }
      if (records.length < PAGE_SIZE) {
        modelIndex += 1;
        lastId = null;
      } else {
        hasMore = true;
        break;
      }
    }
    const nextCursor = hasMore ? Buffer.from(JSON.stringify({ modelIndex, lastId, lastLocale, lastField }), "utf8").toString("base64url") : null;
    return NextResponse.json({ success: true, data, nextCursor });
  } catch (error) {
    console.error("Could not load Admin translations:", error);
    return NextResponse.json({ success: false, error: { message: "Could not load translations." } }, { status: 500 });
  }
}
