"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface TranslationRow {
  id: string;
  sourceText: string;
  locale: string;
  translatedText: string;
  sourceType: string;
  status: string;
  isManual: boolean;
}

export default function AdminTranslationsPage() {
  const router = useRouter();
  const [translations, setTranslations] = useState<TranslationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [localeFilter, setLocaleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchTranslations = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchTerm) params.append("q", searchTerm);
    if (localeFilter) params.append("locale", localeFilter);
    if (statusFilter) params.append("status", statusFilter);

    const res = await fetch(`/api/admin/translations?${params.toString()}`);
    const data = await res.json();
    if (data.success) {
      setTranslations(data.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTranslations();
  }, [searchTerm, localeFilter, statusFilter]);

  const handleUpdate = async (id: string, updates: Partial<TranslationRow>) => {
    setSavingId(id);
    setError(null);
    const res = await fetch(`/api/admin/translations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    setSavingId(null);
    if (!data.success) {
      setError(data.error?.message || "Failed to update translation");
    } else {
      setTranslations((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...data.data } : t))
      );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif text-maroon">Translations Management</h1>
        <Button variant="outline" onClick={() => fetchTranslations()} disabled={loading}>
          Refresh
        </Button>
      </div>
      
      <p className="text-muted max-w-3xl text-sm">
        Manage translations across the platform. Note: Translations are cached for up to 60 seconds to improve performance. Changes may take up to a minute to reflect on the public site.
      </p>

      <div className="flex flex-wrap gap-4 items-center bg-surface p-4 border border-border rounded-lg">
        <input 
          type="text" 
          placeholder="Search text..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-sm rounded-lg border border-border px-3 py-2 text-sm bg-background"
        />
        <select 
          value={localeFilter} 
          onChange={(e) => setLocaleFilter(e.target.value)}
          className="rounded-lg border border-border px-3 py-2 text-sm bg-background"
        >
          <option value="">All Locales</option>
          <option value="hi">Hindi (hi)</option>
          <option value="ta">Tamil (ta)</option>
        </select>
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-border px-3 py-2 text-sm bg-background"
        >
          <option value="">All Statuses</option>
          <option value="AUTO">Auto Translated</option>
          <option value="REVIEW_REQUIRED">Review Required</option>
          <option value="APPROVED">Approved</option>
        </select>
      </div>

      {error && <p className="text-red text-sm">{error}</p>}

      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        {loading && translations.length === 0 ? (
          <div className="p-8 text-center text-muted">Loading translations...</div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-cream">
              <tr>
                <th className="p-3 font-medium w-[30%]">Source Text (English)</th>
                <th className="p-3 font-medium w-[10%]">Locale</th>
                <th className="p-3 font-medium w-[35%]">Translated Text</th>
                <th className="p-3 font-medium w-[15%]">Status</th>
                <th className="p-3 font-medium w-[10%]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {translations.map((t) => (
                <tr key={t.id} className="hover:bg-background/50">
                  <td className="p-3 align-top">
                    <p className="line-clamp-3 text-muted">{t.sourceText}</p>
                    <span className="text-xs text-muted-foreground mt-1 bg-border/50 px-1.5 py-0.5 rounded">{t.sourceType}</span>
                  </td>
                  <td className="p-3 align-top font-mono">{t.locale}</td>
                  <td className="p-3 align-top">
                    <textarea 
                      rows={3}
                      className="w-full rounded-md border border-border px-3 py-1.5 bg-background text-sm"
                      value={t.translatedText}
                      onChange={(e) => {
                        const newText = e.target.value;
                        setTranslations(prev => prev.map(item => item.id === t.id ? { ...item, translatedText: newText } : item));
                      }}
                      onBlur={(e) => {
                        if (e.target.value !== t.translatedText) {
                          handleUpdate(t.id, { translatedText: e.target.value, isManual: true });
                        }
                      }}
                    />
                  </td>
                  <td className="p-3 align-top">
                    <select
                      value={t.status}
                      onChange={(e) => handleUpdate(t.id, { status: e.target.value })}
                      className={`w-full rounded-md border px-2 py-1.5 text-xs bg-background ${t.status === "REVIEW_REQUIRED" ? "border-amber-400 text-amber-700" : t.status === "APPROVED" ? "border-green-400 text-green-700" : "border-border text-muted"}`}
                    >
                      <option value="AUTO">AUTO</option>
                      <option value="REVIEW_REQUIRED">REVIEW REQUIRED</option>
                      <option value="APPROVED">APPROVED</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                  </td>
                  <td className="p-3 align-top">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleUpdate(t.id, { translatedText: t.translatedText, isManual: true, status: "APPROVED" })}
                      disabled={savingId === t.id || t.status === "APPROVED"}
                    >
                      Approve
                    </Button>
                  </td>
                </tr>
              ))}
              {translations.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted">
                    No translations found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
