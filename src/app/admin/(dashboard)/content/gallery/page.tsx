import Link from "next/link";
import { Eye } from "lucide-react";
import { db } from "@/lib/db";
import { LinkButton } from "@/components/ui/button";

export default async function AdminGalleryListPage() {
  const items = await db.listGalleryItems(true);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-serif text-maroon">Gallery</h1>
        <div className="flex items-center gap-4">
          <a
            href={`/api/admin/preview?type=gallery&slug=gallery`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm font-medium text-maroon hover:underline"
          >
            <Eye size={16} /> Preview Gallery
          </a>
          <LinkButton href="/admin/content/gallery/new" size="sm">Add Image</LinkButton>
        </div>
      </div>

      <div className="mt-6 bg-surface border border-border rounded-lg divide-y divide-border">
        {items.map((item: any) => (
          <Link key={item.id} href={`/admin/content/gallery/${item.id}`} className="p-4 flex gap-4 items-center hover:bg-cream/40">
            <div className="w-16 h-16 bg-cream rounded-md overflow-hidden flex-shrink-0">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
              ) : null}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{item.title || "Untitled Image"}</p>
              <p className="text-xs text-muted mt-1">{item.category}</p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${item.isPublished ? 'bg-success/10 text-success' : 'bg-cream text-muted'}`}>
              {item.isPublished ? "PUBLISHED" : "DRAFT"}
            </span>
          </Link>
        ))}
        {items.length === 0 && <p className="p-8 text-center text-muted">No gallery items yet.</p>}
      </div>
    </div>
  );
}
