"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ui/image-upload";

interface Media {
  id: string;
  type: string;
  url: string;
  altText: string | null;
}

export function CampaignMediaManager({ campaignId }: { campaignId: string }) {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingVideo, setAddingVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");

  const loadMedia = async () => {
    const res = await fetch(`/api/admin/campaigns/${campaignId}/media`);
    const data = await res.json();
    if (data.success) {
      setMedia(data.media);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadMedia();
  }, [campaignId]);

  const handleAddImage = async (url: string) => {
    if (!url) return;
    setLoading(true);
    await fetch(`/api/admin/campaigns/${campaignId}/media`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "IMAGE", url }),
    });
    loadMedia();
  };

  const handleAddVideo = async () => {
    if (!videoUrl) return;
    setLoading(true);
    await fetch(`/api/admin/campaigns/${campaignId}/media`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "VIDEO", url: videoUrl }),
    });
    setAddingVideo(false);
    setVideoUrl("");
    loadMedia();
  };

  const handleDelete = async (mediaId: string) => {
    if (!confirm("Remove this media item?")) return;
    setLoading(true);
    await fetch(`/api/admin/campaigns/${campaignId}/media/${mediaId}`, {
      method: "DELETE",
    });
    loadMedia();
  };

  if (loading && media.length === 0) return <div className="text-sm text-muted">Loading media...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-3">Add Image</h3>
        <ImageUpload value="" onChange={handleAddImage} label="" />
      </div>

      <div>
        <h3 className="text-sm font-medium mb-3">Add Video</h3>
        {addingVideo ? (
          <div className="flex gap-2">
            <input 
              type="url" 
              placeholder="https://youtube.com/..." 
              value={videoUrl}
              onChange={e => setVideoUrl(e.target.value)}
              className="flex-1 rounded-lg border border-border px-3 py-1.5 text-sm bg-surface"
            />
            <Button size="sm" onClick={handleAddVideo} disabled={!videoUrl || loading}>Save Video</Button>
            <Button size="sm" variant="outline" onClick={() => setAddingVideo(false)}>Cancel</Button>
          </div>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setAddingVideo(true)}>+ Add Video URL</Button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        {media.map(m => (
          <div key={m.id} className="relative group rounded-lg overflow-hidden border border-border aspect-square bg-cream">
            {m.type === "IMAGE" ? (
              <img src={m.url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                <span className="text-2xl mb-2">🎥</span>
                <span className="text-xs text-muted truncate w-full">{m.url}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button size="sm" variant="secondary" onClick={() => handleDelete(m.id)}>Remove</Button>
            </div>
          </div>
        ))}
        {media.length === 0 && (
          <div className="col-span-full py-8 text-center text-sm text-muted bg-surface rounded-lg border border-dashed border-border">
            No media uploaded yet.
          </div>
        )}
      </div>
    </div>
  );
}
