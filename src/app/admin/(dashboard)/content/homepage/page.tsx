"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ui/image-upload";
import { BackToContent } from "@/components/admin/back-to-content";

export default function AdminHomepageCMS() {
  const router = useRouter();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setSettings(Object.fromEntries(Object.entries(d.data || {}).map(([key, setting]) => [key, typeof setting === "string" ? setting : (setting as { value?: string } | null)?.value || ""])));
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
      alert(data.warning || "Homepage content saved successfully.");
      router.refresh();
    }
  };

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) return <div className="p-8 text-muted">Loading...</div>;

  return (
    <div className="space-y-10 max-w-4xl">
      <BackToContent />
      <div>
        <h1 className="text-2xl font-serif text-maroon mb-6">Homepage CMS</h1>
        <form onSubmit={handleSave} className="space-y-8">
          
          <div className="p-6 rounded-lg border border-border bg-surface space-y-4">
            <h2 className="text-lg font-medium text-maroon mb-4">Hero Section</h2>
            <div>
              <label className="text-sm text-muted">Hero Title</label>
              <input 
                type="text" 
                value={settings["home.hero.title"] || ""} 
                onChange={(e) => handleChange("home.hero.title", e.target.value)} 
                className="w-full mt-1.5 rounded-lg border border-border px-4 py-2 bg-background" 
              />
            </div>
            <div>
              <label className="text-sm text-muted">Hero Subtitle</label>
              <textarea 
                rows={3}
                value={settings["home.hero.subtitle"] || ""} 
                onChange={(e) => handleChange("home.hero.subtitle", e.target.value)} 
                className="w-full mt-1.5 rounded-lg border border-border px-4 py-2 bg-background" 
              />
            </div>
            <div>
              <label className="text-sm text-muted block mb-2">Hero Background Image</label>
              <ImageUpload
                value={settings["home.hero.image"] || ""}
                onChange={(url) => handleChange("home.hero.image", url)}
              />
              <p className="text-xs text-muted mt-2">Optional. Replaces the default gradient background.</p>
            </div>
            <div>
              <label className="text-sm text-muted">Primary Button Label</label>
              <input 
                type="text" 
                value={settings["home.giveOnce"] || ""} 
                onChange={(e) => handleChange("home.giveOnce", e.target.value)} 
                className="w-full mt-1.5 rounded-lg border border-border px-4 py-2 bg-background" 
              />
            </div>
          </div>

          <div className="p-6 rounded-lg border border-border bg-surface space-y-4">
            <h2 className="text-lg font-medium text-maroon mb-4">Section Titles</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted">Featured Campaigns</label>
                <input 
                  type="text" 
                  value={settings["home.featured"] || ""} 
                  onChange={(e) => handleChange("home.featured", e.target.value)} 
                  className="w-full mt-1.5 rounded-lg border border-border px-4 py-2 bg-background" 
                />
              </div>
              <div>
                <label className="text-sm text-muted">Seva Areas</label>
                <input 
                  type="text" 
                  value={settings["home.seva"] || ""} 
                  onChange={(e) => handleChange("home.seva", e.target.value)} 
                  className="w-full mt-1.5 rounded-lg border border-border px-4 py-2 bg-background" 
                />
              </div>
              <div>
                <label className="text-sm text-muted">Upcoming Initiatives</label>
                <input 
                  type="text" 
                  value={settings["home.upcomingInitiatives"] || ""} 
                  onChange={(e) => handleChange("home.upcomingInitiatives", e.target.value)} 
                  className="w-full mt-1.5 rounded-lg border border-border px-4 py-2 bg-background" 
                />
              </div>
              <div>
                <label className="text-sm text-muted">Follow Our Journey (Instagram)</label>
                <input 
                  type="text" 
                  value={settings["home.followOurJourney"] || ""} 
                  onChange={(e) => handleChange("home.followOurJourney", e.target.value)} 
                  className="w-full mt-1.5 rounded-lg border border-border px-4 py-2 bg-background" 
                />
              </div>
              <div>
                <label className="text-sm text-muted">Watch Our Videos (YouTube)</label>
                <input 
                  type="text" 
                  value={settings["home.watchOurVideos"] || ""} 
                  onChange={(e) => handleChange("home.watchOurVideos", e.target.value)} 
                  className="w-full mt-1.5 rounded-lg border border-border px-4 py-2 bg-background" 
                />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-lg border border-border bg-surface space-y-4">
            <h2 className="text-lg font-medium text-maroon mb-4">How It Works Section</h2>
            <div>
              <label className="text-sm text-muted">Section Title</label>
              <input 
                type="text" 
                value={settings["home.howItWorks"] || ""} 
                onChange={(e) => handleChange("home.howItWorks", e.target.value)} 
                className="w-full mt-1.5 rounded-lg border border-border px-4 py-2 bg-background mb-4" 
              />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map(step => (
                <div key={step}>
                  <label className="text-sm text-muted">Step {step}</label>
                  <input 
                    type="text" 
                    value={settings[`home.step${step}`] || ""} 
                    onChange={(e) => handleChange(`home.step${step}`, e.target.value)} 
                    className="w-full mt-1.5 rounded-lg border border-border px-4 py-2 bg-background" 
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-lg border border-border bg-surface space-y-4">
            <h2 className="text-lg font-medium text-maroon mb-4">Call To Action (Footer)</h2>
            <div>
              <label className="text-sm text-muted">CTA Title</label>
              <input 
                type="text" 
                value={settings["home.ctaTitle"] || ""} 
                onChange={(e) => handleChange("home.ctaTitle", e.target.value)} 
                className="w-full mt-1.5 rounded-lg border border-border px-4 py-2 bg-background" 
              />
            </div>
            <div>
              <label className="text-sm text-muted">CTA Description</label>
              <textarea 
                rows={2}
                value={settings["home.ctaBody"] || ""} 
                onChange={(e) => handleChange("home.ctaBody", e.target.value)} 
                className="w-full mt-1.5 rounded-lg border border-border px-4 py-2 bg-background" 
              />
            </div>
          </div>

          {error && <p className="text-red text-sm">{error}</p>}
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Homepage Content"}
          </Button>
        </form>
      </div>
    </div>
  );
}
