import Link from "next/link";
import { ArrowRight, Heart, MapPin } from "lucide-react";
import { PublicCampaign } from "@/lib/types";
import { LinkButton } from "@/components/ui/button";

import { getServerTranslator } from "@/lib/i18n-server";

export async function CampaignCard({ campaign }: { campaign: PublicCampaign }) {
  const { t } = await getServerTranslator();
  const canDonateCustom = campaign.allowCustomAmount && campaign.donationMode !== "PRODUCTS";
  const canDonateProducts = campaign.donationMode !== "GENERAL" && campaign.products.length > 0;
  const donateHref = canDonateCustom
    ? `/donate/checkout?campaign=${campaign.slug}&custom=1`
    : canDonateProducts
      ? `/campaigns/${campaign.slug}#support-this-cause`
      : `/campaigns/${campaign.slug}`;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
      <Link
        href={`/campaigns/${campaign.slug}`}
        aria-label={`${t("View campaign")}: ${campaign.title}`}
        className="relative block aspect-[4/3] overflow-hidden bg-cream"
      >
        {campaign.coverImage ? (
          <img src={campaign.coverImage} alt={campaign.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-maroon to-[#2d0000]" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 to-maroon/10" />
        <div className="absolute top-3 left-3 flex gap-2">
          {campaign.isUrgent && (
            <span className="text-[11px] font-semibold uppercase tracking-wide bg-red text-white px-2.5 py-1 rounded-full">
              {t("Urgent")}
            </span>
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-6">
        <span className="text-xs font-medium text-primary uppercase tracking-wide">
          {campaign.sevaArea?.name ?? campaign.category.name}
        </span>
        <h3 className="mt-2 text-xl leading-snug font-serif text-maroon transition-colors group-hover:text-primary">
          <Link href={`/campaigns/${campaign.slug}`} className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            {campaign.title}
          </Link>
        </h3>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted">{campaign.shortDescription}</p>
        {campaign.locationText && (
          <p className="mt-4 flex items-center gap-1.5 text-xs text-muted">
            <MapPin size={13} /> {campaign.locationText}
          </p>
        )}
        <div className="mt-auto pt-6">
          <LinkButton href={donateHref} size="md" className="w-full justify-between px-5">
            <span className="inline-flex items-center gap-2"><Heart size={16} aria-hidden="true" />{t("Donate Now")}</span>
            <ArrowRight size={16} aria-hidden="true" />
          </LinkButton>
        </div>
      </div>
    </article>
  );
}
