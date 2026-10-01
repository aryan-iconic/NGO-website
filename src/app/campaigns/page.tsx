import Link from "next/link";
import { CampaignCard } from "@/components/campaign/campaign-card";
import { db } from "@/lib/db";
import { toPublicCampaign } from "@/lib/view-models";
import { Heart, SearchX } from "lucide-react";

import { getServerTranslator } from "@/lib/i18n-server";

export default async function CampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ sevaArea?: string }>;
}) {
  const { sevaArea } = await searchParams;
  const categories = await db.listSevaAreas();
  const filteredList = await db.listPublicCampaigns(sevaArea);
  const filtered = await Promise.all(filteredList.map(toPublicCampaign));
  const { t } = await getServerTranslator();

  return (
    <div className="bg-background min-h-screen pb-24">
      {/* Header Section */}
      <section className="relative bg-maroon text-white pt-20 pb-24 md:pt-28 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="container-app relative z-10 text-center max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-5 py-2 rounded-full text-sm font-bold tracking-widest uppercase mb-6 border border-white/20">
            <Heart size={16} /> {t("Our Causes")}
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight drop-shadow-md">
            {t("Explore Campaigns")}
          </h1>
          <p className="mt-6 text-xl text-cream/90 font-medium tracking-wide max-w-2xl mx-auto">
            {t("Every campaign here is created, verified, and executed directly by the Trust's administrators.")}
          </p>
        </div>
        {/* Decorative bottom curve */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-0">
          <svg className="relative block w-full h-[60px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" fill="var(--color-background)"></path>
          </svg>
        </div>
      </section>

      <div className="container-app max-w-7xl mx-auto relative z-20 -mt-8 md:-mt-10">
        
        {/* Filter Bar */}
        <div className="bg-white rounded-2xl shadow-lg border border-border p-4 md:p-6 mb-12 backdrop-blur-md">
          <div className="flex items-center gap-4 mb-4 md:hidden">
            <span className="text-sm font-bold text-primary uppercase tracking-widest">{t("Filter by Seva Area:")}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="hidden md:inline-block text-sm font-bold text-primary uppercase tracking-widest mr-2">{t("Filter:")}</span>
            <Link
              href="/campaigns"
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                !sevaArea ? "bg-primary text-white shadow-md shadow-primary/30" : "bg-surface border border-border text-text hover:bg-cream hover:border-primary/50"
              }`}
            >
              {t("All Campaigns")}
            </Link>
            {categories.map((cat: any) => (
              <Link
                key={cat.id}
                href={`/campaigns?sevaArea=${cat.slug}`}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  sevaArea === cat.slug
                    ? "bg-primary text-white shadow-md shadow-primary/30"
                    : "bg-surface border border-border text-text hover:bg-cream hover:border-primary/50"
                }`}
              >
                {t(cat.name)}
              </Link>
            ))}
          </div>
        </div>

        {/* Campaigns Grid */}
        {filtered.length === 0 ? (
          <div className="mt-16 text-center py-24 bg-surface rounded-3xl border border-dashed border-border/80 shadow-sm max-w-3xl mx-auto">
            <div className="w-20 h-20 bg-cream rounded-full flex items-center justify-center mx-auto mb-6">
              <SearchX size={36} className="text-maroon/50" />
            </div>
            <h3 className="text-2xl font-serif text-maroon mb-3">{t("No active campaigns found")}</h3>
            <p className="mt-2 text-muted max-w-md mx-auto text-lg leading-relaxed">
              {t("There are currently no active campaigns in this category. Please check back soon for our latest seva initiatives.")}
            </p>
            <Link href="/campaigns" className="inline-block mt-8 text-primary font-bold hover:underline">
              {t("View All Campaigns →")}
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((c) => (
              <div key={c.id} className="transform hover:-translate-y-2 transition-transform duration-300">
                <CampaignCard campaign={c} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
