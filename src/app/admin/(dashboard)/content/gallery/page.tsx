import Link from "next/link";
import { Eye } from "lucide-react";
import { db } from "@/lib/db";
import { LinkButton } from "@/components/ui/button";
import { DeleteButton } from "@/components/admin/delete-button";
import Image from "next/image";
import { BackToContent } from "@/components/admin/back-to-content";

type GalleryAdminItem = {
  id: string;
  title: string | null;
  caption: string | null;
  category: string;
  imageUrl: string;
  altText: string | null;
  isPublished: boolean;
  displayOrder: number;
};

export default async function AdminGalleryListPage() {
  const items = await db.listGalleryItems(true) as GalleryAdminItem[];

  return (
    <div>
      <BackToContent />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif text-maroon">Gallery</h1>
          <p className="mt-1 text-sm text-muted">Manage photos, captions, categories, accessibility text, and publication order for the public gallery.</p>
        </div>
        <div className="flex items-center gap-4">
          <a
            href={`/api/admin/preview?type=gallery&slug=gallery`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm font-medium text-maroon hover:underline"
          >
            <Eye size={16} /> Preview Gallery
          </a>
          <LinkButton href="/admin/content/gallery/new" size="sm">Add Photo</LinkButton>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between text-sm text-muted">
        <span>{items.length} {items.length === 1 ? "photo" : "photos"}</span>
        <span>Published: {items.filter((item) => item.isPublished).length} · Draft: {items.filter((item) => !item.isPublished).length}</span>
      </div>

      <div className="mt-3 bg-surface border border-border rounded-lg divide-y divide-border">
        {items.map((item) => (
          <div key={item.id} className="p-4 flex gap-4 items-center hover:bg-cream/40">
            <div className="w-16 h-16 bg-cream rounded-md overflow-hidden flex-shrink-0">
              {item.imageUrl ? (
                <Image src={item.imageUrl} alt={item.altText || item.caption || item.title || "Gallery photo preview"} width={64} height={64} unoptimized className="w-full h-full object-cover" />
              ) : null}
            </div>
            <div className="flex-1 min-w-0">
              <Link href={`/admin/content/gallery/${item.id}`} className="font-medium truncate hover:text-primary">{item.caption || item.title || "Untitled Photo"}</Link>
              <p className="text-xs text-muted mt-1">{item.category || "Uncategorized"}{item.title && item.caption ? ` · ${item.title}` : ""}</p>
              <p className="text-xs text-muted mt-1 truncate">Alt text: {item.altText || "Not set"} · Order: {item.displayOrder}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className={`text-xs px-2 py-0.5 rounded-full ${item.isPublished ? 'bg-success/10 text-success' : 'bg-cream text-muted'}`}>
                {item.isPublished ? "PUBLISHED" : "DRAFT"}
              </span>
              <DeleteButton endpoint={`/api/admin/gallery/${item.id}`} title="Delete" />
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="p-10 text-center">
            <p className="font-serif text-lg text-maroon">No gallery photos yet</p>
            <p className="mt-2 text-sm text-muted">Upload the first photo, add a caption and alt text, then publish it to the public gallery.</p>
            <LinkButton href="/admin/content/gallery/new" size="sm" className="mt-4">Add First Photo</LinkButton>
          </div>
        )}
      </div>
    </div>
  );
}
