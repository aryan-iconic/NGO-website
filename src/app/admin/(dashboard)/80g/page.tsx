import { db } from "@/lib/db";
import { format } from "date-fns";
import Link from "next/link";

export default async function Admin80GPage() {
  const records = await db.listDonorTaxInformation();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-serif text-maroon">80G Tax Exemption Requests</h1>

      <div className="bg-surface rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream">
            <tr className="text-left text-muted">
              <th className="p-4 font-medium">Submitted On</th>
              <th className="p-4 font-medium">Donor Name (PAN)</th>
              <th className="p-4 font-medium">Donation Details</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {records.map((record: any) => (
              <tr key={record.id} className="hover:bg-cream/50 transition-colors">
                <td className="p-4 whitespace-nowrap">
                  {format(new Date(record.createdAt), "MMM d, yyyy")}
                </td>
                <td className="p-4">
                  <div className="font-medium text-text">{record.donorName}</div>
                  <div className="text-muted text-xs font-mono">{record.pan}</div>
                  <div className="text-muted text-xs">{record.email}</div>
                </td>
                <td className="p-4">
                  {record.donation ? (
                    <>
                      <div className="font-medium text-text">₹{(record.donation.totalPaise / 100).toFixed(2)}</div>
                      <div className="text-muted text-xs">{format(new Date(record.donation.createdAt), "MMM d, yyyy")}</div>
                    </>
                  ) : (
                    <span className="text-muted text-xs">Donation Not Found</span>
                  )}
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    record.status === "SUBMITTED" ? "bg-primary/10 text-primary" :
                    record.status === "VERIFIED" ? "bg-blue-100 text-blue-700" :
                    record.status === "INCLUDED_10BD" ? "bg-purple-100 text-purple-700" :
                    record.status === "10BE_AVAILABLE" ? "bg-success/10 text-success" :
                    "bg-red/10 text-red"
                  }`}>
                    {record.status.replace("_", " ")}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <Link href={`/admin/80g/${record.id}`} className="text-primary hover:underline font-medium">
                    View & Update
                  </Link>
                </td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted">No 80G requests found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
