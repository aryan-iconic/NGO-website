import Link from "next/link";
import { MapPin } from "lucide-react";
import { PublicCampaign } from "@/lib/types";

export function CampaignCard({ campaign }: { campaign: PublicCampaign }) {
  return (
    <Link
      href={`/campaigns/${campaign.slug}`}
      className="group block rounded-lg overflow-hidden bg-surface border border-border shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)] transition-shadow duration-300"
    >
      <div className="aspect-[4/3] bg-cream relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 to-maroon/10 group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-3 left-3 flex gap-2">
          {campaign.isUrgent && (
            <span className="text-[11px] font-semibold uppercase tracking-wide bg-red text-white px-2.5 py-1 rounded-full">
              Urgent
            </span>
          )}
        </div>
      </div>
      <div className="p-5">
        <span className="text-xs font-medium text-primary uppercase tracking-wide">
          {campaign.sevaArea?.name ?? campaign.category.name}
        </span>
        <h3 className="mt-1.5 text-lg leading-snug font-serif text-maroon group-hover:text-primary transition-colors">
          {campaign.title}
        </h3>
        <p className="mt-2 text-sm text-muted line-clamp-2">{campaign.shortDescription}</p>
        {campaign.locationText && (
          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted">
            <MapPin size={13} /> {campaign.locationText}
          </p>
        )}
      </div>
    </Link>
  );
}
