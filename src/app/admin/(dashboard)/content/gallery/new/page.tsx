import { GalleryForm } from "@/components/admin/gallery-form";

export default function AdminGalleryNewPage() {
  return (
    <div>
      <h1 className="text-2xl font-serif text-maroon mb-6">Add Gallery Image</h1>
      <GalleryForm mode="create" />
    </div>
  );
}
