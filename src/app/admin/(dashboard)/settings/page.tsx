"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TwoFactorPanel } from "@/components/admin/two-factor-panel";

export default function AdminSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryingEmails, setRetryingEmails] = useState(false);
  const [emailRetryMessage, setEmailRetryMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => { if (!r.ok) throw new Error("Could not load settings."); return r.json(); })
      .then((d) => {
        if (d.success) {
          const flatSettings = Object.fromEntries(
            Object.entries(d.data || {}).map(([key, setting]) => [
              key,
              typeof setting === "string" ? setting : (setting as { value?: string } | null)?.value || "",
            ]),
          );
          setSettings(flatSettings);
        }
        setLoading(false);
      })
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : "Could not load settings.");
        setLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    const data = await res.json();
    if (!data.success) {
      setError(data.error?.message || "Failed to save settings");
    } else {
      alert(data.warning || "Settings saved successfully.");
      router.refresh();
    }
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save settings. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const retryDonationEmails = async () => {
    setRetryingEmails(true);
    setEmailRetryMessage(null);
    try {
      const response = await fetch("/api/admin/email-deliveries/retry", { method: "POST" });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error?.message || "Could not retry emails.");
      setEmailRetryMessage(`Delivered ${data.delivered} of ${data.attempted} due receipt emails.`);
    } catch (retryError) {
      setEmailRetryMessage(retryError instanceof Error ? retryError.message : "Could not retry emails.");
    } finally {
      setRetryingEmails(false);
    }
  };

  if (loading) return <div role="status" className="p-8 text-muted">Loading settings...</div>;
  if (error && !Object.keys(settings).length) return <p role="alert" className="p-8 text-red">{error}</p>;

  return (
    <div className="space-y-10 max-w-4xl">
      <div>
        <h1 className="text-2xl font-serif text-maroon mb-6">Site Settings</h1>
        <form onSubmit={handleSave} className="space-y-8">

          <div className="p-6 rounded-lg border border-border bg-surface space-y-3">
            <h2 className="text-lg font-medium text-maroon">Donation Receipt Email Recovery</h2>
            <p className="text-sm text-muted">Failed provider sends are retained for retry. Retry due receipts after correcting the email service configuration.</p>
            <Button type="button" variant="outline" onClick={retryDonationEmails} disabled={retryingEmails}>{retryingEmails ? "Retrying…" : "Retry pending receipt emails"}</Button>
            {emailRetryMessage && <p role="status" className="text-sm text-muted">{emailRetryMessage}</p>}
          </div>
          
          <div className="p-6 rounded-lg border border-border bg-surface space-y-4">
            <h2 className="text-lg font-medium text-maroon mb-4">Contact Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted">Email</label>
                <input 
                  type="email" 
                  value={settings["contact.email"] || ""} 
                  onChange={(e) => handleChange("contact.email", e.target.value)} 
                  className="w-full mt-1.5 rounded-lg border border-border px-4 py-2 bg-background" 
                />
              </div>
              <div>
                <label className="text-sm text-muted">Phone</label>
                <input 
                  type="text" 
                  value={settings["contact.phone"] || ""} 
                  onChange={(e) => handleChange("contact.phone", e.target.value)} 
                  className="w-full mt-1.5 rounded-lg border border-border px-4 py-2 bg-background" 
                />
              </div>
              <div>
                <label className="text-sm text-muted" htmlFor="whatsapp-contact">WhatsApp contact number or link</label>
                <input
                  id="whatsapp-contact"
                  type="text"
                  value={settings["contact.whatsapp"] || ""}
                  onChange={(e) => handleChange("contact.whatsapp", e.target.value)}
                  className="w-full mt-1.5 rounded-lg border border-border px-4 py-2 bg-background"
                  placeholder="919876543210 or https://wa.me/919876543210"
                />
                <p className="mt-1 text-xs text-muted">Use the country code and digits, without needing a plus sign. Leave blank to hide the mobile button.</p>
              </div>
            </div>
            <div>
              <label className="text-sm text-muted">Address</label>
              <textarea 
                rows={2}
                value={settings["contact.address"] || ""} 
                onChange={(e) => handleChange("contact.address", e.target.value)} 
                className="w-full mt-1.5 rounded-lg border border-border px-4 py-2 bg-background" 
              />
            </div>
            <div>
              <label className="text-sm text-muted">Google Maps Embed URL</label>
              <input 
                type="url" 
                value={settings["contact.map_embed_url"] || ""} 
                onChange={(e) => handleChange("contact.map_embed_url", e.target.value)} 
                className="w-full mt-1.5 rounded-lg border border-border px-4 py-2 bg-background" 
                placeholder="https://maps.google.com/maps?..."
              />
            </div>
          </div>

          <div className="p-6 rounded-lg border border-border bg-surface space-y-4">
            <h2 className="text-lg font-medium text-maroon mb-4">Social Links</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted">Instagram Profile URL</label>
                <input 
                  type="url" 
                  value={settings["social.instagram"] || ""} 
                  onChange={(e) => handleChange("social.instagram", e.target.value)} 
                  className="w-full mt-1.5 rounded-lg border border-border px-4 py-2 bg-background" 
                />
              </div>
              <div>
                <label className="text-sm text-muted">Facebook Page URL</label>
                <input 
                  type="url" 
                  value={settings["social.facebook"] || ""} 
                  onChange={(e) => handleChange("social.facebook", e.target.value)} 
                  className="w-full mt-1.5 rounded-lg border border-border px-4 py-2 bg-background" 
                />
              </div>
              <div>
                <label className="text-sm text-muted">YouTube Channel URL</label>
                <input 
                  type="url" 
                  value={settings["social.youtube"] || ""} 
                  onChange={(e) => handleChange("social.youtube", e.target.value)} 
                  className="w-full mt-1.5 rounded-lg border border-border px-4 py-2 bg-background" 
                />
              </div>
              <div>
                <label className="text-sm text-muted">X (Twitter) URL</label>
                <input 
                  type="url" 
                  value={settings["social.twitter"] || ""} 
                  onChange={(e) => handleChange("social.twitter", e.target.value)} 
                  className="w-full mt-1.5 rounded-lg border border-border px-4 py-2 bg-background" 
                />
              </div>
            </div>
          </div>

          {error && <p className="text-red text-sm">{error}</p>}
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </form>
      </div>

      <div className="pt-8 border-t border-border">
        <h2 className="text-xl font-serif text-maroon mb-4">Security</h2>
        <TwoFactorPanel />
      </div>
    </div>
  );
}
