"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function AdminTranslationsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<Record<string, { value: string, translations?: Record<string, string> }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setSettings(d.data || {});
        setLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    const data = await res.json();
    setSaving(false);
    if (!data.success) {
      setError(data.error?.message || "Failed to save translations");
    } else {
      alert("Translations saved successfully.");
      router.refresh();
    }
  };

  const handleTranslationChange = (key: string, lang: string, text: string) => {
    setSettings((prev) => {
      const current = prev[key] || { value: "", translations: {} };
      const translations = { ...(current.translations || {}) };
      translations[lang] = text;
      return {
        ...prev,
        [key]: {
          ...current,
          translations,
        },
      };
    });
  };

  if (loading) return <div className="p-8 text-muted">Loading...</div>;

  const filteredKeys = Object.keys(settings).filter(k => k.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-10 max-w-7xl">
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-serif text-maroon">Translations Matrix (CMS Content)</h1>
          <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Translations"}</Button>
        </div>
        
        <p className="text-muted mb-6 max-w-3xl">
          Edit translations for CMS-managed text. Base English content should be updated on the respective CMS pages. Only CMS content managed through Settings appears here.
        </p>

        <input 
          type="text" 
          placeholder="Search keys..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-sm mb-6 rounded-lg border border-border px-4 py-2 bg-surface"
        />

        {error && <p className="text-red text-sm mb-4">{error}</p>}

        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-cream">
              <tr>
                <th className="p-3 font-medium w-1/4">Key</th>
                <th className="p-3 font-medium w-1/4">Base (English)</th>
                <th className="p-3 font-medium w-1/4">Hindi (hi)</th>
                <th className="p-3 font-medium w-1/4">Tamil (ta)</th>
              </tr>
            </thead>
            <tbody>
              {filteredKeys.map((key) => {
                const item = settings[key];
                return (
                  <tr key={key} className="border-t border-border">
                    <td className="p-3 align-top font-mono text-xs text-muted break-all">{key}</td>
                    <td className="p-3 align-top text-text">{item.value}</td>
                    <td className="p-3 align-top">
                      <textarea 
                        rows={3}
                        className="w-full rounded-md border border-border px-3 py-1.5 bg-background text-sm"
                        value={item.translations?.["hi"] || ""}
                        onChange={(e) => handleTranslationChange(key, "hi", e.target.value)}
                        placeholder="Hindi translation..."
                      />
                    </td>
                    <td className="p-3 align-top">
                      <textarea 
                        rows={3}
                        className="w-full rounded-md border border-border px-3 py-1.5 bg-background text-sm"
                        value={item.translations?.["ta"] || ""}
                        onChange={(e) => handleTranslationChange(key, "ta", e.target.value)}
                        placeholder="Tamil translation..."
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredKeys.length === 0 && <p className="p-8 text-center text-muted">No CMS content found.</p>}
        </div>
      </div>
    </div>
  );
}
