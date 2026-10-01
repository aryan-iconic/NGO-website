"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function AdminLegalCMS() {
  const router = useRouter();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("privacy");

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
      setError(data.error?.message || "Failed to save settings");
    } else {
      alert("Legal pages content saved successfully.");
      router.refresh();
    }
  };

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) return <div className="p-8 text-muted">Loading...</div>;

  const renderSection = (prefix: string, maxSections: number = 4) => {
    const sections = [];
    for (let i = 1; i <= maxSections; i++) {
      sections.push(
        <div key={i} className="p-4 border border-border rounded-lg bg-background space-y-4">
          <h3 className="font-medium text-maroon">Section {i}</h3>
          <div>
            <label className="text-sm text-muted">Heading</label>
            <input
              type="text"
              value={settings[`${prefix}.s${i}.h`] || ""}
              onChange={(e) => handleChange(`${prefix}.s${i}.h`, e.target.value)}
              className="w-full mt-1.5 rounded-lg border border-border px-4 py-2 bg-surface"
            />
          </div>
          <div>
            <label className="text-sm text-muted">Content</label>
            <textarea
              rows={4}
              value={settings[`${prefix}.s${i}.p`] || ""}
              onChange={(e) => handleChange(`${prefix}.s${i}.p`, e.target.value)}
              className="w-full mt-1.5 rounded-lg border border-border px-4 py-2 bg-surface"
            />
          </div>
        </div>
      );
    }
    return (
      <div className="space-y-6">
        <div>
          <label className="text-sm text-muted">Page Title</label>
          <input
            type="text"
            value={settings[`${prefix}.title`] || ""}
            onChange={(e) => handleChange(`${prefix}.title`, e.target.value)}
            className="w-full mt-1.5 rounded-lg border border-border px-4 py-2 bg-surface"
          />
        </div>
        <div className="space-y-4">
          {sections}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-10 max-w-4xl">
      <div>
        <h1 className="text-2xl font-serif text-maroon mb-6">Legal & Static Pages CMS</h1>
        
        <form onSubmit={handleSave} className="space-y-8">
          <div className="w-full">
            <div className="flex border-b border-border mb-6">
              {[
                { id: "priv", label: "Privacy Policy" },
                { id: "terms", label: "Terms of Use" },
                { id: "don", label: "Donation Policy" },
                { id: "ref", label: "Refund Policy" }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted hover:text-text"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6 rounded-lg border border-border bg-surface">
              {activeTab === "priv" && renderSection("priv", 4)}
              {activeTab === "terms" && renderSection("terms", 4)}
              {activeTab === "don" && renderSection("don", 4)}
              {activeTab === "ref" && renderSection("ref", 3)}
            </div>
          </div>

          {error && <p className="text-red text-sm">{error}</p>}
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Legal Content"}
          </Button>
        </form>
      </div>
    </div>
  );
}
