"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function AdminAboutCMS() {
  const router = useRouter();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      alert("About Page content saved successfully.");
      router.refresh();
    }
  };

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) return <div className="p-8 text-muted">Loading...</div>;

  return (
    <div className="space-y-10 max-w-4xl">
      <div>
        <h1 className="text-2xl font-serif text-maroon mb-6">About Page CMS</h1>
        <form onSubmit={handleSave} className="space-y-8">
          
          <div className="p-6 rounded-lg border border-border bg-surface space-y-4">
            <h2 className="text-lg font-medium text-maroon mb-4">Header Section</h2>
            <div>
              <label className="text-sm text-muted">Page Title</label>
              <input 
                type="text" 
                value={settings["about.title"] || ""} 
                onChange={(e) => handleChange("about.title", e.target.value)} 
                className="w-full mt-1.5 rounded-lg border border-border px-4 py-2 bg-background" 
              />
            </div>
            <div>
              <label className="text-sm text-muted">Page Subtitle</label>
              <input 
                type="text" 
                value={settings["about.subtitle"] || ""} 
                onChange={(e) => handleChange("about.subtitle", e.target.value)} 
                className="w-full mt-1.5 rounded-lg border border-border px-4 py-2 bg-background" 
              />
            </div>
          </div>

          <div className="p-6 rounded-lg border border-border bg-surface space-y-4">
            <h2 className="text-lg font-medium text-maroon mb-4">Section 1: Trust Info</h2>
            <div>
              <label className="text-sm text-muted">Heading</label>
              <input 
                type="text" 
                value={settings["about.s1.h"] || ""} 
                onChange={(e) => handleChange("about.s1.h", e.target.value)} 
                className="w-full mt-1.5 rounded-lg border border-border px-4 py-2 bg-background" 
              />
            </div>
            <div>
              <label className="text-sm text-muted">Content</label>
              <textarea 
                rows={4}
                value={settings["about.s1.p"] || ""} 
                onChange={(e) => handleChange("about.s1.p", e.target.value)} 
                className="w-full mt-1.5 rounded-lg border border-border px-4 py-2 bg-background" 
              />
            </div>
          </div>

          <div className="p-6 rounded-lg border border-border bg-surface space-y-4">
            <h2 className="text-lg font-medium text-maroon mb-4">Section 2: Vision</h2>
            <div>
              <label className="text-sm text-muted">Heading</label>
              <input 
                type="text" 
                value={settings["about.s2.h"] || ""} 
                onChange={(e) => handleChange("about.s2.h", e.target.value)} 
                className="w-full mt-1.5 rounded-lg border border-border px-4 py-2 bg-background" 
              />
            </div>
            <div>
              <label className="text-sm text-muted">Content</label>
              <textarea 
                rows={4}
                value={settings["about.s2.p"] || ""} 
                onChange={(e) => handleChange("about.s2.p", e.target.value)} 
                className="w-full mt-1.5 rounded-lg border border-border px-4 py-2 bg-background" 
              />
            </div>
          </div>

          <div className="p-6 rounded-lg border border-border bg-surface space-y-4">
            <h2 className="text-lg font-medium text-maroon mb-4">Section 3: Mission Values</h2>
            <div>
              <label className="text-sm text-muted">Heading</label>
              <input 
                type="text" 
                value={settings["about.s3.h"] || ""} 
                onChange={(e) => handleChange("about.s3.h", e.target.value)} 
                className="w-full mt-1.5 rounded-lg border border-border px-4 py-2 bg-background" 
              />
            </div>
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <label className="text-sm text-muted">Value Line {i}</label>
                <input 
                  type="text" 
                  value={settings[`about.s3.p${i}`] || ""} 
                  onChange={(e) => handleChange(`about.s3.p${i}`, e.target.value)} 
                  className="w-full mt-1.5 rounded-lg border border-border px-4 py-2 bg-background" 
                />
              </div>
            ))}
          </div>

          <div className="p-6 rounded-lg border border-border bg-surface space-y-4">
            <h2 className="text-lg font-medium text-maroon mb-4">Section 4: Founder</h2>
            <div>
              <label className="text-sm text-muted">Heading</label>
              <input 
                type="text" 
                value={settings["about.s4.h"] || ""} 
                onChange={(e) => handleChange("about.s4.h", e.target.value)} 
                className="w-full mt-1.5 rounded-lg border border-border px-4 py-2 bg-background" 
              />
            </div>
            <div>
              <label className="text-sm text-muted">Name</label>
              <input 
                type="text" 
                value={settings["about.s4.p1"] || ""} 
                onChange={(e) => handleChange("about.s4.p1", e.target.value)} 
                className="w-full mt-1.5 rounded-lg border border-border px-4 py-2 bg-background" 
              />
            </div>
            <div>
              <label className="text-sm text-muted">Role</label>
              <input 
                type="text" 
                value={settings["about.s4.p2"] || ""} 
                onChange={(e) => handleChange("about.s4.p2", e.target.value)} 
                className="w-full mt-1.5 rounded-lg border border-border px-4 py-2 bg-background" 
              />
            </div>
          </div>

          <div className="p-6 rounded-lg border border-border bg-surface space-y-4">
            <h2 className="text-lg font-medium text-maroon mb-4">Section 5: Objectives</h2>
            <div>
              <label className="text-sm text-muted">Heading</label>
              <input 
                type="text" 
                value={settings["about.s5.h"] || ""} 
                onChange={(e) => handleChange("about.s5.h", e.target.value)} 
                className="w-full mt-1.5 rounded-lg border border-border px-4 py-2 bg-background" 
              />
            </div>
            <div>
              <label className="text-sm text-muted">Content</label>
              <textarea 
                rows={3}
                value={settings["about.s5.p"] || ""} 
                onChange={(e) => handleChange("about.s5.p", e.target.value)} 
                className="w-full mt-1.5 rounded-lg border border-border px-4 py-2 bg-background" 
              />
            </div>
            <div>
              <label className="text-sm text-muted">CTA Label</label>
              <input 
                type="text" 
                value={settings["about.s5.btn"] || ""} 
                onChange={(e) => handleChange("about.s5.btn", e.target.value)} 
                className="w-full mt-1.5 rounded-lg border border-border px-4 py-2 bg-background" 
              />
            </div>
          </div>

          <div className="p-6 rounded-lg border border-border bg-surface space-y-4">
            <h2 className="text-lg font-medium text-maroon mb-4">Section 6: Current Activities</h2>
            <div>
              <label className="text-sm text-muted">Heading</label>
              <input 
                type="text" 
                value={settings["about.s6.h"] || ""} 
                onChange={(e) => handleChange("about.s6.h", e.target.value)} 
                className="w-full mt-1.5 rounded-lg border border-border px-4 py-2 bg-background" 
              />
            </div>
            <div>
              <label className="text-sm text-muted">Disclaimer/Notice Text</label>
              <textarea 
                rows={3}
                value={settings["about.s6.p"] || ""} 
                onChange={(e) => handleChange("about.s6.p", e.target.value)} 
                className="w-full mt-1.5 rounded-lg border border-border px-4 py-2 bg-background" 
              />
            </div>
          </div>

          <div className="p-6 rounded-lg border border-border bg-surface space-y-4">
            <h2 className="text-lg font-medium text-maroon mb-4">Section 7: Transparency</h2>
            <div>
              <label className="text-sm text-muted">Heading</label>
              <input 
                type="text" 
                value={settings["about.s7.h"] || ""} 
                onChange={(e) => handleChange("about.s7.h", e.target.value)} 
                className="w-full mt-1.5 rounded-lg border border-border px-4 py-2 bg-background" 
              />
            </div>
            <div>
              <label className="text-sm text-muted">Notice Text</label>
              <textarea 
                rows={3}
                value={settings["about.s7.p"] || ""} 
                onChange={(e) => handleChange("about.s7.p", e.target.value)} 
                className="w-full mt-1.5 rounded-lg border border-border px-4 py-2 bg-background" 
              />
            </div>
          </div>

          {error && <p className="text-red text-sm">{error}</p>}
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save About Content"}
          </Button>
        </form>
      </div>
    </div>
  );
}
