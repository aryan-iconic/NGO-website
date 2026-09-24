import { TwoFactorPanel } from "@/components/admin/two-factor-panel";

export default function AdminSettingsPage() {
  const groups = ["General", "Contact", "Social", "Donation", "Tax/Legal", "SEO", "Homepage"];
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-serif text-maroon">Site Settings</h1>
        <p className="text-sm text-muted mt-1">
          Section 75 of the spec — not wired to persistence in this pass. Structure below matches
          what site_settings (key/value JSON grouped by these categories) would render.
        </p>
        <div className="mt-6 grid sm:grid-cols-2 gap-4">
          {groups.map((g) => (
            <div key={g} className="p-5 rounded-lg border border-border bg-surface">
              <p className="font-medium text-maroon">{g}</p>
              <p className="text-xs text-muted mt-1">Not yet configured</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-serif text-maroon mb-4">Security</h2>
        <TwoFactorPanel />
      </div>
    </div>
  );
}
