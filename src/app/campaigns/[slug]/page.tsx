import { notFound } from "next/navigation";
import { draftMode } from "next/headers";
import { MapPin, CheckCircle2, Circle } from "lucide-react";
import { db } from "@/lib/db";
import { toPublicCampaign } from "@/lib/view-models";
import { LinkButton } from "@/components/ui/button";
import { ProductCard } from "@/components/campaign/product-card";
import { CampaignCard } from "@/components/campaign/campaign-card";
import { ShareButtons } from "@/components/ui/share-buttons";
import { getServerTranslator } from "@/lib/i18n-server";

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const isDraftMode = (await draftMode()).isEnabled;
  const raw = await db.getPublicCampaignBySlug(slug, isDraftMode);
  if (!raw) notFound();
  const campaign = await toPublicCampaign(raw);

  const campaignsList = await db.listPublicCampaigns(campaign.sevaArea?.slug);
  const related = (await Promise.all(campaignsList.map(toPublicCampaign)))
    .filter((c: any) => c.id !== campaign.id)
    .slice(0, 3);
  const { t } = await getServerTranslator();

  return (
    <div className="pb-20">
      {/* Hero */}
      <section className="bg-background-alt">
        <div className="container-app py-12 grid md:grid-cols-[3fr_2fr] gap-10 items-start">
          {campaign.coverImage ? (
            <img src={campaign.coverImage} alt={campaign.title} className="aspect-[16/10] rounded-lg border border-border object-cover w-full" />
          ) : (
            <div className="aspect-[16/10] rounded-lg bg-gradient-to-br from-primary/20 to-maroon/10 border border-border" />
          )}
          <div>
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <span className="text-xs font-medium text-primary uppercase tracking-wide">
                {t(campaign.sevaArea?.name ?? campaign.category.name)}
              </span>
              <ShareButtons title={campaign.title} text={campaign.shortDescription} />
            </div>
            <h1 className="mt-2 text-3xl md:text-4xl leading-tight">{t(campaign.title)}</h1>
            {campaign.locationText && (
              <p className="mt-3 flex items-center gap-1.5 text-sm text-muted">
                <MapPin size={14} /> {t(campaign.locationText)}
              </p>
            )}
            <p className="mt-4 text-muted">{t(campaign.shortDescription)}</p>
            <div className="mt-6 flex gap-3">
              <LinkButton href={`/donate/checkout?campaign=${campaign.slug}`} size="lg">
                {t("Donate Now")}
              </LinkButton>
              <LinkButton href="/volunteer" variant="outline" size="lg">
                {t("Volunteer")}
              </LinkButton>
            </div>
          </div>
        </div>
      </section>

      <div className="container-app grid lg:grid-cols-[2fr_1fr] gap-14 mt-14">
        <div className="space-y-14">
          {/* Story */}
          <section>
            <h2 className="text-2xl">{t("The Story")}</h2>
            <p className="mt-3 text-text leading-relaxed">{t(campaign.story)}</p>
            {campaign.beneficiaryInfo && (
              <>
                <h3 className="mt-6 text-lg">{t("Who It Supports")}</h3>
                <p className="mt-2 text-muted">{t(campaign.beneficiaryInfo)}</p>
              </>
            )}
            {campaign.impactDescription && (
              <>
                <h3 className="mt-6 text-lg">{t("What We're Doing")}</h3>
                <p className="mt-2 text-muted">{t(campaign.impactDescription)}</p>
              </>
            )}
          </section>

          {/* Media Gallery */}
          {campaign.gallery.length > 0 && (
            <section>
              <h2 className="text-2xl">{t("Gallery & Media")}</h2>
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-4">
                {campaign.gallery.map((m, idx) => (
                  <div key={idx} className="aspect-square rounded-lg border border-border overflow-hidden bg-cream relative">
                    {m.type === "IMAGE" ? (
                      <img src={m.url} alt="Campaign Media" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4">
                        <span className="text-3xl mb-2">🎥</span>
                        <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-sm text-maroon hover:underline">{t("Watch Video")}</a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Products */}
          {campaign.products.length > 0 && (
            <section>
              <h2 className="text-2xl">{t("Support This Cause")}</h2>
              <p className="text-muted text-sm mt-1">
                {t("Choose what to sponsor — every item goes directly toward this campaign.")}
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
              <h2 className="text-2xl">{t("Or Give a Custom Amount")}</h2>
              <LinkButton
                href={`/donate/checkout?campaign=${campaign.slug}&custom=1`}
                variant="outline"
                className="mt-4"
              >
                {t("Donate any amount to this campaign")}
              </LinkButton>
            </section>
          )}

          {/* Timeline */}
          {campaign.milestones.length > 0 && (
            <section>
              <h2 className="text-2xl">{t("Timeline")}</h2>
              <ol className="mt-5 space-y-4">
                {campaign.milestones.map((m) => (
                  <li key={m.id} className="flex items-start gap-3">
                    {m.completed ? (
                      <CheckCircle2 size={20} className="text-success shrink-0 mt-0.5" />
                    ) : (
                      <Circle size={20} className="text-muted shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-medium text-maroon">{t(m.title)}</p>
                      {m.value && (
                        <p className="text-sm text-muted">
                          {m.value} {t(m.unit || "")}
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
              <h2 className="text-2xl">{t("Updates")}</h2>
              <div className="mt-5 space-y-6">
                {campaign.updates.map((u) => (
                  <div key={u.id} className="border-l-2 border-primary/40 pl-4">
                    <p className="text-xs text-muted">{u.publishedAt}</p>
                    <h3 className="text-lg font-semibold text-maroon mt-1">{t(u.title)}</h3>
                    <p className="text-muted mt-1">{t(u.content)}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* FAQs */}
          {campaign.faqs.length > 0 && (
            <section>
              <h2 className="text-2xl">{t("FAQs")}</h2>
              <div className="mt-5 divide-y divide-border border border-border rounded-lg">
                {campaign.faqs.map((f) => (
                  <details key={f.id} className="p-4 group">
                    <summary className="cursor-pointer font-medium text-maroon list-none flex justify-between">
                      {t(f.question)}
                      <span className="text-muted group-open:rotate-45 transition-transform">+</span>
                    </summary>
                    <p className="mt-2 text-sm text-muted">{t(f.answer)}</p>
                  </details>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="p-6 rounded-lg border border-border bg-cream sticky top-24">
            <p className="text-sm text-muted">{t("Status")}</p>
            <p className="font-semibold text-maroon capitalize">{t(campaign.status.toLowerCase())}</p>
            <LinkButton href={`/donate/checkout?campaign=${campaign.slug}`} className="w-full mt-5">
              {t("Donate Now")}
            </LinkButton>
          </div>
        </aside>
      </div>

      {/* Related */}
      <section className="container-app mt-20">
        <h2 className="text-2xl mb-6">{t("Related Campaigns")}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {related.map((c) => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
        </div>
      </section>
    </div>
  );
}
