import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { GalleryForm } from "@/components/admin/gallery-form";

export default function AdminGalleryNewPage() {
  return (
    <div>
      <div className="mb-4">
        <Link href="/admin/content/gallery" className="text-sm text-muted hover:text-maroon flex items-center gap-1.5 w-fit">
          <ArrowLeft size={16} /> Back to Gallery
        </Link>
      </div>
      <h1 className="text-2xl font-serif text-maroon mb-6">Add Gallery Photo</h1>
      <GalleryForm mode="create" />
    </div>
  );
}
