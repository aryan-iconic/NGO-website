import { db } from "@/lib/db";
import { format } from "date-fns";
import { Eye, CheckCircle2, Circle, Trash2 } from "lucide-react";

export default async function AdminContactPage() {
  const inquiries = await db.listContactMessages();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-serif text-maroon">Contact Inquiries</h1>

      <div className="bg-surface rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream">
            <tr className="text-left text-muted">
              <th className="p-4 font-medium">Date</th>
              <th className="p-4 font-medium">Name & Email</th>
              <th className="p-4 font-medium">Phone</th>
              <th className="p-4 font-medium">Message Snapshot</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {inquiries.map((inquiry: any) => (
              <tr key={inquiry.id} className="hover:bg-cream/50 transition-colors">
                <td className="p-4 whitespace-nowrap">
                  {format(new Date(inquiry.createdAt), "MMM d, yyyy")}
                </td>
                <td className="p-4">
                  <div className="font-medium text-text">{inquiry.name}</div>
                  <div className="text-muted text-xs">{inquiry.email}</div>
                </td>
                <td className="p-4">{inquiry.phone || "—"}</td>
                <td className="p-4 max-w-xs truncate">{inquiry.message}</td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    inquiry.status === "NEW" ? "bg-primary/10 text-primary" : "bg-success/10 text-success"
                  }`}>
                    {inquiry.status === "NEW" ? "Unread" : "Read"}
                  </span>
                </td>
                <td className="p-4 text-right space-x-3">
                  <a href={`/admin/contact/${inquiry.id}`} className="text-maroon hover:underline inline-flex items-center gap-1">
                    <Eye size={14} /> View
                  </a>
                </td>
              </tr>
            ))}
            {inquiries.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted">No inquiries found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

