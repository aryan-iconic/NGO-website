import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { GalleryForm } from "@/components/admin/gallery-form";

export default async function AdminGalleryEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await db.getGalleryItem(id);
  if (!item) notFound();

  return (
    <div>
      <div className="mb-4">
        <Link href="/admin/content/gallery" className="text-sm text-muted hover:text-maroon flex items-center gap-1.5 w-fit">
          <ArrowLeft size={16} /> Back to Gallery
        </Link>
      </div>
      <h1 className="text-2xl font-serif text-maroon mb-6">Edit Gallery Photo</h1>
      <GalleryForm
        mode="edit"
        itemId={item.id}
        initial={{
          title: item.title ?? "",
          caption: item.caption ?? "",
          description: item.description ?? "",
          category: item.category ?? "All",
          imageUrl: item.imageUrl ?? "",
          altText: item.altText ?? "",
          isPublished: item.isPublished,
          displayOrder: item.displayOrder,
        }}
      />
    </div>
  );
}
