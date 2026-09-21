import Link from "next/link";
import { CampaignCard } from "@/components/campaign/campaign-card";
import { db } from "@/lib/db";
import { toPublicCampaign } from "@/lib/view-models";

export default async function CampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ sevaArea?: string }>;
}) {
  const { sevaArea } = await searchParams;
  const categories = await db.listSevaAreas();
  const filteredList = await db.listPublicCampaigns(sevaArea);
  const filtered = await Promise.all(filteredList.map(toPublicCampaign));

  return (
    <div className="container-app py-14">
      <h1 className="text-4xl">Explore Campaigns</h1>
      <p className="text-muted mt-2 max-w-xl">
        Every campaign here is created and verified by the Trust&apos;s administrators.
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        <Link
          href="/campaigns"
          className={`px-4 py-1.5 rounded-full text-sm border ${
            !sevaArea ? "bg-primary text-white border-primary" : "border-border text-text"
          }`}
        >
          All
        </Link>
        {categories.map((cat: any) => (
          <Link
            key={cat.id}
            href={`/campaigns?sevaArea=${cat.slug}`}
            className={`px-4 py-1.5 rounded-full text-sm border ${
              sevaArea === cat.slug
                ? "bg-primary text-white border-primary"
                : "border-border text-text"
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-16 text-center text-muted">
          No active campaigns in this category at the moment. Please check back soon for
          our latest seva initiatives.
        </div>
      ) : (
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((c) => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
        </div>
      )}
    </div>
  );
}
