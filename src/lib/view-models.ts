import { db, Campaign } from "./db";
import { PublicCampaign } from "./types";

export async function toPublicCampaign(c: Campaign): Promise<PublicCampaign> {
  const category = await db.getCategory(c.categoryId ?? undefined);
  const sevaArea = await db.getSevaArea(c.sevaAreaId ?? undefined);
  const products = await db.getCampaignProducts(c.id);
  const milestones = await db.getCampaignMilestones(c.id);
  const faqs = await db.getCampaignFaqs(c.id);
  const updates = await db.getCampaignUpdates(c.id);

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
    gallery: [],
    status: c.status,
    isFeatured: c.isFeatured,
    isUrgent: c.isUrgent,
    donationMode: c.donationMode,
    allowCustomAmount: c.allowCustomAmount,
    minimumAmountPaise: c.minimumAmountPaise,
    suggestedAmountsPaise: c.suggestedAmountsPaise,
    products: products.map((p: any) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      unitName: p.unitName,
      pricePaise: p.pricePaise,
      available: p.quantityLimit ? p.quantitySponsored < p.quantityLimit : true,
    })),
    milestones: milestones.map((m: any) => ({
      id: m.id,
      title: m.title,
      value: m.value,
      unit: m.unit,
      completed: m.completed,
    })),
    faqs: faqs.map((f: any) => ({ id: f.id, question: f.question, answer: f.answer })),
    updates: updates.map((u: any) => ({
      id: u.id,
      title: u.title,
      content: u.content,
      publishedAt: u.publishedAt,
    })),
    updatedAt: c.updatedAt,
  };
}
