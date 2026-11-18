import { db, Campaign } from "./db";
import { PublicCampaign } from "./types";

export async function toPublicCampaign(c: Campaign): Promise<PublicCampaign> {
  const [category, sevaArea, products, milestones, faqs, updates, media] = await Promise.all([
    db.getCategory(c.categoryId ?? undefined),
    db.getSevaArea(c.sevaAreaId ?? undefined),
    db.getCampaignProducts(c.id),
    db.getCampaignMilestones(c.id),
    db.getCampaignFaqs(c.id),
    db.getCampaignUpdates(c.id),
    db.getCampaignMedia(c.id),
  ]);

  return {
    id: c.id,
    title: c.title,
    slug: c.slug,
    shortDescription: c.shortDescription,
    story: c.story,
    beneficiaryInfo: c.beneficiaryInfo,
    impactDescription: c.impactDescription,
    category: category
      ? { id: category.id, name: category.name, slug: category.slug, icon: category.icon }
      : { id: "none", name: "General", slug: "general" },
    sevaArea: sevaArea
      ? { id: sevaArea.id, name: sevaArea.name, hindiName: sevaArea.hindiName, slug: sevaArea.slug, icon: sevaArea.icon }
      : undefined,
    locationText: c.locationText,
    coverImage: c.coverImage ?? "",
    gallery: media.map((m: { type: string; url: string; altText: string | null }) => ({ type: m.type, url: m.url, altText: m.altText })),
    status: c.status,
    isFeatured: c.isFeatured,
    isUrgent: c.isUrgent,
    donationMode: c.donationMode,
    allowCustomAmount: c.allowCustomAmount,
    minimumAmountPaise: c.minimumAmountPaise,
    suggestedAmountsPaise: c.suggestedAmountsPaise,
    products: products.map((p: { id: string; name: string; description: string | null; unitName: string; pricePaise: number; quantityLimit: number | null; quantitySponsored: number }) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      unitName: p.unitName,
      pricePaise: p.pricePaise,
      available: p.quantityLimit ? p.quantitySponsored < p.quantityLimit : true,
    })),
    milestones: milestones.map((m: { id: string; title: string; value: number | null; unit: string | null; completed: boolean }) => ({
      id: m.id,
      title: m.title,
      value: m.value,
      unit: m.unit,
      completed: m.completed,
    })),
    faqs: faqs.map((f: { id: string; question: string; answer: string }) => ({ id: f.id, question: f.question, answer: f.answer })),
    updates: updates.map((u: { id: string; title: string; content: string; publishedAt: Date | string }) => ({
      id: u.id,
      title: u.title,
      content: u.content,
      publishedAt: u.publishedAt,
    })),
    updatedAt: c.updatedAt,
  };
}
