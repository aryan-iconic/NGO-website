"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function TransparencyForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: initialData?.title || "",
    registrationNumber: initialData?.registrationNumber || "",
    issuingAuthority: initialData?.issuingAuthority || "",
    description: initialData?.description || "",
    documentUrl: initialData?.documentUrl || "",
    verificationUrl: initialData?.verificationUrl || "",
    isPublished: initialData?.isPublished ?? true,
    displayOrder: initialData?.displayOrder || 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const url = initialData 
      ? `/api/admin/transparency/${initialData.id}` 
      : `/api/admin/transparency`;
      
    const method = initialData ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    if (res.ok) {
      router.push("/admin/transparency");
      router.refresh();
    } else {
      setLoading(false);
      alert("Failed to save registration");
    }
  };

  const handleDelete = async () => {
    if (!initialData || !confirm("Delete this registration?")) return;
    setLoading(true);
    const res = await fetch(`/api/admin/transparency/${initialData.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin/transparency");
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-surface border border-border p-6 rounded-lg">
      <div>
        <label className="block text-sm font-medium mb-1">Title *</label>
        <input 
          required 
          value={form.title} 
          onChange={e => setForm({...form, title: e.target.value})}
          className="w-full border border-border rounded-md px-3 py-2 bg-background" 
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Registration Number</label>
          <input 
            value={form.registrationNumber} 
            onChange={e => setForm({...form, registrationNumber: e.target.value})}
            className="w-full border border-border rounded-md px-3 py-2 bg-background" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Issuing Authority</label>
          <input 
            value={form.issuingAuthority} 
            onChange={e => setForm({...form, issuingAuthority: e.target.value})}
            className="w-full border border-border rounded-md px-3 py-2 bg-background" 
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea 
          rows={3}
          value={form.description} 
          onChange={e => setForm({...form, description: e.target.value})}
          className="w-full border border-border rounded-md px-3 py-2 bg-background" 
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Document URL (e.g. PDF link)</label>
        <input 
          value={form.documentUrl} 
          onChange={e => setForm({...form, documentUrl: e.target.value})}
          className="w-full border border-border rounded-md px-3 py-2 bg-background" 
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Verification URL (e.g. Govt. portal)</label>
        <input 
          type="url"
          value={form.verificationUrl} 
          onChange={e => setForm({...form, verificationUrl: e.target.value})}
          className="w-full border border-border rounded-md px-3 py-2 bg-background" 
        />
      </div>

      <div className="flex items-center gap-6 pt-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            checked={form.isPublished} 
            onChange={e => setForm({...form, isPublished: e.target.checked})}
          />
          <span className="text-sm font-medium">Published</span>
        </label>
        
        <div>
          <label className="text-sm font-medium mr-2">Display Order</label>
          <input 
            type="number"
            value={form.displayOrder} 
            onChange={e => setForm({...form, displayOrder: parseInt(e.target.value) || 0})}
            className="w-20 border border-border rounded-md px-2 py-1 bg-background text-center" 
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-border">
        {initialData ? (
          <Button type="button" variant="outline" onClick={handleDelete} disabled={loading}>
            <Trash2 size={16} className="mr-2" /> Delete
          </Button>
        ) : <div />}
        
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => router.push("/admin/transparency")}>Cancel</Button>
          <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Registration"}</Button>
        </div>
      </div>
    </form>
  );
}

