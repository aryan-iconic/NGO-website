"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SocialMediaAdminPage() {
  const [instagramPosts, setInstagramPosts] = useState<any[]>([]);
  const [youtubeVideos, setYoutubeVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Forms
  const [igForm, setIgForm] = useState<any>(null);
  const [ytForm, setYtForm] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [igRes, ytRes] = await Promise.all([
        fetch("/api/admin/social/instagram").then((r) => r.json()),
        fetch("/api/admin/social/youtube").then((r) => r.json()),
      ]);
      if (igRes.success) setInstagramPosts(igRes.data);
      if (ytRes.success) setYoutubeVideos(ytRes.data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const saveInstagram = async (e: React.FormEvent) => {
    e.preventDefault();
    const isUpdate = !!igForm.id;
    const url = isUpdate ? `/api/admin/social/instagram/${igForm.id}` : "/api/admin/social/instagram";
    const method = isUpdate ? "PATCH" : "POST";
    
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instagramUrl: igForm.instagramUrl,
        title: igForm.title,
        caption: igForm.caption,
        displayOrder: Number(igForm.displayOrder),
        isPublished: igForm.isPublished,
      }),
    });
    
    if (res.ok) {
      setIgForm(null);
      fetchData();
    } else {
      const data = await res.json();
      alert(data.error?.message || "Failed to save");
    }
  };

  const saveYouTube = async (e: React.FormEvent) => {
    e.preventDefault();
    const isUpdate = !!ytForm.id;
    const url = isUpdate ? `/api/admin/social/youtube/${ytForm.id}` : "/api/admin/social/youtube";
    const method = isUpdate ? "PATCH" : "POST";
    
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        youtubeUrl: ytForm.youtubeUrl,
        title: ytForm.title,
        description: ytForm.description,
        displayOrder: Number(ytForm.displayOrder),
        isPublished: ytForm.isPublished,
      }),
    });
    
    if (res.ok) {
      setYtForm(null);
      fetchData();
    } else {
      const data = await res.json();
      alert(data.error?.message || "Failed to save");
    }
  };

  const toggleInstagram = async (id: string, currentStatus: boolean) => {
    await fetch(`/api/admin/social/instagram/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !currentStatus }),
    });
    fetchData();
  };

  const toggleYouTube = async (id: string, currentStatus: boolean) => {
    await fetch(`/api/admin/social/youtube/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !currentStatus }),
    });
    fetchData();
  };

  const deleteInstagram = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    await fetch(`/api/admin/social/instagram/${id}`, { method: "DELETE" });
    fetchData();
  };

  const deleteYouTube = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    await fetch(`/api/admin/social/youtube/${id}`, { method: "DELETE" });
    fetchData();
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-serif text-maroon mb-8">Social Media & Posts</h1>

      {/* Instagram Section */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Instagram Posts</h2>
          <Button onClick={() => setIgForm({ instagramUrl: "", title: "", caption: "", displayOrder: 0, isPublished: true })}>
            <Plus size={16} className="mr-2" /> Add Instagram Post
          </Button>
        </div>

        {igForm && (
          <form onSubmit={saveInstagram} className="bg-surface p-4 border border-border rounded-lg mb-6 flex flex-col gap-4">
            <input required type="url" placeholder="Instagram URL" className="p-2 border rounded" value={igForm.instagramUrl} onChange={e => setIgForm({ ...igForm, instagramUrl: e.target.value })} />
            <input type="text" placeholder="Title (Optional)" className="p-2 border rounded" value={igForm.title || ""} onChange={e => setIgForm({ ...igForm, title: e.target.value })} />
            <input type="number" placeholder="Display Order" className="p-2 border rounded" value={igForm.displayOrder} onChange={e => setIgForm({ ...igForm, displayOrder: e.target.value })} />
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={igForm.isPublished} onChange={e => setIgForm({ ...igForm, isPublished: e.target.checked })} />
              Published
            </label>
            <div className="flex gap-2">
              <Button type="submit">Save</Button>
              <Button variant="outline" type="button" onClick={() => setIgForm(null)}>Cancel</Button>
            </div>
          </form>
        )}

        <div className="bg-surface border border-border rounded-lg p-4">
          {instagramPosts.length === 0 ? <p className="text-muted">No posts found.</p> : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b">
                  <th className="pb-2">URL</th>
                  <th className="pb-2">Title</th>
                  <th className="pb-2">Order</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {instagramPosts.map(post => (
                  <tr key={post.id} className="border-b last:border-0">
                    <td className="py-3"><a href={post.instagramUrl} target="_blank" className="text-primary hover:underline" rel="noreferrer">View Link</a></td>
                    <td className="py-3">{post.title || "-"}</td>
                    <td className="py-3">{post.displayOrder}</td>
                    <td className="py-3">
                      <button onClick={() => toggleInstagram(post.id, post.isPublished)} className={`px-2 py-1 rounded text-xs ${post.isPublished ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {post.isPublished ? "✓ Published" : "✕ Unpublished"}
                      </button>
                    </td>
                    <td className="py-3 text-right">
                      <button onClick={() => setIgForm(post)} className="p-1 text-muted hover:text-primary"><Edit size={16} /></button>
                      <button onClick={() => deleteInstagram(post.id)} className="p-1 text-muted hover:text-red"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* YouTube Section */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">YouTube Videos</h2>
          <Button onClick={() => setYtForm({ youtubeUrl: "", title: "", description: "", displayOrder: 0, isPublished: true })}>
            <Plus size={16} className="mr-2" /> Add YouTube Video
          </Button>
        </div>

        {ytForm && (
          <form onSubmit={saveYouTube} className="bg-surface p-4 border border-border rounded-lg mb-6 flex flex-col gap-4">
            <input required type="url" placeholder="YouTube URL" className="p-2 border rounded" value={ytForm.youtubeUrl} onChange={e => setYtForm({ ...ytForm, youtubeUrl: e.target.value })} />
            <input type="text" placeholder="Title (Optional)" className="p-2 border rounded" value={ytForm.title || ""} onChange={e => setYtForm({ ...ytForm, title: e.target.value })} />
            <input type="number" placeholder="Display Order" className="p-2 border rounded" value={ytForm.displayOrder} onChange={e => setYtForm({ ...ytForm, displayOrder: e.target.value })} />
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={ytForm.isPublished} onChange={e => setYtForm({ ...ytForm, isPublished: e.target.checked })} />
              Published
            </label>
            <div className="flex gap-2">
              <Button type="submit">Save</Button>
              <Button variant="outline" type="button" onClick={() => setYtForm(null)}>Cancel</Button>
            </div>
          </form>
        )}

        <div className="bg-surface border border-border rounded-lg p-4">
          {youtubeVideos.length === 0 ? <p className="text-muted">No videos found.</p> : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b">
                  <th className="pb-2">URL</th>
                  <th className="pb-2">Title</th>
                  <th className="pb-2">Order</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {youtubeVideos.map(video => (
                  <tr key={video.id} className="border-b last:border-0">
                    <td className="py-3"><a href={video.youtubeUrl} target="_blank" className="text-primary hover:underline" rel="noreferrer">View Link</a></td>
                    <td className="py-3">{video.title || "-"}</td>
                    <td className="py-3">{video.displayOrder}</td>
                    <td className="py-3">
                      <button onClick={() => toggleYouTube(video.id, video.isPublished)} className={`px-2 py-1 rounded text-xs ${video.isPublished ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {video.isPublished ? "✓ Published" : "✕ Unpublished"}
                      </button>
                    </td>
                    <td className="py-3 text-right">
                      <button onClick={() => setYtForm(video)} className="p-1 text-muted hover:text-primary"><Edit size={16} /></button>
                      <button onClick={() => deleteYouTube(video.id)} className="p-1 text-muted hover:text-red"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
