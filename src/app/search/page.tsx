import type { Metadata } from "next";
import { SearchPageClient } from "@/components/search/search-page-client";

export const metadata: Metadata = { title: "Search | Shri Nityanikunj Trust", robots: { index: false, follow: true } };

export default function SearchPage() {
  return <SearchPageClient />;
}
