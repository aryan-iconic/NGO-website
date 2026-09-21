import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { SevaAreaEditForm } from "@/components/admin/seva-area-edit-form";

export default async function EditSevaAreaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sevaArea = db.getSevaArea(id);

  if (!sevaArea) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-serif text-maroon mb-6">Edit Seva Area</h1>
      <SevaAreaEditForm sevaArea={sevaArea} isNew={false} />
    </div>
  );
}
