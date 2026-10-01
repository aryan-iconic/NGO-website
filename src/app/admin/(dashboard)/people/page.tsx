import { db } from "@/lib/db";
import Link from "next/link";
import { LinkButton } from "@/components/ui/button";

export default async function AdminPeoplePage() {
  const teamMembers = await db.listTeamMembers(true);
  const volunteers = await db.listVolunteerApplications();
  const messages = await db.listContactMessages();

  return (
    <div className="space-y-12 max-w-5xl">
      <section>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-serif text-maroon">Team / Board Members</h1>
          <LinkButton href="/admin/people/new">Add Team Member</LinkButton>
        </div>
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-cream">
              <tr className="text-left">
                <th className="p-3 font-medium">Name</th>
                <th className="p-3 font-medium">Role</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teamMembers.map((member: any) => (
                <tr key={member.id} className="border-t border-border hover:bg-background/50">
                  <td className="p-3 font-medium">
                    <div className="flex items-center gap-3">
                      {member.imageUrl ? (
                        <img src={member.imageUrl} alt={member.name} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-cream flex items-center justify-center text-maroon font-bold">
                          {member.name.charAt(0)}
                        </div>
                      )}
                      {member.name}
                    </div>
                  </td>
                  <td className="p-3 text-muted">{member.role}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${member.isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                      {member.isPublished ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <Link href={`/admin/people/${member.id}`} className="text-primary hover:underline text-sm">Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {teamMembers.length === 0 && <p className="p-8 text-center text-muted">No team members yet.</p>}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-serif text-maroon">Volunteer Applications</h2>
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
