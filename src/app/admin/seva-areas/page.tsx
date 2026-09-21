import { db } from "@/lib/db";
import Link from "next/link";
import { LinkButton } from "@/components/ui/button";

export default async function SevaAreasPage() {
  // Uses direct DB call since it's a server component in admin
  const sevaAreas = await db.listSevaAreas();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif text-maroon">Seva Areas</h1>
        <LinkButton href="/admin/seva-areas/new">Add Seva Area</LinkButton>
      </div>

      <div className="mt-6 border border-border rounded-lg bg-surface divide-y divide-border overflow-hidden">
        <div className="grid grid-cols-[3fr_2fr_1fr_1fr] p-4 bg-background text-xs font-semibold uppercase tracking-wide text-muted">
          <div>Name</div>
          <div>Slug</div>
          <div>Status</div>
          <div className="text-right">Actions</div>
        </div>
        {sevaAreas.map((sa: any) => (
          <div key={sa.id} className="grid grid-cols-[3fr_2fr_1fr_1fr] items-center p-4">
            <div>
              <p className="font-medium text-maroon">{sa.name}</p>
              {sa.hindiName && <p className="text-sm text-muted">{sa.hindiName}</p>}
            </div>
            <div className="text-sm text-muted">{sa.slug}</div>
            <div className="text-sm">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sa.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {sa.published ? "Published" : "Draft"}
              </span>
            </div>
            <div className="text-right">
              <Link href={`/admin/seva-areas/${sa.id}`} className="text-sm text-primary hover:underline">
                Edit
              </Link>
            </div>
          </div>
        ))}
        {sevaAreas.length === 0 && (
          <div className="p-8 text-center text-muted">No Seva Areas found.</div>
        )}
      </div>
    </div>
  );
}
