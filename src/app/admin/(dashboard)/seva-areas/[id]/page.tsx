import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { SevaAreaEditForm } from "@/components/admin/seva-area-edit-form";

export default async function EditSevaAreaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sevaArea = await db.getSevaArea(id, false);

  if (!sevaArea) {
    notFound();
  }

  return (
    <div>
      <div className="mb-4">
        <Link href="/admin/seva-areas" className="text-sm text-muted hover:text-maroon flex items-center gap-1.5 w-fit">
          <ArrowLeft size={16} /> Back to Seva Areas
        </Link>
      </div>
      <h1 className="text-2xl font-serif text-maroon mb-6">Edit Seva Area</h1>
      <SevaAreaEditForm sevaArea={sevaArea} isNew={false} />
    </div>
  );
}
