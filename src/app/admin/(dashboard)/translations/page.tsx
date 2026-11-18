"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

interface TranslationRow {
  id: string;
  sourceText: string;
  locale: string;
  translatedText: string;
  sourceType: string;
  status: string;
  isManual: boolean;
  stale?: boolean;
  ownerType?: string;
  ownerId?: string | null;
  field?: string | null;
}

type BackfillCursor = { modelIndex: number; lastId: string | null };
const BACKFILL_STORAGE_KEY = "snt_translation_backfill_cursor";

export default function AdminTranslationsPage() {
  const { t } = useI18n();
  const [translations, setTranslations] = useState<TranslationRow[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [localeFilter, setLocaleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState<"ui" | "content">("ui");
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [backfillRunning, setBackfillRunning] = useState(false);
  const [backfillProgress, setBackfillProgress] = useState("");
  const [backfillCursor, setBackfillCursor] = useState<BackfillCursor | null>(null);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(BACKFILL_STORAGE_KEY);
      if (saved) {
        const cursor = JSON.parse(saved);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Restore a resumable Admin backfill cursor after hydration.
        if (Number.isInteger(cursor.modelIndex) && (cursor.lastId === null || typeof cursor.lastId === "string")) setBackfillCursor(cursor);
        else sessionStorage.removeItem(BACKFILL_STORAGE_KEY);
      }
    } catch {
      sessionStorage.removeItem(BACKFILL_STORAGE_KEY);
    }
  }, []);

  const fetchTranslations = useCallback(async (cursor?: string | null, append = false) => {
    if (!append) setLoading(true);
    setError(null);
    const params = new URLSearchParams({ source: sourceFilter });
    if (searchTerm.trim()) params.set("q", searchTerm.trim());
    if (localeFilter) params.set("locale", localeFilter);
    if (statusFilter) params.set("status", statusFilter);
    if (cursor) params.set("cursor", cursor);
    try {
      const response = await fetch(`/api/admin/translations?${params.toString()}`, { cache: "no-store" });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error?.message || "Could not load translations.");
      setTranslations((current) => append ? [...current, ...result.data] : result.data);
      setNextCursor(result.nextCursor ?? null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load translations.");
    } finally {
      setLoading(false);
    }
  }, [localeFilter, searchTerm, sourceFilter, statusFilter]);

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams({ source: sourceFilter });
    if (searchTerm.trim()) params.set("q", searchTerm.trim());
    if (localeFilter) params.set("locale", localeFilter);
    if (statusFilter) params.set("status", statusFilter);
    fetch(`/api/admin/translations?${params.toString()}`, { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.error?.message || "Could not load translations.");
        if (active) {
          setError(null);
          setTranslations(result.data);
          setNextCursor(result.nextCursor ?? null);
          setDrafts({});
        }
      })
      .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Could not load translations."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [searchTerm, localeFilter, statusFilter, sourceFilter]);

  const handleUpdate = async (row: TranslationRow, updates: Partial<TranslationRow>) => {
    setSavingId(row.id);
    setError(null);
    try {
      const response = await fetch(`/api/admin/translations/${encodeURIComponent(row.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error?.message || "Failed to save translation.");
      setTranslations((current) => current.map((item) => item.id === row.id ? { ...item, ...result.data } : item));
      setDrafts((current) => { const next = { ...current }; delete next[row.id]; return next; });
      if (result.data.sourceType === "UI" && result.data.sourceId) {
        window.dispatchEvent(new CustomEvent("translation-updated", { detail: { locale: row.locale, key: result.data.sourceId, translatedText: result.data.translatedText, status: result.data.status } }));
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Failed to save translation.");
    } finally {
      setSavingId(null);
    }
  };

  const translateExistingContent = async () => {
    setBackfillRunning(true);
    setError(null);
    let cursor = backfillCursor ?? { modelIndex: 0, lastId: null };
    let processed = 0;
    setBackfillProgress("Preparing UI and content translations...");
    try {
      for (let requestCount = 0; requestCount < 10000; requestCount++) {
        const response = await fetch("/api/admin/translations/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cursor),
        });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.error?.message ?? "Could not backfill translations.");
        if (result.done) {
          setBackfillCursor(null);
          sessionStorage.removeItem(BACKFILL_STORAGE_KEY);
          setBackfillProgress(`Finished. Processed ${processed} source records.`);
          await fetchTranslations();
          return;
        }
        cursor = result.cursor;
        setBackfillCursor(cursor);
        sessionStorage.setItem(BACKFILL_STORAGE_KEY, JSON.stringify(cursor));
        processed += result.processed ?? 0;
        setBackfillProgress(`Processed ${processed} records. Current source: ${result.model}.`);
      }
      throw new Error("Backfill paused at its safety limit. Continue to resume from the saved record cursor.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not backfill translations.");
      setBackfillProgress(`Paused after processing ${processed} records.`);
    } finally {
      setBackfillRunning(false);
    }
  };

  return <div className="max-w-7xl space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h1 className="font-serif text-2xl text-maroon">{t("Translations Management")}</h1>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => fetchTranslations()} disabled={loading || backfillRunning}>{t("Refresh")}</Button>
        <Button onClick={translateExistingContent} disabled={backfillRunning}>
          {backfillRunning ? t("Preparing translations…") : backfillCursor ? t("Continue backfill") : t("Initialize / backfill translations")}
        </Button>
      </div>
    </div>
    <p className="max-w-3xl text-sm text-muted">
      {t("UI and page text is owned by stable translation keys. Campaigns, posts, events, and similar records keep translations with their content. This tool searches, edits, approves, rejects, and backfills both sources. New dynamic UI text is translated once and stored; saved content is translated when its source changes.")}
    </p>
    {backfillProgress && <p role="status" className="text-sm text-muted">{backfillProgress}</p>}
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-surface p-4">
      <input type="search" placeholder={t("Search source or translated text…")} value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} className="w-full max-w-sm rounded-lg border border-border bg-background px-3 py-2 text-sm" />
      <select value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value as "ui" | "content")} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
        <option value="ui">{t("UI and page text")}</option><option value="content">{t("Managed content")}</option>
      </select>
      <select value={localeFilter} onChange={(event) => setLocaleFilter(event.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
        <option value="">{t("All locales")}</option><option value="hi">Hindi</option><option value="te">Telugu</option><option value="ta">Tamil</option>
      </select>
      <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
        <option value="">{t("All statuses")}</option><option value="AUTO">{t("Auto translated")}</option><option value="REVIEW_REQUIRED">{t("Review required")}</option><option value="APPROVED">{t("Approved")}</option><option value="REJECTED">{t("Rejected")}</option>
      </select>
    </div>
    {error && <p role="alert" className="text-sm text-red">{error}</p>}
    <div className="overflow-x-auto rounded-lg border border-border bg-surface">
      {loading && translations.length === 0 ? <div className="p-8 text-center text-muted">Loading translations…</div> : <table className="w-full min-w-[850px] text-left text-sm">
        <thead className="bg-cream"><tr>
          <th className="w-[28%] p-3 font-medium">{t("English source")}</th><th className="w-[9%] p-3 font-medium">{t("Locale")}</th><th className="w-[32%] p-3 font-medium">{t("Translation")}</th><th className="w-[13%] p-3 font-medium">{t("Status")}</th><th className="w-[18%] p-3 font-medium">{t("Owner / actions")}</th>
        </tr></thead>
        <tbody className="divide-y divide-border">
          {translations.map((row) => {
            const translatedText = drafts[row.id] ?? row.translatedText;
            const isDirty = Object.hasOwn(drafts, row.id);
            return <tr key={row.id} className="align-top hover:bg-background/50">
              <td className="p-3"><p className="line-clamp-4 text-muted">{row.sourceText}</p><span className="mt-2 inline-block rounded bg-border/50 px-1.5 py-0.5 text-xs text-muted-foreground">{t(row.ownerType || row.sourceType)}</span>{row.stale && <p className="mt-1 text-xs text-amber-700">{t("Source changed; review required.")}</p>}</td>
              <td className="p-3 font-mono">{row.locale}</td>
              <td className="p-3"><textarea rows={3} className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm" value={translatedText} onChange={(event) => setDrafts((current) => ({ ...current, [row.id]: event.target.value }))} /></td>
              <td className="p-3"><select value={row.status} disabled={isDirty || savingId === row.id} onChange={(event) => handleUpdate(row, { status: event.target.value })} className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs disabled:opacity-50">
                <option value="AUTO">{t("AUTO")}</option><option value="REVIEW_REQUIRED">{t("REVIEW REQUIRED")}</option><option value="APPROVED">{t("APPROVED")}</option><option value="REJECTED">{t("REJECTED")}</option>
              </select></td>
              <td className="space-y-2 p-3"><p className="break-all text-xs text-muted">{row.ownerId || row.field || "Legacy text"}</p>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" disabled={savingId === row.id || !isDirty} onClick={() => handleUpdate(row, { translatedText, isManual: true, status: "APPROVED" })}>{savingId === row.id ? t("Saving…") : t("Save & approve")}</Button>
                  {!isDirty && row.status !== "APPROVED" && <Button size="sm" variant="outline" disabled={savingId === row.id} onClick={() => handleUpdate(row, { status: "APPROVED", isManual: true })}>{t("Approve")}</Button>}
                </div>
              </td>
            </tr>;
          })}
          {!loading && translations.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted">{t("No translations match these filters. Run the backfill to initialize dictionary and settings entries.")}</td></tr>}
        </tbody>
      </table>}
    </div>
    {nextCursor && <div className="flex justify-center"><Button variant="outline" onClick={() => fetchTranslations(nextCursor, true)} disabled={loading}>{t("Load more")}</Button></div>}
  </div>;
}
