import { db } from "@/lib/db";
import { draftMode } from "next/headers";
import { GalleryView, type GalleryItemView } from "@/components/gallery/gallery-view";

export default async function GalleryPage() {
  const isDraftMode = (await draftMode()).isEnabled;
  const items = await db.listGalleryItems(isDraftMode) as GalleryItemView[];
  // Extract unique categories, ensuring "All" is always first
  const catSet = new Set<string>(items.map((item) => item.category || "All"));
  catSet.delete("All");
  const categories = ["All", ...Array.from(catSet)];

  return <GalleryView items={items} categories={categories} />;
}
