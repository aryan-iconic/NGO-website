import { notFound } from "next/navigation";
import { MapPin, CheckCircle2, Circle } from "lucide-react";
import { db } from "@/lib/db";
import { toPublicCampaign } from "@/lib/view-models";
import { LinkButton } from "@/components/ui/button";
import { ProductCard } from "@/components/campaign/product-card";
import { CampaignCard } from "@/components/campaign/campaign-card";
import { ShareButtons } from "@/components/ui/share-buttons";

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const raw = await db.getPublicCampaignBySlug(slug);
  if (!raw) notFound();
  const campaign = await toPublicCampaign(raw);

  const campaignsList = await db.listPublicCampaigns(campaign.sevaArea?.slug);
  const related = (await Promise.all(campaignsList.map(toPublicCampaign)))
    .filter((c: any) => c.id !== campaign.id)
    .slice(0, 3);

  return (
    <div className="pb-20">
      {/* Hero */}
      <section className="bg-background-alt">
        <div className="container-app py-12 grid md:grid-cols-[3fr_2fr] gap-10 items-start">
          <div className="aspect-[16/10] rounded-lg bg-gradient-to-br from-primary/20 to-maroon/10 border border-border" />
          <div>
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <span className="text-xs font-medium text-primary uppercase tracking-wide">
                {campaign.sevaArea?.name ?? campaign.category.name}
              </span>
              <ShareButtons title={campaign.title} text={campaign.shortDescription} />
            </div>
            <h1 className="mt-2 text-3xl md:text-4xl leading-tight">{campaign.title}</h1>
            {campaign.locationText && (
              <p className="mt-3 flex items-center gap-1.5 text-sm text-muted">
                <MapPin size={14} /> {campaign.locationText}
              </p>
            )}
            <p className="mt-4 text-muted">{campaign.shortDescription}</p>
            <div className="mt-6 flex gap-3">
              <LinkButton href={`/donate/checkout?campaign=${campaign.slug}`} size="lg">
                Donate Now
              </LinkButton>
              <LinkButton href="/volunteer" variant="outline" size="lg">
                Volunteer
              </LinkButton>
            </div>
          </div>
        </div>
      </section>

      <div className="container-app grid lg:grid-cols-[2fr_1fr] gap-14 mt-14">
        <div className="space-y-14">
          {/* Story */}
          <section>
            <h2 className="text-2xl">The Story</h2>
            <p className="mt-3 text-text leading-relaxed">{campaign.story}</p>
            {campaign.beneficiaryInfo && (
              <>
                <h3 className="mt-6 text-lg">Who It Supports</h3>
                <p className="mt-2 text-muted">{campaign.beneficiaryInfo}</p>
              </>
            )}
            {campaign.impactDescription && (
              <>
                <h3 className="mt-6 text-lg">What We&apos;re Doing</h3>
                <p className="mt-2 text-muted">{campaign.impactDescription}</p>
              </>
            )}
          </section>

          {/* Products */}
          {campaign.products.length > 0 && (
            <section>
              <h2 className="text-2xl">Support This Cause</h2>
              <p className="text-muted text-sm mt-1">
                Choose what to sponsor — every item goes directly toward this campaign.
              </p>
              <div className="mt-5 grid sm:grid-cols-2 gap-4">
                {campaign.products.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    campaignId={campaign.id}
                    campaignSlug={campaign.slug}
                    campaignTitle={campaign.title}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Custom amount */}
          {campaign.allowCustomAmount && (
            <section>
              <h2 className="text-2xl">Or Give a Custom Amount</h2>
              <LinkButton
                href={`/donate/checkout?campaign=${campaign.slug}&custom=1`}
                variant="outline"
                className="mt-4"
              >
                Donate any amount to this campaign
              </LinkButton>
            </section>
          )}

          {/* Timeline */}
          {campaign.milestones.length > 0 && (
            <section>
              <h2 className="text-2xl">Timeline</h2>
              <ol className="mt-5 space-y-4">
                {campaign.milestones.map((m) => (
                  <li key={m.id} className="flex items-start gap-3">
                    {m.completed ? (
                      <CheckCircle2 size={20} className="text-success shrink-0 mt-0.5" />
                    ) : (
                      <Circle size={20} className="text-muted shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-medium text-maroon">{m.title}</p>
                      {m.value && (
                        <p className="text-sm text-muted">
                          {m.value} {m.unit}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* Updates */}
          {campaign.updates.length > 0 && (
            <section>
              <h2 className="text-2xl">Updates</h2>
              <div className="mt-5 space-y-6">
                {campaign.updates.map((u) => (
                  <div key={u.id} className="border-l-2 border-primary/40 pl-4">
                    <p className="text-xs text-muted">{u.publishedAt}</p>
                    <h3 className="text-lg font-semibold text-maroon mt-1">{u.title}</h3>
                    <p className="text-muted mt-1">{u.content}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* FAQs */}
          {campaign.faqs.length > 0 && (
            <section>
              <h2 className="text-2xl">FAQs</h2>
              <div className="mt-5 divide-y divide-border border border-border rounded-lg">
                {campaign.faqs.map((f) => (
                  <details key={f.id} className="p-4 group">
                    <summary className="cursor-pointer font-medium text-maroon list-none flex justify-between">
                      {f.question}
                      <span className="text-muted group-open:rotate-45 transition-transform">+</span>
                    </summary>
                    <p className="mt-2 text-sm text-muted">{f.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="p-6 rounded-lg border border-border bg-cream sticky top-24">
            <p className="text-sm text-muted">Status</p>
            <p className="font-semibold text-maroon capitalize">{campaign.status.toLowerCase()}</p>
            <LinkButton href={`/donate/checkout?campaign=${campaign.slug}`} className="w-full mt-5">
              Donate Now
            </LinkButton>
          </div>
        </aside>
      </div>

      {/* Related */}
      <section className="container-app mt-20">
        <h2 className="text-2xl mb-6">Related Campaigns</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {related.map((c) => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
        </div>
      </section>
    </div>
  );
}
