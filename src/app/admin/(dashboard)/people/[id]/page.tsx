"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, LinkButton } from "@/components/ui/button";
import { ImageUpload } from "@/components/ui/image-upload";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function EditTeamMemberPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    role: "",
    bio: "",
    imageUrl: "",
    displayOrder: 0,
    isPublished: true,
  });

  useEffect(() => {
    fetch(`/api/admin/people/${params.id}`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data) {
          setForm({
            name: d.data.name,
            role: d.data.role,
            bio: d.data.bio || "",
            imageUrl: d.data.imageUrl || "",
            displayOrder: d.data.displayOrder,
            isPublished: d.data.isPublished,
          });
        }
        setLoading(false);
      });
  }, [params.id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/admin/people/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.success) {
      router.push("/admin/people");
      router.refresh();
    } else {
      setError(data.error?.message || "Failed to update team member");
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this team member?")) return;
    const res = await fetch(`/api/admin/people/${params.id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      router.push("/admin/people");
      router.refresh();
    } else {
      setError(data.error?.message || "Failed to delete");
    }
  };

  if (loading) return <div className="p-8 text-muted">Loading...</div>;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="mb-4">
        <Link href="/admin/people" className="text-sm text-muted hover:text-maroon flex items-center gap-1.5 w-fit">
          <ArrowLeft size={16} /> Back to Team
        </Link>
      </div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif text-maroon">Edit Team Member</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="p-6 rounded-lg border border-border bg-surface space-y-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <input 
              type="text" required
              value={form.name} onChange={(e) => setForm({...form, name: e.target.value})}
              className="w-full mt-1.5 rounded-lg border border-border px-4 py-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Role / Title</label>
            <input 
              type="text" required
              value={form.role} onChange={(e) => setForm({...form, role: e.target.value})}
              className="w-full mt-1.5 rounded-lg border border-border px-4 py-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Bio</label>
            <textarea 
              rows={3}
              value={form.bio} onChange={(e) => setForm({...form, bio: e.target.value})}
              className="w-full mt-1.5 rounded-lg border border-border px-4 py-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Profile Image</label>
            <div className="mt-1.5">
              <ImageUpload
                value={form.imageUrl}
                onChange={(url) => setForm({...form, imageUrl: url})}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
            <div>
              <label className="text-sm font-medium">Display Order</label>
              <input 
                type="number"
                value={form.displayOrder} onChange={(e) => setForm({...form, displayOrder: parseInt(e.target.value) || 0})}
                className="w-full mt-1.5 rounded-lg border border-border px-4 py-2"
              />
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <input 
                type="checkbox" id="isPublished"
                checked={form.isPublished} onChange={(e) => setForm({...form, isPublished: e.target.checked})}
                className="w-4 h-4"
              />
              <label htmlFor="isPublished" className="text-sm font-medium">Visible to Public</label>
            </div>
          </div>
        </div>

        {error && <p className="text-red text-sm">{error}</p>}
        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" className="text-red border-red/30 hover:bg-red/10 mr-auto" onClick={handleDelete}>Delete</Button>
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={saving}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
        </div>
      </form>
    </div>
  );
}
