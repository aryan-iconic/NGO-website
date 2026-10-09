"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Volunteer = {
  id: string; name: string; email: string; phone: string | null; city: string | null;
  status: string; createdAt: string | Date; interests?: string[]; availability?: string | null; message?: string | null;
};
type Communication = { action: string; createdAt: string; details: { subject?: string; message?: string; to?: string } | null };

export function VolunteerApplicationsManager({ applications }: { applications: Volunteer[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [details, setDetails] = useState<Record<string, { application: Volunteer; communications: Communication[] }>>({});
  const [workEmailFor, setWorkEmailFor] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  async function updateStatus(id: string, status: string) {
    setBusy(id); setError("");
    try {
      const response = await fetch(`/api/admin/volunteers/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message ?? data.error ?? "Could not update status");
      router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not update status"); }
    finally { setBusy(null); }
  }

  async function sendEmail(id: string, type: "ACCEPTANCE" | "WORK_UPDATE") {
    if (type === "ACCEPTANCE" && !confirm("Send a volunteer acceptance email to this applicant?")) return;
    setBusy(id); setError("");
    try {
      const payload = type === "ACCEPTANCE" ? { type } : { type, subject, message };
      const response = await fetch(`/api/admin/volunteers/${id}/email`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message ?? data.error ?? "Email could not be sent");
      setWorkEmailFor(null); setSubject(""); setMessage("");
      await loadDetails(id);
      router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Email could not be sent"); }
    finally { setBusy(null); }
  }

  async function loadDetails(id: string) {
    const response = await fetch(`/api/admin/volunteers/${id}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message ?? data.error ?? "Could not load application");
    setDetails((current) => ({ ...current, [id]: { application: data.application, communications: data.communications } }));
  }

  async function toggleDetails(id: string) {
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id); setError("");
    try { await loadDetails(id); } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not load application"); }
  }

  return <>
    {error && <p role="alert" className="mt-3 rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <div className="mt-4 bg-surface border border-border rounded-lg overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-cream"><tr className="text-left"><th className="p-3 font-medium">Name</th><th className="p-3 font-medium">Contact</th><th className="p-3 font-medium">City</th><th className="p-3 font-medium">Status</th><th className="p-3 font-medium">Applied</th><th className="p-3 font-medium">Actions</th></tr></thead>
        <tbody>{applications.map((app) => <>
          <tr key={app.id} className="border-t border-border align-top">
            <td className="p-3">{app.name}</td><td className="p-3 text-muted">{app.email}{app.phone ? ` · ${app.phone}` : ""}</td><td className="p-3 text-muted">{app.city ?? "—"}</td>
            <td className="p-3"><select aria-label={`Status for ${app.name}`} className="rounded border border-border bg-surface px-2 py-1" value={app.status} disabled={busy === app.id} onChange={(event) => updateStatus(app.id, event.target.value)}>
              {["PENDING", "REVIEWING", "ON_HOLD", "ACCEPTED", "ACTIVE", "DECLINED"].map((status) => <option key={status} value={status} disabled={status === "ACCEPTED"}>{status.replaceAll("_", " ")}</option>)}
            </select></td>
            <td className="p-3 text-muted whitespace-nowrap">{new Date(app.createdAt).toLocaleDateString("en-IN")}</td>
            <td className="p-3"><div className="flex flex-wrap gap-2">
              <Button size="sm" disabled={busy === app.id || app.status === "DECLINED"} onClick={() => sendEmail(app.id, "ACCEPTANCE")}>{app.status === "ACCEPTED" || app.status === "ACTIVE" ? "Resend acceptance" : "Accept & email"}</Button>
              <Button size="sm" variant="outline" disabled={busy === app.id || !["ACCEPTED", "ACTIVE"].includes(app.status)} onClick={() => { setWorkEmailFor(workEmailFor === app.id ? null : app.id); setError(""); }}>Send work email</Button>
              <Button size="sm" variant="ghost" onClick={() => toggleDetails(app.id)}>{expanded === app.id ? "Hide details" : "Details & history"}</Button>
            </div></td>
          </tr>
          {workEmailFor === app.id && <tr key={`${app.id}-email`} className="border-t border-border bg-background/40"><td colSpan={6} className="p-4"><div className="max-w-2xl space-y-3">
            <h3 className="font-medium">New work-related email to {app.name}</h3>
            <label className="block text-sm">Subject<input className="mt-1 w-full rounded border border-border bg-surface p-2" value={subject} maxLength={160} onChange={(e) => setSubject(e.target.value)} /></label>
            <label className="block text-sm">Message<textarea className="mt-1 w-full rounded border border-border bg-surface p-2" rows={5} value={message} maxLength={5000} onChange={(e) => setMessage(e.target.value)} /></label>
            <div className="flex gap-2"><Button size="sm" disabled={busy === app.id || subject.trim().length < 3 || message.trim().length < 5} onClick={() => sendEmail(app.id, "WORK_UPDATE")}>{busy === app.id ? "Sending..." : "Send email"}</Button><Button size="sm" variant="outline" onClick={() => setWorkEmailFor(null)}>Cancel</Button></div>
          </div></td></tr>}
          {expanded === app.id && <tr key={`${app.id}-details`} className="border-t border-border bg-background/40"><td colSpan={6} className="p-4"><VolunteerDetails application={details[app.id]?.application ?? app} communications={details[app.id]?.communications ?? []} /></td></tr>}
        </>)}</tbody>
      </table>
      {applications.length === 0 && <p className="p-8 text-center text-muted">No applications yet.</p>}
    </div>
  </>;
}

function VolunteerDetails({ application, communications }: { application: Volunteer; communications: Communication[] }) {
  return <div className="grid gap-5 md:grid-cols-2">
    <section className="space-y-2"><h3 className="font-medium">Application details</h3><p><strong>Interests:</strong> {application.interests?.length ? application.interests.join(", ") : "—"}</p><p><strong>Availability:</strong> {application.availability || "—"}</p><p><strong>Message:</strong> {application.message || "—"}</p></section>
    <section className="space-y-2"><h3 className="font-medium">Emails sent from this page</h3>{communications.length ? communications.map((entry, index) => <article key={`${entry.action}-${entry.createdAt}-${index}`} className="rounded border border-border p-3"><p className="font-medium">{entry.action === "VOLUNTEER_ACCEPTANCE_EMAIL_SENT" ? "Acceptance email" : "Work email"}</p><p>{entry.details?.subject ?? "(no subject recorded)"}</p><time className="text-xs text-muted">{new Date(entry.createdAt).toLocaleString("en-IN")}</time>{entry.details?.message && <p className="mt-2 whitespace-pre-wrap">{entry.details.message}</p>}</article>) : <p className="text-sm text-muted">No emails recorded yet.</p>}</section>
  </div>;
}
