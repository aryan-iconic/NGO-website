import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { GalleryForm } from "@/components/admin/gallery-form";

export default async function AdminGalleryEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await db.getGalleryItem(id);
  if (!item) notFound();

  return (
    <div>
      <h1 className="text-2xl font-serif text-maroon mb-6">Edit Gallery Image</h1>
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
