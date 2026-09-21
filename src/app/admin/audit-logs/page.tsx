import { db } from "@/lib/db";

export default async function AdminAuditLogsPage() {
  const logs = await db.listAuditLogs();

  return (
    <div>
      <h1 className="text-2xl font-serif text-maroon">Audit Logs</h1>
      <p className="text-sm text-muted mt-1">Append-only record of admin actions.</p>

      <div className="mt-6 bg-surface border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream">
            <tr className="text-left">
              <th className="p-3 font-medium">Actor</th>
              <th className="p-3 font-medium">Action</th>
              <th className="p-3 font-medium">Entity</th>
              <th className="p-3 font-medium">When</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l: any) => (
              <tr key={l.id} className="border-t border-border">
                <td className="p-3">{l.actorName}</td>
                <td className="p-3 font-mono text-xs">{l.action}</td>
                <td className="p-3 text-muted">{l.entity} · {l.entityId.slice(0, 8)}</td>
                <td className="p-3 text-muted">{new Date(l.createdAt).toLocaleString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && <p className="p-8 text-center text-muted">No actions logged yet.</p>}
      </div>
    </div>
  );
}
