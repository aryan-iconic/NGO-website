"use client";

import { use, useEffect, useState } from "react";
import { format } from "date-fns";
import { ArrowLeft, Mail, Save } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type DonorRecord = {
  id: string;
  donorName: string;
  pan: string;
  email: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  pincode: string;
  status: string;
  form10bdStatus?: string | null;
  form10beRef?: string | null;
  donation?: { status: string; createdAt: string; totalPaise: number; donorEmail: string; donationNumber: string } | null;
};

export default function Admin80GDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [record, setRecord] = useState<DonorRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingCertificate, setSendingCertificate] = useState(false);
  const [sendingManualReceipt, setSendingManualReceipt] = useState(false);
  const [preArns, setPreArns] = useState<Array<{ arn: string; status: string }>>([]);
  const [selectedPreArn, setSelectedPreArn] = useState("");
  const [preArnError, setPreArnError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [status, setStatus] = useState("");
  const [form10bdStatus, setForm10bdStatus] = useState("");
  const [form10beRef, setForm10beRef] = useState("");

  useEffect(() => {
    let active = true;
    fetch(`/api/admin/80g/${id}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || !data.record) throw new Error(data.error || "80G request not found.");
        if (!active) return;
        setRecord(data.record);
        const storedStatus = data.record.status ?? "SUBMITTED";
        setStatus(storedStatus === "INCLUDED_10BD" ? "INCLUDED_FORM_113" : storedStatus === "10BE_AVAILABLE" ? "FORM_114_AVAILABLE" : storedStatus);
        setForm10bdStatus(data.record.form10bdStatus || "");
        setForm10beRef(data.record.form10beRef || "");
        const donationDate = new Date(data.record.donation?.createdAt || Date.now());
        const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", year: "numeric", month: "numeric" }).formatToParts(donationDate);
        const year = Number(parts.find((part) => part.type === "year")?.value);
        const month = Number(parts.find((part) => part.type === "month")?.value);
        const start = month >= 4 ? year : year - 1;
        const taxYear = `${start}-${String((start + 1) % 100).padStart(2, "0")}`;
        fetch(`/api/admin/80g/pre-arns?taxYear=${taxYear}&donorId=${encodeURIComponent(id)}`)
          .then(async (preArnResponse) => {
            const preArnData = await preArnResponse.json();
            if (!preArnResponse.ok || !preArnData.success) throw new Error(preArnData.error || "Could not load Pre-ARNs.");
            if (active) {
              const available = preArnData.entries.filter((entry: { status: string; donorTaxInformationId?: string }) => entry.status === "AVAILABLE" || entry.donorTaxInformationId === id);
              setPreArns(available);
              setSelectedPreArn((current) => current || available[0]?.arn || "");
            }
          })
          .catch((preArnLoadError) => { if (active) setPreArnError(preArnLoadError instanceof Error ? preArnLoadError.message : "Could not load Pre-ARNs."); });
      })
      .catch((loadError) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load this 80G request.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/80g/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, form10bdStatus, form10beRef })
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Could not update this 80G request.");
      setRecord(data.record ?? record);
      alert("Updated successfully");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not update this 80G request.");
    } finally {
      setSaving(false);
    }
  };

  const handleSendCertificate = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.type !== "application/pdf" || file.size > 10 * 1024 * 1024) {
      setError("Choose a PDF certificate smaller than 10 MB.");
      return;
    }

    setSendingCertificate(true);
    setError(null);
    try {
      const body = new FormData();
      body.set("certificate", file);
      const response = await fetch(`/api/admin/80g/${id}/certificate`, { method: "POST", body });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Could not email certificate.");
      setStatus("FORM_114_SENT");
      setForm10beRef(data.record.form10beRef || file.name);
      setRecord((current) => current ? { ...current, ...data.record } : data.record);
      alert("Form 114 certificate emailed to the donor.");
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Could not email certificate.");
    } finally {
      setSendingCertificate(false);
    }
  };

  const handleSendManualReceipt = async () => {
    if (!selectedPreArn) return;
    setSendingManualReceipt(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/80g/${id}/pre-arn-receipt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preArn: selectedPreArn }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Could not email manual receipt.");
      setStatus("MANUAL_RECEIPT_SENT");
      setForm10bdStatus(`Pre-ARN ${data.preArn} — Tax Year ${data.taxYear}`);
      setPreArns((current) => current.filter((entry) => entry.arn !== data.preArn));
      setSelectedPreArn("");
      alert("Pre-ARN manual donation receipt emailed to the donor. The official Form 114 is still due after Form 113 filing.");
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Could not email manual receipt.");
    } finally {
      setSendingManualReceipt(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!record) return <div className="space-y-4"><p className="text-red">{error || "Record not found."}</p><Link href="/admin/80g" className="text-primary hover:underline">Back to 80G requests</Link></div>;

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
      {error && <p role="alert" className="text-sm text-red">{error}</p>}

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
                <option value="MANUAL_RECEIPT_SENT">Pre-ARN manual receipt emailed</option>
                <option value="INCLUDED_FORM_113">Included in Form 113</option>
                <option value="FORM_114_AVAILABLE">Form 114 available</option>
                <option value="FORM_114_SENT">Form 114 emailed</option>
                <option value="REJECTED">Rejected / Ineligible</option>
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase font-semibold text-muted mb-1">Form 113 Filing Reference / Status</label>
              <input 
                value={form10bdStatus} 
                onChange={e => setForm10bdStatus(e.target.value)}
                placeholder="e.g. Tax year 2026-27 filing acknowledgement"
                className="w-full border border-border rounded-md px-3 py-2 bg-background"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-semibold text-muted mb-1">Form 114 Certificate Reference / Link</label>
              <input 
                value={form10beRef} 
                onChange={e => setForm10beRef(e.target.value)}
                placeholder="Official certificate reference or secure link"
                className="w-full border border-border rounded-md px-3 py-2 bg-background"
              />
            </div>
            <div className="rounded-md border border-border p-3 space-y-3">
              <div>
                <h3 className="font-medium">Send Pre-ARN manual receipt</h3>
                <p className="mt-1 text-xs text-muted">This emails a receipt populated with the donor, donation, Trust and Pre-ARN details. It is not Form 114; the official certificate must still be issued after Form 113 filing.</p>
              </div>
              {preArnError && <p role="alert" className="text-xs text-red">{preArnError}</p>}
              <div className="flex flex-wrap gap-2">
                <select value={selectedPreArn} onChange={(event) => setSelectedPreArn(event.target.value)} className="min-w-48 flex-1 rounded-md border border-border bg-background px-3 py-2" disabled={!preArns.length || sendingManualReceipt}>
                  <option value="">{preArns.length ? "Select an available Pre-ARN" : "No available Pre-ARNs for this tax year"}</option>
                  {preArns.map((entry) => <option key={entry.arn} value={entry.arn}>{entry.arn}</option>)}
                </select>
                <Button type="button" onClick={handleSendManualReceipt} disabled={!selectedPreArn || sendingManualReceipt}>
                  <Mail size={16} className="mr-2" /> {sendingManualReceipt ? "Sending..." : "Fill & Email Receipt"}
                </Button>
              </div>
            </div>
            <div className="rounded-md border border-border p-3">
              <p className="text-xs text-muted mb-3">After downloading the official Form 114 PDF from the Income Tax e-Filing portal, attach it here to email it to this donor. Filing Form 113 still happens on the government portal.</p>
              <label className={`inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-white cursor-pointer ${sendingCertificate ? "opacity-60 pointer-events-none" : ""}`}>
                <Mail size={16} /> {sendingCertificate ? "Sending..." : "Email Form 114 PDF to donor"}
                <input type="file" accept="application/pdf,.pdf" className="sr-only" disabled={sendingCertificate} onChange={handleSendCertificate} />
              </label>
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
