import { db } from "@/lib/db";
import { TransparencyForm } from "../transparency-form";
import { notFound } from "next/navigation";

export default async function EditTransparencyPage({ params }: { params: { id: string } }) {
  const reg = await db.getStatutoryRegistration(params.id);
  if (!reg) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-serif text-maroon">Edit Registration</h1>
      <TransparencyForm initialData={reg} />
    </div>
  );
}
