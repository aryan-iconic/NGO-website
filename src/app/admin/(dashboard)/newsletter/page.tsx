import { db } from "@/lib/db";
import { format } from "date-fns";

export default async function AdminNewsletterPage() {
  const subscribers = await db.listNewsletterSubscribers();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-serif text-maroon">Newsletter Subscribers</h1>

      <div className="bg-surface rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream">
            <tr className="text-left text-muted">
              <th className="p-4 font-medium">Subscribed On</th>
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium">City</th>
              <th className="p-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {subscribers.map((sub) => (
              <tr key={sub.id} className="hover:bg-cream/50 transition-colors">
                <td className="p-4 whitespace-nowrap">
                  {format(new Date(sub.subscribedAt), "MMM d, yyyy")}
                </td>
                <td className="p-4 font-medium text-text">{sub.name}</td>
                <td className="p-4"><a href={`mailto:${sub.email}`} className="text-primary hover:underline">{sub.email}</a></td>
                <td className="p-4">{sub.city || "—"}</td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    sub.status === "SUBSCRIBED" ? "bg-success/10 text-success" : "bg-red/10 text-red"
                  }`}>
                    {sub.status}
                  </span>
                  {sub.unsubscribedAt && (
                    <div className="text-xs text-muted mt-1">
                      on {format(new Date(sub.unsubscribedAt), "MMM d, yy")}
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {subscribers.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted">No subscribers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
