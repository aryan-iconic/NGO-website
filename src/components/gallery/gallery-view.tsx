"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { T } from "@/components/i18n/t";
import { useI18n } from "@/lib/i18n";

export type GalleryItemView = {
  id: string;
  title: string | null;
  caption: string | null;
  description: string | null;
  category: string;
  imageUrl: string;
  altText: string | null;
  displayOrder: number;
};

export function GalleryView({ items, categories }: { items: GalleryItemView[]; categories: string[] }) {
  const [filter, setFilter] = useState("All");
  const [open, setOpen] = useState<string | null>(null);
  const { t } = useI18n();

  const filtered = useMemo(() => filter === "All" ? items : items.filter((item) => item.category === filter), [filter, items]);
  const activeIndex = filtered.findIndex((item) => item.id === open);
  const openItem = activeIndex >= 0 ? filtered[activeIndex] : null;

  useEffect(() => {
    if (!openItem) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(null);
      if (event.key === "ArrowLeft" && filtered.length > 1) setOpen(filtered[(activeIndex - 1 + filtered.length) % filtered.length].id);
      if (event.key === "ArrowRight" && filtered.length > 1) setOpen(filtered[(activeIndex + 1) % filtered.length].id);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, filtered, openItem]);

  const move = (direction: -1 | 1) => {
    if (filtered.length < 2 || activeIndex < 0) return;
    setOpen(filtered[(activeIndex + direction + filtered.length) % filtered.length].id);
  };

  return (
    <main className="container-app py-12 sm:py-16">
      <header className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-cream via-surface to-primary/5 px-6 py-10 sm:px-10 sm:py-14">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Shri Nityanikunj Trust</p>
          <h1 className="mt-3 text-4xl sm:text-5xl font-serif text-maroon"><T k="gal.title" /></h1>
          <p className="text-muted mt-3 max-w-xl"><T k="gal.subtitle" /></p>
        </div>
        <div className="mt-7 inline-flex items-baseline gap-2 rounded-full border border-border bg-background/80 px-4 py-2 text-sm">
          <span className="font-semibold text-maroon">{items.length}</span>
          <span className="text-muted">{items.length === 1 ? "moment" : "moments"}</span>
        </div>
      </header>

      {categories.length > 1 && <nav className="mt-8 flex flex-wrap gap-2" aria-label="Filter gallery by category">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={filter === c}
            onClick={() => { setFilter(c); setOpen(null); }}
            className={`px-4 py-2 rounded-full text-sm border transition-colors ${
              filter === c ? "bg-primary text-white border-primary" : "border-border text-text"
            }`}
          >
            {t(c)}
          </button>
        ))}
      </nav>}

      <section className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4" aria-label="Gallery photos">
        {filtered.map((item, idx) => (
          <article
            key={item.id}
            className="overflow-hidden rounded-xl border border-border bg-surface shadow-[var(--shadow-soft)] transition-transform hover:-translate-y-0.5"
          >
            <button type="button" onClick={() => setOpen(item.id)} className="group block w-full text-left" aria-label={`View photo: ${item.caption || item.title || item.altText || `Gallery image ${idx + 1}`}`}>
              <div className="relative aspect-[4/3] overflow-hidden bg-cream">
                <Image src={item.imageUrl} alt={item.altText || item.caption || item.title || `Gallery image ${idx + 1}`} fill unoptimized sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent opacity-80" />
                <span className="absolute bottom-3 left-3 rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">{t(item.category)}</span>
              </div>
              {(item.caption || item.title) && <div className="px-3 py-3 sm:px-4"><p className="line-clamp-2 text-sm font-medium text-text">{t(item.caption || item.title || "")}</p></div>}
            </button>
          </article>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-border bg-surface px-6 py-14 text-center">
            <p className="font-serif text-xl text-maroon">{items.length === 0 ? "Gallery coming soon" : t("No gallery items found for this category.")}</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">{items.length === 0 ? "We are gathering photos from our campaigns, events and seva. Please visit again soon." : "Try another category to see more moments from the Trust."}</p>
            {items.length > 0 && <button type="button" onClick={() => setFilter("All")} className="mt-4 text-sm font-medium text-primary hover:underline">View all photos</button>}
          </div>
        )}
      </section>

      {openItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="Gallery photo viewer"
          onClick={() => setOpen(null)}
        >
          <button
            aria-label="Close"
            type="button"
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            onClick={() => setOpen(null)}
          >
            <X size={24} />
          </button>
          {filtered.length > 1 && <button type="button" aria-label="Previous photo" onClick={(event) => { event.stopPropagation(); move(-1); }} className="absolute left-2 sm:left-6 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"><ChevronLeft size={28} /></button>}
          <div className="flex max-h-[90vh] w-full max-w-5xl flex-col items-center gap-4" onClick={(event) => event.stopPropagation()}>
            <Image src={openItem.imageUrl} alt={openItem.altText || openItem.caption || openItem.title || "Gallery photo"} width={1600} height={1200} unoptimized className="max-h-[72vh] max-w-full rounded-lg object-contain shadow-2xl" />
            <div className="max-w-3xl text-center">
              {(openItem.caption || openItem.title) && <p className="font-serif text-xl text-white">{t(openItem.caption || openItem.title || "")}</p>}
              {openItem.description && <p className="mt-2 text-sm text-white/75">{t(openItem.description)}</p>}
              <p className="mt-2 text-xs text-white/60" aria-live="polite">{activeIndex + 1} / {filtered.length} · {t(openItem.category)}</p>
            </div>
          </div>
          {filtered.length > 1 && <button type="button" aria-label="Next photo" onClick={(event) => { event.stopPropagation(); move(1); }} className="absolute right-2 sm:right-6 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"><ChevronRight size={28} /></button>}
        </div>
      )}
    </main>
  );
}
