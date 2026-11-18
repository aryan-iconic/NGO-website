"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";

export interface CampaignGalleryItem {
  type: string;
  url: string;
  altText?: string | null;
}

function videoEmbedUrl(rawUrl: string): string | null {
  try {
    const url = new URL(rawUrl);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}` : null;
    }
    if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
      const id = url.searchParams.get("v") || url.pathname.match(/^\/(?:embed|shorts)\/([^/?]+)/)?.[1];
      return id ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}` : null;
    }
    if (host === "vimeo.com") {
      const id = url.pathname.match(/^\/(\d+)/)?.[1];
      return id ? `https://player.vimeo.com/video/${encodeURIComponent(id)}` : null;
    }
    if (host === "player.vimeo.com" && /^\/video\/\d+/.test(url.pathname)) return url.href;
  } catch {
    return null;
  }
  return null;
}

function youtubeThumbnail(url: string): string | null {
  const embed = videoEmbedUrl(url);
  const id = embed?.match(/youtube-nocookie\.com\/embed\/([^/?]+)/)?.[1];
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

export function CampaignMediaGallery({ items, campaignTitle, heading }: { items: CampaignGalleryItem[]; campaignTitle: string; heading: string }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeItem = activeIndex === null ? null : items[activeIndex];

  useEffect(() => {
    if (activeIndex === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowRight") setActiveIndex((index) => index === null ? null : (index + 1) % items.length);
      if (event.key === "ArrowLeft") setActiveIndex((index) => index === null ? null : (index - 1 + items.length) % items.length);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, items.length]);

  if (!items.length) return null;

  return (
    <section aria-labelledby="campaign-gallery-heading">
      <h2 id="campaign-gallery-heading" className="text-2xl">{heading}</h2>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {items.map((item, index) => {
          const isVideo = item.type === "VIDEO";
          const thumbnail = isVideo ? youtubeThumbnail(item.url) : null;
          return (
            <button
              key={`${item.type}-${item.url}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={isVideo ? `Play campaign video ${index + 1}` : `View ${item.altText || campaignTitle}, image ${index + 1}`}
              className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-maroon/5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {thumbnail ? (
                <img src={thumbnail} alt="" loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
              ) : !isVideo ? (
                <img src={item.url} alt={item.altText || `${campaignTitle} campaign`} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-maroon to-maroon/80 px-4 text-center text-white">
                  <Play size={30} fill="currentColor" />
                  <span className="max-w-full truncate text-xs opacity-90">Campaign video</span>
                </div>
              )}
              {isVideo && <span className="absolute inset-0 grid place-items-center bg-black/15"><span className="grid size-12 place-items-center rounded-full bg-white/95 text-maroon shadow-lg"><Play size={20} fill="currentColor" /></span></span>}
              {!isVideo && item.altText && <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/70 to-transparent px-3 pb-2 pt-6 text-left text-xs text-white">{item.altText}</span>}
            </button>
          );
        })}
      </div>

      {activeItem && activeIndex !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4" role="dialog" aria-modal="true" aria-label="Campaign media viewer" onMouseDown={(event) => { if (event.target === event.currentTarget) setActiveIndex(null); }}>
          <button type="button" onClick={() => setActiveIndex(null)} aria-label="Close media viewer" className="absolute right-4 top-4 z-10 grid size-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"><X /></button>
          <button type="button" onClick={() => setActiveIndex((activeIndex - 1 + items.length) % items.length)} aria-label="Previous media" className="absolute left-2 z-10 grid size-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:left-6"><ChevronLeft /></button>
          <div className="flex max-h-full w-full max-w-6xl flex-col items-center gap-3">
            {activeItem.type === "VIDEO" ? (
              videoEmbedUrl(activeItem.url) ? (
                <div className="aspect-video w-full overflow-hidden rounded-lg bg-black shadow-2xl">
                  <iframe src={videoEmbedUrl(activeItem.url) || undefined} title={`${campaignTitle} video`} className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
                </div>
              ) : <a href={activeItem.url} target="_blank" rel="noopener noreferrer" className="rounded-full bg-white px-5 py-3 font-medium text-maroon">Open video in a new tab</a>
            ) : (
              <img src={activeItem.url} alt={activeItem.altText || `${campaignTitle} campaign`} className="max-h-[80vh] max-w-full rounded-lg object-contain shadow-2xl" />
            )}
            <p className="text-center text-sm text-white/80">{activeItem.altText || campaignTitle} · {activeIndex + 1} of {items.length}</p>
          </div>
          <button type="button" onClick={() => setActiveIndex((activeIndex + 1) % items.length)} aria-label="Next media" className="absolute right-2 z-10 grid size-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:right-6"><ChevronRight /></button>
        </div>
      )}
    </section>
  );
}
