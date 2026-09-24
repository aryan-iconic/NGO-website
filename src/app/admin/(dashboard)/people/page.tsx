import { db } from "@/lib/db";

export default async function AdminPeoplePage() {
  const volunteers = await db.listVolunteerApplications();
  const messages = await db.listContactMessages();

  return (
    <div className="space-y-12">
      <section>
        <h1 className="text-2xl font-serif text-maroon">Volunteer Applications</h1>
        <div className="mt-4 bg-surface border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-cream">
              <tr className="text-left">
                <th className="p-3 font-medium">Name</th>
                <th className="p-3 font-medium">Contact</th>
                <th className="p-3 font-medium">City</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Applied</th>
              </tr>
            </thead>
            <tbody>
              {volunteers.map((v: any) => (
                <tr key={v.id} className="border-t border-border">
                  <td className="p-3">{v.name}</td>
                  <td className="p-3 text-muted">{v.email}{v.phone ? ` · ${v.phone}` : ""}</td>
                  <td className="p-3 text-muted">{v.city ?? "—"}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-cream text-maroon">{v.status}</span>
                  </td>
                  <td className="p-3 text-muted">{new Date(v.createdAt).toLocaleDateString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {volunteers.length === 0 && <p className="p-8 text-center text-muted">No applications yet.</p>}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-serif text-maroon">Contact Messages</h2>
        <div className="mt-4 space-y-3">
          {messages.map((m: any) => (
            <div key={m.id} className="p-4 rounded-lg border border-border bg-surface">
              <div className="flex justify-between">
                <p className="font-medium text-maroon">{m.name} <span className="text-muted font-normal">— {m.email}</span></p>
                <span className="text-xs text-muted">{new Date(m.createdAt).toLocaleDateString("en-IN")}</span>
              </div>
              {m.subject && <p className="text-sm font-medium mt-1">{m.subject}</p>}
              <p className="text-sm text-muted mt-1">{m.message}</p>
            </div>
          ))}
          {messages.length === 0 && <p className="text-muted">No messages yet.</p>}
        </div>
      </section>
    </div>
  );
}
