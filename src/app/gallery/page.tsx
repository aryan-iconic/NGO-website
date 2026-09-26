"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { T } from "@/components/i18n/t";

const categories = ["All", "Initiatives", "Seva", "Community", "Education", "Spiritual", "Volunteers"];

const items = Array.from({ length: 12 }).map((_, i) => ({
  id: i,
  category: categories[(i % (categories.length - 1)) + 1],
  caption: [
    "Camp kitchen serving meals",
    "Volunteers packing ration kits",
    "School kit distribution",
    "Sanctuary restoration work",
    "Community gathering",
    "Medical camp",
  ][i % 6],
}));

export default function GalleryPage() {
  const [filter, setFilter] = useState("All");
  const [open, setOpen] = useState<number | null>(null);

  const filtered = filter === "All" ? items : items.filter((i) => i.category === filter);

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
            {c}
          </button>
        ))}
      </div>

      <div className="mt-8 columns-2 sm:columns-3 gap-4 space-y-4">
        {filtered.map((item) => (
          <button
            key={item.id}
            onClick={() => setOpen(item.id)}
            className="block w-full break-inside-avoid rounded-lg overflow-hidden border border-border group"
            aria-label={`View: ${item.caption}`}
          >
            <div
              className="aspect-square bg-gradient-to-br from-primary/15 to-maroon/10 group-hover:scale-105 transition-transform duration-300 flex items-end p-3"
              style={{ aspectRatio: item.id % 3 === 0 ? "3/4" : "1/1" }}
            >
              <span className="text-xs text-maroon/70 font-medium">{item.category}</span>
            </div>
          </button>
        ))}
      </div>

      {open !== null && (
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
          <div className="max-w-lg w-full aspect-[4/3] rounded-lg bg-gradient-to-br from-primary/30 to-maroon/20 flex items-end p-6">
            <p className="text-white font-serif text-xl">{items[open].caption}</p>
          </div>
        </div>
      )}
    </div>
  );
}
