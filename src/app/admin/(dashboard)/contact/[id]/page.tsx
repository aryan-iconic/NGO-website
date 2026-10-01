"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, Trash2, CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ContactMessagePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [inquiry, setInquiry] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/contact/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setInquiry(data.inquiry);
        setLoading(false);
      });
  }, [params.id]);

  const toggleStatus = async () => {
    const newStatus = inquiry.status === "NEW" ? "READ" : "NEW";
    await fetch(`/api/admin/contact/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    });
    setInquiry({ ...inquiry, status: newStatus });
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this inquiry?")) return;
    await fetch(`/api/admin/contact/${params.id}`, { method: "DELETE" });
    router.push("/admin/contact");
  };

  if (loading) return <div>Loading...</div>;
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
        <Button variant="destructive" onClick={handleDelete}>
          <Trash2 size={16} className="mr-2" /> Delete
        </Button>
      </div>

      <div className="bg-surface border border-border rounded-lg p-6 space-y-4 text-sm">
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
    </div>
  );
}
