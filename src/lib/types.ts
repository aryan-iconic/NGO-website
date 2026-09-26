// Public-facing types. Mirrors PublicCampaignDto from the API spec.
// Deliberately has NO fundTarget / amountRaised / fundingPercentage fields —
// that's enforced at the DTO layer on the real backend (see docs/database.md).

export type CampaignStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED" | "ARCHIVED";
export type DonationMode = "PRODUCTS" | "GENERAL" | "BOTH";

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
}

export interface CampaignProduct {
  id: string;
  name: string;
  description?: string | null;
  image?: string | null;
  unitName: string;
  pricePaise: number;
  available: boolean; // true unless fully sponsored — never exposes counts
}

export interface CampaignMilestone {
  id: string;
  title: string;
  value?: number | null;
  unit?: string | null;
  completed: boolean;
}

export interface CampaignFaq {
  id: string;
  question: string;
  answer: string;
}

export interface CampaignUpdate {
  id: string;
  title: string;
  content: string;
  publishedAt: string;
}

export interface SevaAreaType {
  id: string;
  name: string;
  hindiName?: string | null;
  slug: string;
  icon?: string | null;
}

export interface PublicCampaign {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  story: string;
  beneficiaryInfo?: string;
  impactDescription?: string;
  category: Category;
  sevaArea?: SevaAreaType;
  locationText?: string;
  coverImage: string;
  gallery: string[];
  status: CampaignStatus;
  isFeatured: boolean;
  isUrgent: boolean;
  donationMode: DonationMode;
  allowCustomAmount: boolean;
  minimumAmountPaise: number;
  suggestedAmountsPaise: number[];
  products: CampaignProduct[];
  milestones: CampaignMilestone[];
  faqs: CampaignFaq[];
  updates: CampaignUpdate[];
  updatedAt: string;
}

export function formatPaise(paise: number): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(rupees);
}
