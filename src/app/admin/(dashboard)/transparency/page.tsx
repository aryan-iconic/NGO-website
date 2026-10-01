import { db } from "@/lib/db";
import Link from "next/link";
import { LinkButton } from "@/components/ui/button";

export default async function AdminTransparencyPage() {
  const registrations = await db.listStatutoryRegistrations(true); // include draft

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif text-maroon">Statutory Registrations</h1>
        <LinkButton href="/admin/transparency/new">Add Registration</LinkButton>
      </div>

      <div className="bg-surface rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream">
            <tr className="text-left text-muted">
              <th className="p-4 font-medium w-16">Order</th>
              <th className="p-4 font-medium">Title & Authority</th>
              <th className="p-4 font-medium">Reg. Number</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {registrations.map((reg: any) => (
              <tr key={reg.id} className="hover:bg-cream/50 transition-colors">
                <td className="p-4 text-center font-medium text-muted">{reg.displayOrder}</td>
                <td className="p-4">
                  <div className="font-medium text-text">{reg.title}</div>
                  <div className="text-muted text-xs">{reg.issuingAuthority || "—"}</div>
                </td>
                <td className="p-4 font-mono text-xs">{reg.registrationNumber || "—"}</td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    reg.isPublished ? "bg-success/10 text-success" : "bg-muted/10 text-muted"
                  }`}>
                    {reg.isPublished ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <Link href={`/admin/transparency/${reg.id}`} className="text-primary hover:underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {registrations.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted">No statutory registrations found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

