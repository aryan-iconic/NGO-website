"use client";

import { use, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, Trash2, CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type ReplyTemplate = "ACKNOWLEDGE" | "MORE_INFORMATION" | "FOLLOW_UP" | "CUSTOM";

const templates: Record<Exclude<ReplyTemplate, "CUSTOM">, { subject: (subject: string | null) => string; message: (name: string) => string }> = {
  ACKNOWLEDGE: {
    subject: (subject) => `Re: ${subject || "Your inquiry"}`,
    message: (name) => `Dear ${name},\n\nThank you for contacting Shri Nityanikunj Trust. We have received your inquiry and our team is reviewing it. We will get back to you as soon as possible.\n\nWarm regards,\nShri Nityanikunj Trust`,
  },
  MORE_INFORMATION: {
    subject: (subject) => `Re: ${subject || "Your inquiry"}`,
    message: (name) => `Dear ${name},\n\nThank you for reaching out to Shri Nityanikunj Trust. Could you please share a few more details so our team can assist you?\n\nWarm regards,\nShri Nityanikunj Trust`,
  },
  FOLLOW_UP: {
    subject: (subject) => `Follow-up: ${subject || "Your inquiry"}`,
    message: (name) => `Dear ${name},\n\nWe are following up on your inquiry to Shri Nityanikunj Trust. Please reply to this email if you still need assistance.\n\nWarm regards,\nShri Nityanikunj Trust`,
  },
};

type Inquiry = { id: string; name: string; email: string; phone: string | null; subject: string | null; message: string; status: string; createdAt: string };

export default function ContactMessagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [statusNotice, setStatusNotice] = useState("");
  const [template, setTemplate] = useState<ReplyTemplate>("ACKNOWLEDGE");
  const [replySubject, setReplySubject] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [replyFeedback, setReplyFeedback] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/contact/${id}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message ?? data.error ?? "Could not load this inquiry.");
        if (!cancelled) {
          setInquiry(data.inquiry);
          const initialTemplate = templates.ACKNOWLEDGE;
          setReplySubject(initialTemplate.subject(data.inquiry.subject));
          setReplyMessage(initialTemplate.message(data.inquiry.name));
        }
        if (data.inquiry.status === "NEW") {
          try {
            const statusResponse = await fetch(`/api/admin/contact/${id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: "READ" }),
            });
            if (!statusResponse.ok) throw new Error("Could not mark inquiry as read.");
            if (!cancelled) setInquiry((current) => current?.id === id ? { ...current, status: "READ" } : current);
          } catch {
            if (!cancelled) setStatusNotice("This inquiry could not be marked as read automatically. Use the status button to retry.");
          }
        }
      })
      .catch((error: unknown) => { if (!cancelled) setLoadError(error instanceof Error ? error.message : "Could not load this inquiry."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  const chooseTemplate = (value: ReplyTemplate) => {
    setTemplate(value);
    if (value !== "CUSTOM" && inquiry) {
      setReplySubject(templates[value].subject(inquiry.subject));
      setReplyMessage(templates[value].message(inquiry.name));
    }
  };

  const toggleStatus = async () => {
    const currentInquiry = inquiry;
    if (!currentInquiry) return;
    const newStatus = currentInquiry.status === "NEW" ? "READ" : "NEW";
    await fetch(`/api/admin/contact/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    });
    setInquiry({ ...currentInquiry, status: newStatus });
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this inquiry?")) return;
    await fetch(`/api/admin/contact/${id}`, { method: "DELETE" });
    router.push("/admin/contact");
  };

  const handleReply = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!inquiry) return;
    setSending(true);
    setReplyFeedback("");
    try {
      const response = await fetch(`/api/admin/contact/${id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: replySubject, message: replyMessage, template }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message ?? data.error ?? "Reply could not be sent.");
      setReplyFeedback(`Reply sent to ${inquiry.email}.`);
      setInquiry({ ...inquiry, status: "READ" });
    } catch (error) {
      setReplyFeedback(error instanceof Error ? error.message : "Reply could not be sent.");
    } finally { setSending(false); }
  };

  if (loading) return <div>Loading...</div>;
  if (loadError) return <div className="space-y-4"><p role="alert" className="text-red-700">{loadError}</p><Link href="/admin/contact" className="text-primary hover:underline">Back to Contact Inquiries</Link></div>;
  if (!inquiry) return <div>Inquiry not found.</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/contact" className="p-2 bg-surface border border-border rounded-lg hover:bg-cream">
          <ArrowLeft size={20} className="text-muted" />
        </Link>
        <h1 className="text-2xl font-serif text-maroon flex-1">Inquiry Details</h1>
        
        <Button variant="outline" onClick={toggleStatus}>
          {inquiry.status === "NEW" ? (
            <><CheckCircle2 size={16} className="mr-2" /> Mark as Read</>
          ) : (
            <><Circle size={16} className="mr-2" /> Mark as Unread</>
          )}
        </Button>
        <Button variant="outline" onClick={handleDelete}>
          <Trash2 size={16} className="mr-2" /> Delete
        </Button>
      </div>

      <div className="bg-surface border border-border rounded-lg p-6 space-y-4 text-sm">
        {statusNotice && <p role="status" className="text-sm text-amber-700">{statusNotice}</p>}
        <div className="grid grid-cols-2 gap-4 pb-4 border-b border-border">
          <div>
            <p className="text-muted text-xs uppercase tracking-wider font-semibold">Name</p>
            <p className="mt-1 font-medium">{inquiry.name}</p>
          </div>
          <div>
            <p className="text-muted text-xs uppercase tracking-wider font-semibold">Email</p>
            <p className="mt-1"><a href={`mailto:${inquiry.email}`} className="text-primary hover:underline">{inquiry.email}</a></p>
          </div>
          <div>
            <p className="text-muted text-xs uppercase tracking-wider font-semibold">Phone</p>
            <p className="mt-1">{inquiry.phone || "N/A"}</p>
          </div>
          <div>
            <p className="text-muted text-xs uppercase tracking-wider font-semibold">Date</p>
            <p className="mt-1">{format(new Date(inquiry.createdAt), "MMM d, yyyy h:mm a")}</p>
          </div>
        </div>
        
        <div>
          <p className="text-muted text-xs uppercase tracking-wider font-semibold">Subject</p>
          <p className="mt-1 font-medium">{inquiry.subject || "No Subject"}</p>
        </div>

        <div>
          <p className="text-muted text-xs uppercase tracking-wider font-semibold">Message</p>
          <div className="mt-2 p-4 bg-cream rounded-lg whitespace-pre-wrap">
            {inquiry.message}
          </div>
        </div>
      </div>

      <form onSubmit={handleReply} className="bg-surface border border-border rounded-lg p-6 space-y-4">
        <div><h2 className="text-lg font-medium text-maroon">Reply to inquiry</h2><p className="text-sm text-muted">This sends an email directly to {inquiry.email} using the configured email service.</p></div>
        <label className="block text-sm font-medium">Reply template
          <select className="mt-1 block w-full rounded border border-border bg-surface p-2" value={template} onChange={(event) => chooseTemplate(event.target.value as ReplyTemplate)}>
            <option value="ACKNOWLEDGE">Acknowledge inquiry</option><option value="MORE_INFORMATION">Request more information</option><option value="FOLLOW_UP">Follow up</option><option value="CUSTOM">Custom reply</option>
          </select>
        </label>
        <label className="block text-sm font-medium">Subject<input required maxLength={160} className="mt-1 block w-full rounded border border-border bg-surface p-2" value={replySubject} onChange={(event) => setReplySubject(event.target.value)} /></label>
        <label className="block text-sm font-medium">Message<textarea required minLength={2} maxLength={5000} rows={8} className="mt-1 block w-full rounded border border-border bg-surface p-2" value={replyMessage} onChange={(event) => setReplyMessage(event.target.value)} /></label>
        {replyFeedback && <p role="status" className="text-sm text-muted">{replyFeedback}</p>}
        <Button type="submit" disabled={sending || !replySubject.trim() || !replyMessage.trim()}>{sending ? "Sending..." : "Send reply"}</Button>
      </form>
    </div>
  );
}
