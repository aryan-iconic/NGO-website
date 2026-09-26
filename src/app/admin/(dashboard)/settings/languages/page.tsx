import { redirect } from "next/navigation";
import { getCurrentAdminId } from "@/lib/auth";
import { ENABLED_LOCALES } from "@/lib/translation";

export default async function LanguagesPage() {
  const adminId = await getCurrentAdminId();
  if (!adminId) redirect("/admin/login");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Translation & Languages</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Enabled Languages</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 border rounded-lg bg-gray-50">
            <div>
              <div className="font-medium text-gray-900">English (en)</div>
              <div className="text-sm text-gray-500">Default Source Language</div>
            </div>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">Default</span>
          </div>
          
          {ENABLED_LOCALES.map(loc => (
            <div key={loc} className="flex justify-between items-center p-3 border rounded-lg">
              <div>
                <div className="font-medium text-gray-900">
                  {loc === "hi" ? "Hindi (hi)" : loc === "te" ? "Telugu (te)" : "Tamil (ta)"}
                </div>
                <div className="text-sm text-gray-500">Automatically Translates</div>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Enabled</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Translation Status</h2>
        <p className="text-gray-600 mb-4">
          Translations are generated automatically in the background whenever you create or update content (Campaigns, Events, Products, etc.). 
          If you need to manually override a translation, you can edit it directly in the respective content's form (Coming Soon).
        </p>
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm font-medium">
            Note: All database content has been backfilled with automatic translations via Google Translate API.
          </p>
        </div>
      </div>
    </div>
  );
}
