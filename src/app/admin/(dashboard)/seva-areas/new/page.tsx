import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SevaAreaEditForm } from "@/components/admin/seva-area-edit-form";

export default function NewSevaAreaPage() {
  return (
    <div>
      <div className="mb-4">
        <Link href="/admin/seva-areas" className="text-sm text-muted hover:text-maroon flex items-center gap-1.5 w-fit">
          <ArrowLeft size={16} /> Back to Seva Areas
        </Link>
      </div>
      <h1 className="text-2xl font-serif text-maroon mb-6">Add Seva Area</h1>
      <SevaAreaEditForm isNew={true} />
    </div>
  );
}
