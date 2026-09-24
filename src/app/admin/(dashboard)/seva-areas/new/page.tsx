import { SevaAreaEditForm } from "@/components/admin/seva-area-edit-form";

export default function NewSevaAreaPage() {
  return (
    <div>
      <h1 className="text-2xl font-serif text-maroon mb-6">Add Seva Area</h1>
      <SevaAreaEditForm isNew={true} />
    </div>
  );
}
