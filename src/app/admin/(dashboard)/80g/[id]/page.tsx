"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Admin80GDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [status, setStatus] = useState("");
  const [form10bdStatus, setForm10bdStatus] = useState("");
  const [form10beRef, setForm10beRef] = useState("");

  useEffect(() => {
    fetch(`/api/admin/80g/${params.id}`)
      .then(res => res.json())
      .then(data => {
        setRecord(data.record);
        setStatus(data.record.status);
        setForm10bdStatus(data.record.form10bdStatus || "");
        setForm10beRef(data.record.form10beRef || "");
        setLoading(false);
      });
  }, [params.id]);

  const handleSave = async () => {
    setSaving(true);
    await fetch(`/api/admin/80g/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, form10bdStatus, form10beRef })
    });
    setSaving(false);
    alert("Updated successfully");
  };

  if (loading) return <div>Loading...</div>;
  if (!record) return <div>Record not found.</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/80g" className="p-2 bg-surface border border-border rounded-lg hover:bg-cream">
          <ArrowLeft size={20} className="text-muted" />
        </Link>
        <h1 className="text-2xl font-serif text-maroon flex-1">80G Request Details</h1>
        
        <Button onClick={handleSave} disabled={saving}>
          <Save size={16} className="mr-2" /> {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-surface border border-border rounded-lg p-6 space-y-4 text-sm">
          <h2 className="text-lg font-serif text-maroon border-b border-border pb-2 mb-4">Donor Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-muted text-xs uppercase font-semibold">Name as per PAN</p>
              <p className="mt-1 font-medium">{record.donorName}</p>
            </div>
            <div>
              <p className="text-muted text-xs uppercase font-semibold">PAN</p>
              <p className="mt-1 font-mono">{record.pan}</p>
            </div>
            <div className="col-span-2">
              <p className="text-muted text-xs uppercase font-semibold">Email</p>
              <p className="mt-1">{record.email}</p>
            </div>
            <div className="col-span-2">
              <p className="text-muted text-xs uppercase font-semibold">Address</p>
              <p className="mt-1">
                {record.addressLine1}<br/>
                {record.addressLine2 && <>{record.addressLine2}<br/></>}
                {record.city}, {record.state} - {record.pincode}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-lg p-6 space-y-4 text-sm">
            <h2 className="text-lg font-serif text-maroon border-b border-border pb-2 mb-4">Update Status</h2>
            
            <div>
              <label className="block text-xs uppercase font-semibold text-muted mb-1">Overall Workflow Status</label>
              <select 
                value={status} 
                onChange={e => setStatus(e.target.value)}
                className="w-full border border-border rounded-md px-3 py-2 bg-background"
              >
                <option value="SUBMITTED">Information Submitted</option>
                <option value="VERIFIED">Verified</option>
                <option value="INCLUDED_10BD">Included in 10BD</option>
                <option value="10BE_AVAILABLE">10BE Available</option>
                <option value="REJECTED">Rejected / Ineligible</option>
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase font-semibold text-muted mb-1">Form 10BD Reference/Status</label>
              <input 
                value={form10bdStatus} 
                onChange={e => setForm10bdStatus(e.target.value)}
                placeholder="e.g. Q2 FY24 Filing"
                className="w-full border border-border rounded-md px-3 py-2 bg-background"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-semibold text-muted mb-1">Form 10BE Certificate Ref / Link</label>
              <input 
                value={form10beRef} 
                onChange={e => setForm10beRef(e.target.value)}
                placeholder="Certificate ID or Drive Link"
                className="w-full border border-border rounded-md px-3 py-2 bg-background"
              />
            </div>
          </div>
          
          <div className="bg-cream border border-border rounded-lg p-6 space-y-2 text-sm">
             <h2 className="text-lg font-serif text-maroon border-b border-border pb-2 mb-4">Original Donation</h2>
             {record.donation ? (
               <>
                 <p><span className="font-semibold text-muted mr-2">Amount:</span> {(record.donation.totalPaise / 100).toFixed(2)} INR</p>
                 <p><span className="font-semibold text-muted mr-2">Date:</span> {format(new Date(record.donation.createdAt), "MMM d, yyyy h:mm a")}</p>
                 <p><span className="font-semibold text-muted mr-2">Donation Email:</span> {record.donation.donorEmail}</p>
               </>
             ) : (
               <p className="text-muted">Donation details not available.</p>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
