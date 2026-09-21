import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";

// ---------------------------------------------------------------------------
// A real, working data layer for this environment: in-memory, persisted to a
// JSON file on disk so data survives dev-server restarts. Every shape here
// mirrors prisma/schema.prisma exactly. In production, swap the functions
// below for `prisma.<model>.*` calls against real Postgres — call sites
// (API routes / server components) don't need to change, only this file.
// ---------------------------------------------------------------------------

export type Role = "USER";
export type AdminRole = "SUPER_ADMIN" | "ADMIN" | "CONTENT_ADMIN" | "FINANCE_ADMIN";
export type CampaignStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED" | "ARCHIVED";
export type DonationMode = "PRODUCTS" | "GENERAL" | "BOTH";
export type DonationStatus = "CREATED" | "PENDING_PAYMENT" | "SUCCESS" | "FAILED" | "REFUNDED";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  createdAt: string;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: AdminRole;
  createdAt: string;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string; // confirmed secret, only present once enabled
  twoFactorPendingSecret?: string; // set during setup, before the admin confirms a code
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

export interface SevaArea {
  id: string;
  name: string;
  hindiName?: string;
  slug: string;
  description?: string;
  icon?: string;
  coverImage?: string;
  objectives?: string;
  published: boolean;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignProduct {
  id: string;
  campaignId: string;
  name: string;
  description?: string;
  unitName: string;
  pricePaise: number;
  quantityLimit?: number;
  quantitySponsored: number;
  isActive: boolean;
}

export interface CampaignMilestone {
  id: string;
  campaignId: string;
  title: string;
  value?: number;
  unit?: string;
  completed: boolean;
}

export interface CampaignFaq {
  id: string;
  campaignId: string;
  question: string;
  answer: string;
}

export interface CampaignUpdate {
  id: string;
  campaignId: string;
  title: string;
  content: string;
  publishedAt: string;
}

export interface CampaignFinancials {
  campaignId: string;
  internalTargetPaise: number | null;
  internalBudgetPaise: number | null;
  notes: string | null;
}

export interface Campaign {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  story: string;
  beneficiaryInfo?: string;
  impactDescription?: string;
  categoryId?: string;
  sevaAreaId?: string;
  locationText?: string;
  coverImage?: string;
  status: CampaignStatus;
  isFeatured: boolean;
  isUrgent: boolean;
  donationMode: DonationMode;
  allowCustomAmount: boolean;
  minimumAmountPaise: number;
  suggestedAmountsPaise: number[];
  taxBenefitEnabled?: boolean;
  createdByAdminId?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface DonationItem {
  productId?: string;
  productNameSnapshot: string;
  unitPriceSnapshotPaise: number;
  quantity: number;
  totalPaise: number;
}

export interface Donation {
  id: string;
  donationNumber: string;
  userId?: string;
  campaignId?: string;
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  items: DonationItem[];
  totalPaise: number;
  status: DonationStatus;
  isAnonymous: boolean;
  paymentMethod?: string;
  paymentReference?: string;
  createdAt: string;
}

export interface Receipt {
  id: string;
  receiptNumber: string;
  donationId: string;
  generatedAt: string;
}

export interface VolunteerApplication {
  id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  interests: string[];
  availability?: string;
  message?: string;
  status: string;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status: string;
  createdAt: string;
}

export interface EventItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  eventDate: string;
  venue?: string;
  location?: string;
  registrationEnabled: boolean;
  status: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  name: string;
  email: string;
  phone?: string;
  registeredAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author?: string;
  status: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export type RecurringFrequency = "MONTHLY";
export type RecurringStatus = "ACTIVE" | "PAUSED" | "CANCELLED";

export interface RecurringDonation {
  id: string;
  userId?: string;
  donorName: string;
  donorEmail: string;
  campaignId?: string;
  amountPaise: number;
  frequency: RecurringFrequency;
  gatewaySubscriptionId: string;
  status: RecurringStatus;
  nextChargeAt: string;
  startedAt: string;
  cancelledAt?: string;
}

interface DB {
  users: User[];
  admins: Admin[];
  categories: Category[];
  sevaAreas: SevaArea[];
  campaigns: Campaign[];
  campaignFinancials: CampaignFinancials[];
  campaignProducts: CampaignProduct[];
  campaignMilestones: CampaignMilestone[];
  campaignFaqs: CampaignFaq[];
  campaignUpdates: CampaignUpdate[];
  donations: Donation[];
  receipts: Receipt[];
  volunteerApplications: VolunteerApplication[];
  contactMessages: ContactMessage[];
  events: EventItem[];
  eventRegistrations: EventRegistration[];
  blogPosts: BlogPost[];
  faqs: Faq[];
  auditLogs: AuditLogEntry[];
  recurringDonations: RecurringDonation[];
}

export interface AuditLogEntry {
  id: string;
  actorType: "ADMIN";
  actorId: string;
  actorName: string;
  action: string;
  entity: string;
  entityId: string;
  createdAt: string;
}

const DATA_FILE = path.join(process.cwd(), ".data", "db.json");

function loadFromDisk(): DB | null {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
      // Defensive defaults for fields added after a file may have been written.
      parsed.recurringDonations ??= [];
      parsed.auditLogs ??= [];
      parsed.sevaAreas ??= [];
      for (const a of parsed.admins ?? []) a.twoFactorEnabled ??= false;
      return parsed;
    }
  } catch {
    // fall through to seed
  }
  return null;
}

function persist() {
  try {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
  } catch {
    // best-effort in serverless/readonly environments
  }
}

function seed(): DB {
  const now = new Date().toISOString();
  const categories: Category[] = [
    { id: "c1", name: "Annadaan", slug: "annadaan", icon: "UtensilsCrossed" },
    { id: "c2", name: "Education", slug: "education", icon: "GraduationCap" },
    { id: "c3", name: "Healthcare", slug: "healthcare", icon: "HeartPulse" },
    { id: "c4", name: "Community Welfare", slug: "community-welfare", icon: "Users" },
    { id: "c5", name: "Emergency Relief", slug: "emergency-relief", icon: "LifeBuoy" },
    { id: "c6", name: "Spiritual & Cultural", slug: "spiritual-cultural", icon: "Flame" },
  ];

  const sevaAreas: SevaArea[] = [
    {
      id: "sa_1",
      name: "Education & Skill Development",
      hindiName: "शिक्षा एवं कौशल विकास",
      slug: "education-skill-development",
      description: "Supporting schools, colleges, technical institutions, vocational training, and free education for the underprivileged.",
      objectives: "Schools, colleges, technical institutions, vocational training centres, libraries, coaching centres, Sanskrit educational institutions, hostels, educational support for poor, orphaned and needy children, scholarships, books, uniforms, hostel facilities, support for meritorious students, vocational training for self-reliance.",
      published: true,
      sortOrder: 1,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "sa_2",
      name: "Healthcare & Medical Services",
      hindiName: "चिकित्सा एवं स्वास्थ्य सेवाएं",
      slug: "healthcare-medical-services",
      description: "Providing free or affordable medical services, health camps, and support for the disabled and elderly.",
      objectives: "Hospitals, clinics, dispensaries, diagnostic centres, free/affordable medical services, medical camps, blood donation camps, medicine distribution, health-awareness campaigns, assistance to persons with disabilities, assistance to elderly people, assistance to poor and helpless people, ambulance services, medical equipment, accessibility equipment such as wheelchairs.",
      published: true,
      sortOrder: 2,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "sa_3",
      name: "Poverty Alleviation & Humanitarian Support",
      hindiName: "गरीब कल्याण एवं मानवीय सहायता",
      slug: "poverty-humanitarian-support",
      description: "Providing food, clothing, shelter, and support to the economically disadvantaged.",
      objectives: "Food, clothing, shelter, support for economically disadvantaged people, support for vulnerable communities, old-age homes / shelters, orphanage-related support, assistance for poor marriages, educational support, humanitarian assistance.",
      published: true,
      sortOrder: 3,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "sa_4",
      name: "Women & Child Welfare",
      hindiName: "महिला एवं बाल कल्याण",
      slug: "women-child-welfare",
      description: "Empowering women and supporting child welfare, education, and social awareness.",
      objectives: "Women empowerment, child welfare, support for disadvantaged children, education, social welfare, awareness against harmful social practices, efforts related to substance-abuse prevention where appropriate.",
      published: true,
      sortOrder: 4,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "sa_5",
      name: "Livelihood & Self-Reliance",
      hindiName: "रोजगार एवं आत्मनिर्भरता",
      slug: "livelihood-self-reliance",
      description: "Offering vocational and employment-oriented training for self-reliance.",
      objectives: "Vocational training, tailoring, computer courses, employment-oriented training, training for unemployed people, training and empowerment of women.",
      published: true,
      sortOrder: 5,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "sa_6",
      name: "Disaster Relief & Humanitarian Response",
      hindiName: "आपदा राहत एवं सहायता",
      slug: "disaster-relief",
      description: "Assisting communities during natural disasters and emergencies with relief and support.",
      objectives: "Floods, droughts, earthquakes, epidemics/pandemics, relief materials, financial assistance, humanitarian support.",
      published: true,
      sortOrder: 6,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "sa_7",
      name: "Religious & Cultural Service",
      hindiName: "धार्मिक एवं सांस्कृतिक सेवा",
      slug: "religious-cultural-service",
      description: "Promoting Indian culture, Sanskrit, yoga, traditional knowledge, and preserving religious places.",
      objectives: "Construction and maintenance of temples, ashrams, dharamshalas, other religious places, management of religious facilities, Ganga and river cleanliness initiatives, Indian culture, Sanskrit, yoga, traditional knowledge, study and learning, music, arts, cultural camps, religious awareness, promotion and propagation of Sanatan Hindu Dharma, religious festivals, cultural events, discourses, programs involving scholars and speakers.",
      published: true,
      sortOrder: 7,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "sa_8",
      name: "Environment & River Conservation",
      hindiName: "पर्यावरण एवं नदी संरक्षण",
      slug: "environment-river-conservation",
      description: "Fostering environmental awareness, tree plantation, water conservation, and river cleanliness.",
      objectives: "Tree plantation, water conservation, pollution-control awareness, environmental awareness, Ganga cleanliness, cleanliness of rivers.",
      published: true,
      sortOrder: 8,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "sa_9",
      name: "Gau Seva & Animal Welfare",
      hindiName: "गौ सेवा एवं पशु कल्याण",
      slug: "gau-seva-animal-welfare",
      description: "Supporting animal care, veterinary services, and gaushalas for sick and abandoned cows.",
      objectives: "Construction and operation of gaushalas, care of sick cows, care of abandoned cows, fodder, animal care, veterinary facilities, veterinary clinic.",
      published: true,
      sortOrder: 9,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    }
  ];

  const campaigns: Campaign[] = [
    {
      id: "cmp_1",
      title: "Annadaan for Flood-Affected Families",
      slug: "annadaan-flood-affected-families",
      shortDescription:
        "Warm meals and ration kits for families displaced by seasonal flooding in rural Jharkhand.",
      story:
        "Each monsoon, dozens of low-lying villages face displacement. This seva initiative provides cooked meals at relief camps and dry-ration kits families can carry home once waters recede.",
      beneficiaryInfo: "Displaced families sheltering in community relief camps across three blocks.",
      impactDescription: "Meals are prepared fresh each day by volunteers and distributed at two camp kitchens.",
      categoryId: "c1",
      locationText: "Ranchi district, Jharkhand",
      status: "ACTIVE",
      isFeatured: true,
      isUrgent: true,
      donationMode: "BOTH",
      allowCustomAmount: true,
      minimumAmountPaise: 10100,
      suggestedAmountsPaise: [10100, 50100, 100100, 250100],
      taxBenefitEnabled: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "cmp_2",
      title: "School Kits for First-Generation Learners",
      slug: "school-kits-first-generation-learners",
      shortDescription: "Notebooks, uniforms and basic supplies for children whose families cannot afford them.",
      story:
        "Many children in nearby tribal hamlets are the first in their family to attend school. A missing notebook or uniform is often enough to keep them home. This campaign equips them for the full academic year.",
      beneficiaryInfo: "Children in grades 1–8 across four government schools.",
      categoryId: "c2",
      locationText: "Khunti district, Jharkhand",
      status: "ACTIVE",
      isFeatured: true,
      isUrgent: false,
      donationMode: "PRODUCTS",
      allowCustomAmount: false,
      minimumAmountPaise: 30000,
      suggestedAmountsPaise: [],
      taxBenefitEnabled: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "cmp_3",
      title: "Restoration of the Nityanikunj Sanctuary",
      slug: "restoration-nityanikunj-sanctuary",
      shortDescription: "Structural repair and preservation of a century-old place of worship and community gathering.",
      story:
        "The sanctuary at the heart of Nityanikunj has served the community for generations. Years of monsoon damage have weakened its structure. This campaign funds a careful, heritage-conscious restoration.",
      categoryId: "c6",
      locationText: "Ranchi, Jharkhand",
      status: "ACTIVE",
      isFeatured: false,
      isUrgent: false,
      donationMode: "BOTH",
      allowCustomAmount: true,
      minimumAmountPaise: 10100,
      suggestedAmountsPaise: [10100, 50100, 100100],
      taxBenefitEnabled: true,
      createdAt: now,
      updatedAt: now,
    },
  ];

  const campaignFinancials: CampaignFinancials[] = campaigns.map((c) => ({
    campaignId: c.id,
    internalTargetPaise: 100000000,
    internalBudgetPaise: 80000000,
    notes: null,
  }));

  const campaignProducts: CampaignProduct[] = [
    { id: "p1", campaignId: "cmp_1", name: "Ration Kit", description: "Rice, dal, oil and essentials for a family for a week", unitName: "kit", pricePaise: 70000, quantitySponsored: 0, isActive: true },
    { id: "p2", campaignId: "cmp_1", name: "Cooked Meal", description: "One hot meal served at a relief camp", unitName: "meal", pricePaise: 4000, quantitySponsored: 0, isActive: true },
    { id: "p3", campaignId: "cmp_1", name: "Drinking Water Kit", description: "Purification tablets and storage cans", unitName: "kit", pricePaise: 35000, quantitySponsored: 0, isActive: true },
    { id: "p4", campaignId: "cmp_2", name: "School Kit", description: "Notebooks, stationery and a school bag", unitName: "kit", pricePaise: 60000, quantitySponsored: 0, isActive: true },
    { id: "p5", campaignId: "cmp_2", name: "Uniform Set", description: "Two sets of school uniform", unitName: "set", pricePaise: 45000, quantitySponsored: 0, isActive: true },
    { id: "p6", campaignId: "cmp_3", name: "Building Material Kit", description: "Bricks, cement and materials for one section", unitName: "kit", pricePaise: 85100, quantityLimit: 500, quantitySponsored: 0, isActive: true },
  ];

  const campaignMilestones: CampaignMilestone[] = [
    { id: "m1", campaignId: "cmp_1", title: "Camp kitchens set up", value: 2, unit: "kitchens", completed: true },
    { id: "m2", campaignId: "cmp_1", title: "Ration kits distributed", value: 180, unit: "kits", completed: true },
    { id: "m3", campaignId: "cmp_1", title: "Second phase distribution", completed: false },
    { id: "m4", campaignId: "cmp_2", title: "Schools onboarded", value: 4, unit: "schools", completed: true },
    { id: "m5", campaignId: "cmp_3", title: "Structural survey completed", completed: true },
    { id: "m6", campaignId: "cmp_3", title: "Phase 1 restoration", completed: false },
  ];

  const campaignFaqs: CampaignFaq[] = [
    { id: "f1", campaignId: "cmp_1", question: "Where does my contribution go?", answer: "Directly toward ingredients, cooking fuel and ration materials for this relief effort." },
    { id: "f2", campaignId: "cmp_1", question: "Will I get a donation receipt?", answer: "Yes — a receipt is generated automatically and emailed after every successful contribution." },
    { id: "f3", campaignId: "cmp_2", question: "How are recipients chosen?", answer: "School teachers identify students most in need in coordination with our field volunteers." },
  ];

  const campaignUpdates: CampaignUpdate[] = [
    { id: "u1", campaignId: "cmp_1", title: "Second camp kitchen now serving meals", content: "We've opened a second kitchen closer to the northern relief camps to reduce travel time for volunteers and beneficiaries.", publishedAt: "2026-09-10" },
  ];

  const events: EventItem[] = [
    {
      id: "e1",
      title: "Winter Clothing Distribution Drive",
      slug: "winter-clothing-distribution-drive",
      description: "A day of distributing blankets and warm clothing at three community centres. Volunteers welcome.",
      eventDate: "2026-11-15",
      venue: "Community Hall",
      location: "Ranchi",
      registrationEnabled: true,
      status: "PUBLISHED",
    },
    {
      id: "e2",
      title: "Annual Seva Sammelan",
      slug: "annual-seva-sammelan",
      description: "A gathering of volunteers, donors and beneficiaries to reflect on the year's work and plan ahead.",
      eventDate: "2026-12-20",
      venue: "Nityanikunj Sanctuary Grounds",
      location: "Ranchi",
      registrationEnabled: true,
      status: "PUBLISHED",
    },
  ];

  const blogPosts: BlogPost[] = [
    {
      id: "b1",
      title: "Inside the Camp Kitchens: A Day of Annadaan",
      slug: "inside-the-camp-kitchens",
      excerpt: "A look at how volunteers coordinate to serve hundreds of meals a day during flood relief.",
      content:
        "Every morning before sunrise, a small team gathers at the camp kitchen to begin preparing the day's meals. What follows is a carefully choreographed routine built on years of experience serving communities in crisis...",
      author: "Trust Communications",
      status: "PUBLISHED",
      publishedAt: "2026-09-08",
      createdAt: "2026-09-08",
      updatedAt: "2026-09-08",
    },
    {
      id: "b2",
      title: "Why We Don't Show a Fundraising Scoreboard",
      slug: "why-we-dont-show-a-fundraising-scoreboard",
      excerpt: "A short note on why our campaign pages focus on impact rather than money raised.",
      content:
        "We made a deliberate choice not to display fundraising targets or amounts raised on our campaign pages. Here's the thinking behind that decision, and what we show instead...",
      author: "Trust Communications",
      status: "PUBLISHED",
      publishedAt: "2026-08-20",
      createdAt: "2026-08-20",
      updatedAt: "2026-08-20",
    },
  ];

  const faqs: Faq[] = [
    { id: "gf1", question: "How can I donate?", answer: "Choose a campaign or the general fund, pick an amount or products, and complete checkout — guest checkout is supported.", category: "Donating" },
    { id: "gf2", question: "Will I receive a receipt?", answer: "Yes, every successful donation generates an immutable receipt, downloadable from your dashboard.", category: "Donating" },
    { id: "gf3", question: "Can I volunteer without donating?", answer: "Absolutely — visit the Volunteer page to apply; donating is not required.", category: "Volunteering" },
    { id: "gf4", question: "Can normal users create campaigns?", answer: "No — only Trust administrators can create or publish campaigns.", category: "Platform" },
  ];

  return {
    users: [],
    admins: [
      {
        id: "admin_1",
        name: "Trust Administrator",
        email: "admin@nityanikunj.org",
        passwordHash: bcrypt.hashSync("Admin@12345", 10),
        role: "SUPER_ADMIN",
        createdAt: now,
        twoFactorEnabled: false,
      },
    ],
    categories,
    sevaAreas,
    campaigns,
    campaignFinancials,
    campaignProducts,
    campaignMilestones,
    campaignFaqs,
    campaignUpdates,
    donations: [],
    receipts: [],
    volunteerApplications: [],
    contactMessages: [],
    events,
    eventRegistrations: [],
    blogPosts,
    faqs,
    auditLogs: [],
    recurringDonations: [],
  };
}

const store: DB = loadFromDisk() ?? seed();
if (!loadFromDisk()) persist();

// ---------------------------------------------------------------------------
// Query helpers
// ---------------------------------------------------------------------------

export const db = {
  // Categories & Seva Areas
  listCategories: () => store.categories,
  listSevaAreas: () => store.sevaAreas.sort((a, b) => a.sortOrder - b.sortOrder), // return all for admin
  getSevaArea: (id?: string) => store.sevaAreas.find((s) => s.id === id),
  getSevaAreaBySlug: (slug: string) => store.sevaAreas.find((s) => s.slug === slug),
  createSevaArea: (data: Partial<SevaArea>) => {
    const s: SevaArea = {
      id: `sa_${Date.now()}`,
      name: data.name ?? "New Seva Area",
      hindiName: data.hindiName,
      slug: data.slug ?? `sa-${Date.now()}`,
      description: data.description,
      icon: data.icon,
      coverImage: data.coverImage,
      objectives: data.objectives,
      published: data.published ?? false,
      sortOrder: data.sortOrder ?? 0,
      isActive: data.isActive ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.sevaAreas.push(s);
    persist();
    return s;
  },
  updateSevaArea: (id: string, data: Partial<SevaArea>) => {
    const i = store.sevaAreas.findIndex((s) => s.id === id);
    if (i > -1) {
      store.sevaAreas[i] = { ...store.sevaAreas[i], ...data, updatedAt: new Date().toISOString() };
      persist();
      return store.sevaAreas[i];
    }
    return null;
  },
  deleteSevaArea: (id: string) => {
    store.sevaAreas = store.sevaAreas.filter((s) => s.id !== id);
    persist();
  },

  // Campaigns (public — status ACTIVE, not soft-deleted)
  listPublicCampaigns: (categorySlug?: string) => {
    let items = store.campaigns.filter((c) => c.status === "ACTIVE" && !c.deletedAt);
    if (categorySlug) {
      const cat = store.categories.find((c) => c.slug === categorySlug);
      const sa = store.sevaAreas.find((s) => s.slug === categorySlug);
      items = items.filter((c) => (cat && c.categoryId === cat.id) || (sa && c.sevaAreaId === sa.id));
    }
    return items;
  },
  getPublicCampaignBySlug: (slug: string) =>
    store.campaigns.find((c) => c.slug === slug && c.status === "ACTIVE" && !c.deletedAt),
  getCampaignProducts: (campaignId: string) =>
    store.campaignProducts.filter((p) => p.campaignId === campaignId && p.isActive),
  getCampaignMilestones: (campaignId: string) =>
    store.campaignMilestones.filter((m) => m.campaignId === campaignId),
  getCampaignFaqs: (campaignId: string) =>
    store.campaignFaqs.filter((f) => f.campaignId === campaignId),
  getCampaignUpdates: (campaignId: string) =>
    store.campaignUpdates.filter((u) => u.campaignId === campaignId),
  getCategory: (id?: string) => store.categories.find((c) => c.id === id),

  // Admin campaign management
  listAllCampaigns: () => store.campaigns,
  getCampaignById: (id: string) => store.campaigns.find((c) => c.id === id),
  createCampaign: (
    input: Omit<Campaign, "id" | "createdAt" | "updatedAt" | "status"> & { status?: CampaignStatus }
  ) => {
    const now = new Date().toISOString();
    const campaign: Campaign = {
      ...input,
      id: randomUUID(),
      status: input.status ?? "DRAFT",
      createdAt: now,
      updatedAt: now,
    };
    store.campaigns.push(campaign);
    store.campaignFinancials.push({
      campaignId: campaign.id,
      internalTargetPaise: null,
      internalBudgetPaise: null,
      notes: null,
    });
    persist();
    return campaign;
  },
  updateCampaign: (id: string, patch: Partial<Campaign>) => {
    const c = store.campaigns.find((x) => x.id === id);
    if (!c) return null;
    Object.assign(c, patch, { updatedAt: new Date().toISOString() });
    persist();
    return c;
  },
  getCampaignFinancials: (campaignId: string) =>
    store.campaignFinancials.find((f) => f.campaignId === campaignId),

  // Users / Admins (auth)
  findUserByEmail: (email: string) => store.users.find((u) => u.email.toLowerCase() === email.toLowerCase()),
  findUserById: (id: string) => store.users.find((u) => u.id === id),
  createUser: (name: string, email: string, phone: string | undefined, password: string) => {
    const user: User = {
      id: randomUUID(),
      name,
      email,
      phone,
      passwordHash: bcrypt.hashSync(password, 10),
      createdAt: new Date().toISOString(),
    };
    store.users.push(user);
    persist();
    return user;
  },
  verifyUserPassword: (email: string, password: string) => {
    const user = store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return null;
    return bcrypt.compareSync(password, user.passwordHash) ? user : null;
  },
  findAdminByEmail: (email: string) => store.admins.find((a) => a.email.toLowerCase() === email.toLowerCase()),
  findAdminById: (id: string) => store.admins.find((a) => a.id === id),
  verifyAdminPassword: (email: string, password: string) => {
    const admin = store.admins.find((a) => a.email.toLowerCase() === email.toLowerCase());
    if (!admin) return null;
    return bcrypt.compareSync(password, admin.passwordHash) ? admin : null;
  },

  // Donations
  createDonation: (input: {
    userId?: string;
    campaignId?: string;
    donorName: string;
    donorEmail: string;
    donorPhone?: string;
    items: DonationItem[];
    totalPaise: number;
    isAnonymous: boolean;
  }) => {
    const year = new Date().getFullYear();
    const seq = store.donations.length + 1;
    const donation: Donation = {
      id: randomUUID(),
      donationNumber: `DN-${year}-${String(seq).padStart(6, "0")}`,
      ...input,
      status: "SUCCESS", // mock gateway settles immediately — see /api/donations
      paymentMethod: "MOCK_GATEWAY",
      createdAt: new Date().toISOString(),
    };
    store.donations.push(donation);

    // reserve -> sponsored, atomically enough for single-process demo use
    for (const item of donation.items) {
      if (!item.productId) continue;
      const product = store.campaignProducts.find((p) => p.id === item.productId);
      if (product) product.quantitySponsored += item.quantity;
    }

    const receiptSeq = store.receipts.length + 1;
    const receipt: Receipt = {
      id: randomUUID(),
      receiptNumber: `SNT/${year}-${String(year + 1).slice(2)}/${String(receiptSeq).padStart(6, "0")}`,
      donationId: donation.id,
      generatedAt: new Date().toISOString(),
    };
    store.receipts.push(receipt);

    persist();
    return { donation, receipt };
  },
  listDonationsForUser: (userId: string) =>
    store.donations.filter((d) => d.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  listDonationsForEmail: (email: string) =>
    store.donations
      .filter((d) => d.donorEmail.toLowerCase() === email.toLowerCase())
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  listAllDonations: () => [...store.donations].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  getDonationById: (id: string) => store.donations.find((d) => d.id === id),
  getReceiptForDonation: (donationId: string) => store.receipts.find((r) => r.donationId === donationId),
  markDonationCompleted: (donationId: string, paymentReference: string) => {
    const i = store.donations.findIndex((d) => d.id === donationId);
    if (i > -1 && store.donations[i].status !== "SUCCESS") {
      store.donations[i] = {
        ...store.donations[i],
        status: "SUCCESS",
        paymentReference,
      };
      
      const receipt = {
        id: `r_${Date.now()}`,
        donationId: store.donations[i].id,
        receiptNumber: `RCPT-${Math.floor(Math.random() * 1000000)}`,
        generatedAt: new Date().toISOString(),
      };
      store.receipts.push(receipt);
      persist();
      return true;
    }
    return false;
  },
  getDonationReceipt: (donationId: string) =>
    store.receipts.find((r) => r.donationId === donationId),

  // Volunteers
  createVolunteerApplication: (input: Omit<VolunteerApplication, "id" | "status" | "createdAt">) => {
    const app: VolunteerApplication = {
      ...input,
      id: randomUUID(),
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };
    store.volunteerApplications.push(app);
    persist();
    return app;
  },
  listVolunteerApplications: () =>
    [...store.volunteerApplications].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),

  // Contact
  createContactMessage: (input: Omit<ContactMessage, "id" | "status" | "createdAt">) => {
    const msg: ContactMessage = {
      ...input,
      id: randomUUID(),
      status: "NEW",
      createdAt: new Date().toISOString(),
    };
    store.contactMessages.push(msg);
    persist();
    return msg;
  },
  listContactMessages: () => [...store.contactMessages].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),

  // Events
  listPublishedEvents: () => store.events.filter((e) => e.status === "PUBLISHED"),
  getEventBySlug: (slug: string) => store.events.find((e) => e.slug === slug),
  registerForEvent: (eventId: string, name: string, email: string, phone?: string) => {
    const exists = store.eventRegistrations.find((r) => r.eventId === eventId && r.email.toLowerCase() === email.toLowerCase());
    if (exists) return { alreadyRegistered: true, registration: exists };
    const reg: EventRegistration = {
      id: randomUUID(),
      eventId,
      name,
      email,
      phone,
      registeredAt: new Date().toISOString(),
    };
    store.eventRegistrations.push(reg);
    persist();
    return { alreadyRegistered: false, registration: reg };
  },

  // Blog — public reads
  listPublishedPosts: () => store.blogPosts.filter((p) => p.status === "PUBLISHED"),
  getPostBySlug: (slug: string) => store.blogPosts.find((p) => p.slug === slug),

  // Blog — admin CRUD
  listAllPosts: () => [...store.blogPosts].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  getPostById: (id: string) => store.blogPosts.find((p) => p.id === id),
  createPost: (input: Omit<BlogPost, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString();
    const post: BlogPost = { ...input, id: randomUUID(), createdAt: now, updatedAt: now };
    store.blogPosts.push(post);
    persist();
    return post;
  },
  updatePost: (id: string, patch: Partial<BlogPost>) => {
    const p = store.blogPosts.find((x) => x.id === id);
    if (!p) return null;
    Object.assign(p, patch, { updatedAt: new Date().toISOString() });
    persist();
    return p;
  },
  deletePost: (id: string) => {
    const idx = store.blogPosts.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    store.blogPosts.splice(idx, 1);
    persist();
    return true;
  },

  // Events — admin CRUD (listPublishedEvents/getEventBySlug already exist above)
  listAllEvents: () => [...store.events].sort((a, b) => b.eventDate.localeCompare(a.eventDate)),
  getEventById: (id: string) => store.events.find((e) => e.id === id),
  createEvent: (input: Omit<EventItem, "id">) => {
    const event: EventItem = { ...input, id: randomUUID() };
    store.events.push(event);
    persist();
    return event;
  },
  updateEvent: (id: string, patch: Partial<EventItem>) => {
    const e = store.events.find((x) => x.id === id);
    if (!e) return null;
    Object.assign(e, patch);
    persist();
    return e;
  },
  deleteEvent: (id: string) => {
    const idx = store.events.findIndex((e) => e.id === id);
    if (idx === -1) return false;
    store.events.splice(idx, 1);
    persist();
    return true;
  },

  // FAQs
  listFaqs: () => store.faqs,
  getFaqById: (id: string) => store.faqs.find((f) => f.id === id),
  createFaq: (input: Omit<Faq, "id">) => {
    const faq: Faq = { ...input, id: randomUUID() };
    store.faqs.push(faq);
    persist();
    return faq;
  },
  updateFaq: (id: string, patch: Partial<Faq>) => {
    const f = store.faqs.find((x) => x.id === id);
    if (!f) return null;
    Object.assign(f, patch);
    persist();
    return f;
  },
  deleteFaq: (id: string) => {
    const idx = store.faqs.findIndex((f) => f.id === id);
    if (idx === -1) return false;
    store.faqs.splice(idx, 1);
    persist();
    return true;
  },

  // Audit log — append-only
  logAudit: (entry: Omit<AuditLogEntry, "id" | "createdAt">) => {
    store.auditLogs.push({ ...entry, id: randomUUID(), createdAt: new Date().toISOString() });
    persist();
  },
  listAuditLogs: () => [...store.auditLogs].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),

  // Admin 2FA
  setTwoFactorPendingSecret: (adminId: string, secret: string) => {
    const admin = store.admins.find((a) => a.id === adminId);
    if (!admin) return null;
    admin.twoFactorPendingSecret = secret;
    persist();
    return admin;
  },
  confirmTwoFactor: (adminId: string) => {
    const admin = store.admins.find((a) => a.id === adminId);
    if (!admin || !admin.twoFactorPendingSecret) return null;
    admin.twoFactorSecret = admin.twoFactorPendingSecret;
    admin.twoFactorPendingSecret = undefined;
    admin.twoFactorEnabled = true;
    persist();
    return admin;
  },
  disableTwoFactor: (adminId: string) => {
    const admin = store.admins.find((a) => a.id === adminId);
    if (!admin) return null;
    admin.twoFactorEnabled = false;
    admin.twoFactorSecret = undefined;
    admin.twoFactorPendingSecret = undefined;
    persist();
    return admin;
  },

  // Recurring donations (monthly giving)
  createRecurringDonation: (input: {
    userId?: string;
    donorName: string;
    donorEmail: string;
    campaignId?: string;
    amountPaise: number;
  }) => {
    const now = new Date();
    const next = new Date(now);
    next.setMonth(next.getMonth() + 1);
    const recurring: RecurringDonation = {
      id: randomUUID(),
      userId: input.userId,
      donorName: input.donorName,
      donorEmail: input.donorEmail,
      campaignId: input.campaignId,
      amountPaise: input.amountPaise,
      frequency: "MONTHLY",
      gatewaySubscriptionId: `mock_sub_${randomUUID().slice(0, 8)}`,
      status: "ACTIVE",
      nextChargeAt: next.toISOString(),
      startedAt: now.toISOString(),
    };
    store.recurringDonations.push(recurring);
    persist();
    return recurring;
  },
  listRecurringForUser: (userId: string) =>
    store.recurringDonations.filter((r) => r.userId === userId).sort((a, b) => b.startedAt.localeCompare(a.startedAt)),
  listAllRecurring: () => [...store.recurringDonations].sort((a, b) => b.startedAt.localeCompare(a.startedAt)),
  getRecurringById: (id: string) => store.recurringDonations.find((r) => r.id === id),
  cancelRecurring: (id: string, userId?: string) => {
    const r = store.recurringDonations.find((x) => x.id === id);
    if (!r) return null;
    if (userId && r.userId !== userId) return null;
    r.status = "CANCELLED";
    r.cancelledAt = new Date().toISOString();
    persist();
    return r;
  },
};
