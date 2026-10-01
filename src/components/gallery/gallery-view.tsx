"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { T } from "@/components/i18n/t";
import { useI18n } from "@/lib/i18n";

export function GalleryView({ items, categories }: { items: any[], categories: string[] }) {
  const [filter, setFilter] = useState("All");
  const [open, setOpen] = useState<string | null>(null);
  const { t } = useI18n();

  const filtered = filter === "All" ? items : items.filter((i) => i.category === filter);
  const openItem = items.find(i => i.id === open);

  return (
    <div className="container-app py-14">
      <h1 className="text-4xl"><T k="gal.title" /></h1>
      <p className="text-muted mt-2"><T k="gal.subtitle" /></p>

      <div className="mt-8 flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`px-4 py-1.5 rounded-full text-sm border ${
              filter === c ? "bg-primary text-white border-primary" : "border-border text-text"
            }`}
          >
            {t(c)}
          </button>
        ))}
      </div>

      <div className="mt-8 columns-2 sm:columns-3 gap-4 space-y-4">
        {filtered.map((item, idx) => (
          <button
            key={item.id}
            onClick={() => setOpen(item.id)}
            className="block w-full break-inside-avoid rounded-lg overflow-hidden border border-border group relative"
            aria-label={`View: ${item.caption || item.title}`}
          >
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.altText || item.caption || ""} className="w-full h-auto block" />
            ) : (
              <div
                className="aspect-square bg-gradient-to-br from-primary/15 to-maroon/10 group-hover:scale-105 transition-transform duration-300 flex items-end p-3"
                style={{ aspectRatio: idx % 3 === 0 ? "3/4" : "1/1" }}
              />
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
              <span className="text-sm text-white font-medium">{t(item.category)}</span>
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="text-muted mt-4">{t("No gallery items found for this category.")}</p>
        )}
      </div>

      {openItem && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(null)}
        >
          <button
            aria-label="Close"
            className="absolute top-5 right-5 text-white"
            onClick={() => setOpen(null)}
          >
            <X size={28} />
          </button>
          <div className="max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center gap-4" onClick={e => e.stopPropagation()}>
            {openItem.imageUrl && (
              <img src={openItem.imageUrl} alt={openItem.altText || ""} className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl" />
            )}
            {(openItem.caption || openItem.description) && (
              <div className="bg-black/60 p-4 rounded-lg text-center max-w-2xl">
                {openItem.caption && <p className="text-white font-serif text-xl">{t(openItem.caption)}</p>}
                {openItem.description && <p className="text-white/80 text-sm mt-2">{t(openItem.description)}</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
