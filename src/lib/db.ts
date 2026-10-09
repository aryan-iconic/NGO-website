import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { getLocale } from "./get-locale";
import { resolveLocalizedRecord, generateAllTranslations } from "./translation";


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

export interface InstagramPost {
  id: string;
  instagramUrl: string;
  title?: string;
  caption?: string;
  displayOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface YouTubeVideo {
  id: string;
  youtubeUrl: string;
  title?: string;
  description?: string;
  displayOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
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


// We use Prisma's generated types but map Date -> string for the UI boundary
function mapDates<T>(obj: T): any {
  if (obj === null || obj === undefined) return obj;
  if (obj instanceof Date) return obj.toISOString();
  if (Array.isArray(obj)) return obj.map(mapDates);
  if (typeof obj === "object") {
    const res: any = {};
    for (const key in obj) {
      if (typeof (obj as any)[key] === "bigint") {
        res[key] = Number((obj as any)[key]);
      } else {
        res[key] = mapDates((obj as any)[key]);
      }
    }
    return res;
  }
  return obj;
}

// Wrapper for read queries to automatically apply localization
async function resolve<T>(promise: Promise<T>): Promise<any> {
  const result = await promise;
  if (!result) return mapDates(result);
  
  try {
    const locale = await getLocale();
    if (locale === "en") return mapDates(result);
    
    if (Array.isArray(result)) {
      return result.map(item => mapDates(resolveLocalizedRecord(item, locale))) as any;
    }
    return mapDates(resolveLocalizedRecord(result as any, locale)) as any;
  } catch (e) {
    return mapDates(result);
  }
}

// Fire-and-forget wrapper for triggering translation updates after write operations
function triggerTranslation(model: string, id: string, record: any, fields: string[]) {
  // We run this in the background to avoid blocking the Admin response
  generateAllTranslations(record, fields).then(async (translations) => {
    // Update the record with the generated translations JSON
    await (prisma as any)[model].update({
      where: { id },
      data: { translations }
    });
  }).catch(e => console.error("Failed to generate translations for", model, id, e));
}

export const db = {
  // Categories & Seva Areas
  listCategories: async () => resolve(prisma.category.findMany({ orderBy: { sortOrder: 'asc' } })),
  listSevaAreas: async () => resolve(prisma.sevaArea.findMany({ orderBy: { sortOrder: 'asc' } })),
  getSevaArea: async (id?: string) => {
    if (!id) return null;
    return resolve(prisma.sevaArea.findUnique({ where: { id } }));
  },
  getSevaAreaBySlug: async (slug: string) => resolve(prisma.sevaArea.findUnique({ where: { slug } })),
  createSevaArea: async (data: any) => {
    const record = await prisma.sevaArea.create({
      data: {
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
      }
    });
    triggerTranslation("sevaArea", record.id, record, ["name", "description", "objectives"]);
    return resolve(Promise.resolve(record));
  },
  updateSevaArea: async (id: string, data: any) => {
    const record = await prisma.sevaArea.update({ where: { id }, data });
    triggerTranslation("sevaArea", record.id, record, ["name", "description", "objectives"]);
    return resolve(Promise.resolve(record));
  },
  deleteSevaArea: async (id: string) => {
    await prisma.sevaArea.delete({ where: { id } });
  },

  // Campaigns
  listPublicCampaigns: async (categorySlug?: string) => {
    const where: Prisma.CampaignWhereInput = { status: "ACTIVE", deletedAt: null };
    if (categorySlug) {
      const cat = await prisma.category.findUnique({ where: { slug: categorySlug } });
      const sa = await prisma.sevaArea.findUnique({ where: { slug: categorySlug } });
      if (cat) where.categoryId = cat.id;
      else if (sa) where.sevaAreaId = sa.id;
    }
    return resolve(prisma.campaign.findMany({ where, orderBy: { createdAt: 'desc' } }));
  },
  getPublicCampaignBySlug: async (slug: string, includeDraft = false) => {
    const statusFilter = includeDraft ? { in: ["ACTIVE", "DRAFT", "COMPLETED"] as any[] } : "ACTIVE";
    return resolve(prisma.campaign.findFirst({ where: { slug, status: statusFilter, deletedAt: null } }));
  },
  getCampaignProducts: async (campaignId: string) => {
    return resolve(prisma.campaignProduct.findMany({ where: { campaignId, isActive: true } }));
  },
  getCampaignMedia: async (campaignId: string) => {
    return resolve(prisma.campaignMedia.findMany({ where: { campaignId }, orderBy: { sortOrder: 'asc' } }));
  },
  getCampaignMilestones: async (campaignId: string) => {
    return resolve(prisma.campaignMilestone.findMany({ where: { campaignId }, orderBy: { sortOrder: 'asc' } }));
  },
  getCampaignFaqs: async (campaignId: string) => {
    return resolve(prisma.campaignFaq.findMany({ where: { campaignId }, orderBy: { sortOrder: 'asc' } }));
  },
  getCampaignUpdates: async (campaignId: string) => {
    return resolve(prisma.campaignUpdate.findMany({ where: { campaignId }, orderBy: { publishedAt: 'desc' } }));
  },
  getCategory: async (id?: string) => {
    if (!id) return null;
    return resolve(prisma.category.findUnique({ where: { id } }));
  },

  // Admin campaign management
  listAllCampaigns: async () => resolve(prisma.campaign.findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'desc' } })),
  getCampaignById: async (id: string) => resolve(prisma.campaign.findUnique({ where: { id } })),
  createCampaign: async (input: any) => {
    const campaign = await prisma.campaign.create({
      data: {
        title: input.title,
        slug: input.slug,
        shortDescription: input.shortDescription,
        story: input.story,
        beneficiaryInfo: input.beneficiaryInfo,
        impactDescription: input.impactDescription,
        categoryId: input.categoryId,
        sevaAreaId: input.sevaAreaId,
        locationText: input.locationText,
        coverImage: input.coverImage,
        status: input.status ?? "DRAFT",
        isFeatured: input.isFeatured ?? false,
        isUrgent: input.isUrgent ?? false,
        donationMode: input.donationMode ?? "BOTH",
        allowCustomAmount: input.allowCustomAmount ?? true,
        minimumAmountPaise: input.minimumAmountPaise ?? 10000,
        suggestedAmountsJson: input.suggestedAmountsPaise ? JSON.stringify(input.suggestedAmountsPaise) : null,
        taxBenefitEnabled: input.taxBenefitEnabled ?? false,
        createdByAdminId: input.createdByAdminId,
      }
    });
    await prisma.campaignFinancials.create({
      data: { campaignId: campaign.id, internalTargetPaise: null, internalBudgetPaise: null }
    });
    triggerTranslation("campaign", campaign.id, campaign, ["title", "shortDescription", "story", "beneficiaryInfo", "impactDescription", "locationText"]);
    const c = await resolve(Promise.resolve(campaign));
    c.suggestedAmountsPaise = input.suggestedAmountsPaise || [];
    return c;
  },
  updateCampaign: async (id: string, patch: any) => {
    if (patch.suggestedAmountsPaise) {
      patch.suggestedAmountsJson = JSON.stringify(patch.suggestedAmountsPaise);
      delete patch.suggestedAmountsPaise;
    }
    const updated = await prisma.campaign.update({ where: { id }, data: patch });
    triggerTranslation("campaign", updated.id, updated, ["title", "shortDescription", "story", "beneficiaryInfo", "impactDescription", "locationText"]);
    const c = await resolve(Promise.resolve(updated));
    c.suggestedAmountsPaise = c.suggestedAmountsJson ? JSON.parse(c.suggestedAmountsJson) : [];
    return c;
  },
  deleteCampaign: async (id: string) => {
    // Soft delete by setting deletedAt
    await prisma.campaign.update({ where: { id }, data: { deletedAt: new Date().toISOString() } });
    return true;
  },
  getCampaignFinancials: async (campaignId: string) => mapDates(await prisma.campaignFinancials.findUnique({ where: { campaignId } })),

  // Users / Admins (auth)
  findUserByEmail: async (email: string) => mapDates(await prisma.user.findUnique({ where: { email } })),
  findUserById: async (id: string) => mapDates(await prisma.user.findUnique({ where: { id } })),
  createUser: async (name: string, email: string, phone: string | undefined, password: string) => {
    return mapDates(await prisma.user.create({
      data: { name, email, phone, passwordHash: bcrypt.hashSync(password, 10) }
    }));
  },
  verifyUserPassword: async (email: string, password: string) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return bcrypt.compareSync(password, user.passwordHash) ? mapDates(user) : null;
  },
  findAdminByEmail: async (email: string) => mapDates(await prisma.admin.findUnique({ where: { email } })),
  findAdminById: async (id: string) => mapDates(await prisma.admin.findUnique({ where: { id } })),
  verifyAdminPassword: async (email: string, password: string) => {
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) return null;
    return bcrypt.compareSync(password, admin.passwordHash) ? mapDates(admin) : null;
  },

  // Donations
  createDonation: async (input: any) => {
    const year = new Date().getFullYear();
    const count = await prisma.donation.count();
    const seq = count + 1;
    const donationNumber = `DN-${year}-${String(seq).padStart(6, "0")}`;

    const donation = await prisma.donation.create({
      data: {
        donationNumber,
        userId: input.userId,
        campaignId: input.campaignId,
        donorName: input.donorName,
        donorEmail: input.donorEmail,
        donorPhone: input.donorPhone,
        totalPaise: input.totalPaise,
        itemsTotalPaise: input.items.reduce((acc: number, item: any) => acc + item.totalPaise, 0),
        status: "CREATED",
        isAnonymous: input.isAnonymous,
        idempotencyKey: input.idempotencyKey ?? `${donationNumber}-${Date.now()}`,
        items: {
          create: input.items.map((item: any) => ({
            campaignProductId: item.productId,
            productNameSnapshot: item.productNameSnapshot,
            unitPriceSnapshotPaise: item.unitPriceSnapshotPaise,
            quantity: item.quantity,
            totalPaise: item.totalPaise,
          }))
        }
      },
      include: { items: true }
    });
    return mapDates(donation);
  },
  createDonationWithOrder: async (input: any, orderId: string) => {
    const year = new Date().getFullYear();
    const count = await prisma.donation.count();
    const donationNumber = `DN-${year}-${String(count + 1).padStart(6, "0")}`;
    return mapDates(await prisma.donation.create({
      data: {
        donationNumber,
        userId: input.userId,
        campaignId: input.campaignId,
        donorName: input.donorName,
        donorEmail: input.donorEmail,
        donorPhone: input.donorPhone,
        totalPaise: input.totalPaise,
        itemsTotalPaise: input.items.reduce((sum: number, item: any) => sum + item.totalPaise, 0),
        status: "PENDING_PAYMENT",
        isAnonymous: input.isAnonymous,
        idempotencyKey: input.idempotencyKey,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        items: { create: input.items.map((item: any) => ({
          campaignProductId: item.productId,
          productNameSnapshot: item.productNameSnapshot,
          unitPriceSnapshotPaise: item.unitPriceSnapshotPaise,
          quantity: item.quantity,
          totalPaise: item.totalPaise,
        })) },
        payments: { create: { gatewayOrderId: orderId, amountPaise: input.totalPaise, status: "PENDING" } },
      },
      include: { items: true },
    }));
  },
  getDonation: async (id: string) => mapDates(await prisma.donation.findUnique({ where: { id }, include: { items: true } })),
  listAllDonations: async () => mapDates(await prisma.donation.findMany({ orderBy: { createdAt: 'desc' }, include: { items: true } })),
  markDonationCompleted: async (id: string, paymentId: string, orderId?: string, method?: string) => {
    return prisma.$transaction(async (tx) => {
      const result = await tx.donation.updateMany({
        where: { id, status: { in: ["PENDING_PAYMENT", "CREATED"] } },
        data: { status: "SUCCESS" }
      });
      if (result.count === 0) {
        const existing = await tx.donation.findUnique({ where: { id }, include: { receipt: true } });
        if (existing?.status === "SUCCESS" && !existing.receipt) {
          await tx.receipt.create({ data: { donationId: id, receiptNumber: `REC-${existing.donationNumber}` } });
        }
        return false;
      }

      const d = await tx.donation.findUnique({ where: { id }, include: { items: true } });
      if (!d) return false;

      // Update sponsored quantities
      for (const item of d.items) {
        if (item.campaignProductId) {
          await tx.campaignProduct.update({
            where: { id: item.campaignProductId },
            data: { quantitySponsored: { increment: item.quantity } }
          });
        }
      }

      await tx.payment.updateMany({
        where: { donationId: id, ...(orderId ? { gatewayOrderId: orderId } : {}) },
        data: { status: "SUCCESS", gatewayPaymentId: paymentId, method, paidAt: new Date() },
      });
      await tx.receipt.upsert({
        where: { donationId: d.id },
        create: { donationId: d.id, receiptNumber: `REC-${d.donationNumber}` },
        update: {},
      });
      return true;
    });
  },
  findDonationByOrder: async (orderId: string) => mapDates(await prisma.donation.findFirst({ where: { payments: { some: { gatewayOrderId: orderId } } } })),
  getPaymentByOrder: async (orderId: string) => mapDates(await prisma.payment.findUnique({ where: { gatewayOrderId: orderId }, include: { donation: true } })),
  markDonationPaymentFailed: async (orderId: string) => {
    await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({ where: { gatewayOrderId: orderId } });
      if (!payment) return;
      await tx.payment.updateMany({ where: { gatewayOrderId: orderId, status: { not: "SUCCESS" } }, data: { status: "FAILED" } });
      await tx.donation.updateMany({ where: { id: payment.donationId, status: "PENDING_PAYMENT" }, data: { status: "FAILED" } });
    });
  },
  
  // Receipts
  getReceiptForDonation: async (donationId: string) => mapDates(await prisma.receipt.findUnique({ where: { donationId } })),
  generateReceipt: async (donationId: string) => {
    const d = await prisma.donation.findUnique({ where: { id: donationId } });
    if (!d) return null;
    return mapDates(await prisma.receipt.create({
      data: {
        donationId: d.id,
        receiptNumber: `REC-${d.donationNumber}`,
      }
    }));
  },

  createPayment: async (donationId: string, orderId: string, amountPaise: number) => {
    return mapDates(await prisma.payment.create({
      data: {
        donationId,
        gatewayOrderId: orderId,
        amountPaise,
        status: "CREATED"
      }
    }));
  },

  // Volunteers / Contact
  createVolunteerApplication: async (data: any) => {
    return mapDates(await prisma.volunteerApplication.create({ data: { ...data, interests: JSON.stringify(data.interests) } }));
  },
  listVolunteerApplications: async () => {
    const apps = await prisma.volunteerApplication.findMany({ orderBy: { createdAt: 'desc' } });
    return mapDates(apps).map((a: any) => {
      a.interests = JSON.parse(a.interests);
      return a;
    });
  },
  createContactMessage: async (data: any) => mapDates(await prisma.contactMessage.create({ data })),
  listContactMessages: async () => mapDates(await prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' } })),

  // Events
  listEvents: async () => resolve(prisma.event.findMany({ orderBy: { eventDate: 'asc' } })),
  getEventBySlug: async (slug: string) => resolve(prisma.event.findUnique({ where: { slug } })),
  getAdmin: async (email: string) => await prisma.admin.findUnique({ where: { email } }),
  getAdminById: async (id: string) => await prisma.admin.findUnique({ where: { id } }),
  createAdmin: async (data: any) => await prisma.admin.create({ data }),
  disableTwoFactor: async (adminId: string) => await prisma.admin.update({ where: { id: adminId }, data: { twoFactorEnabled: false } }),
  setTwoFactorPendingSecret: async (adminId: string, secret: string) => { /* Mocked */ },
  confirmTwoFactor: async (adminId: string) => {
    await prisma.admin.update({ where: { id: adminId }, data: { twoFactorEnabled: true } });
    return true;
  },
  getEventById: async (id: string) => resolve(prisma.event.findUnique({ where: { id } })),
  createEvent: async (data: any) => {
    const record = await prisma.event.create({ data: { ...data, eventDate: new Date(data.eventDate) } });
    triggerTranslation("event", record.id, record, ["title", "description", "venue", "location", "organizer"]);
    return resolve(Promise.resolve(record));
  },
  updateEvent: async (id: string, data: any) => {
    if (data.eventDate) data.eventDate = new Date(data.eventDate);
    const record = await prisma.event.update({ where: { id }, data });
    triggerTranslation("event", record.id, record, ["title", "description", "venue", "location", "organizer"]);
    return resolve(Promise.resolve(record));
  },
  deleteEvent: async (id: string) => { await prisma.event.delete({ where: { id } }); return true; },
  createEventRegistration: async (data: any) => mapDates(await prisma.eventRegistration.create({ data })),
  listEventRegistrations: async (eventId: string) => mapDates(await prisma.eventRegistration.findMany({ where: { eventId } })),

  // Blog
  listBlogPosts: async () => resolve(prisma.blogPost.findMany({ orderBy: { publishedAt: 'desc' } })),
  getBlogPostBySlug: async (slug: string) => resolve(prisma.blogPost.findUnique({ where: { slug } })),
  getBlogPostById: async (id: string) => resolve(prisma.blogPost.findUnique({ where: { id } })),
  createBlogPost: async (data: any) => {
    const record = await prisma.blogPost.create({ data });
    triggerTranslation("blogPost", record.id, record, ["title", "excerpt", "content"]);
    return resolve(Promise.resolve(record));
  },
  updateBlogPost: async (id: string, data: any) => {
    const record = await prisma.blogPost.update({ where: { id }, data });
    triggerTranslation("blogPost", record.id, record, ["title", "excerpt", "content"]);
    return resolve(Promise.resolve(record));
  },
  deleteBlogPost: async (id: string) => { await prisma.blogPost.delete({ where: { id } }); return true; },

  // FAQs
  listFaqs: async () => resolve(prisma.faq.findMany({ orderBy: { sortOrder: 'asc' } })),
  getFaq: async (id: string) => resolve(prisma.faq.findUnique({ where: { id } })),
  createFaq: async (data: any) => {
    const record = await prisma.faq.create({ data });
    triggerTranslation("faq", record.id, record, ["question", "answer", "category"]);
    return resolve(Promise.resolve(record));
  },
  updateFaq: async (id: string, data: any) => {
    const record = await prisma.faq.update({ where: { id }, data });
    triggerTranslation("faq", record.id, record, ["question", "answer", "category"]);
    return resolve(Promise.resolve(record));
  },
  deleteFaq: async (id: string) => { await prisma.faq.delete({ where: { id } }); return true; },

  // Recurring - Release 2 Boundary
  listRecurringDonations: async (...args: any[]) => [],
  getRecurringDonation: async (...args: any[]) => null,
  createRecurringDonation: async (...args: any[]) => { throw new Error("Recurring donations not supported in Phase 3"); },
  updateRecurringDonationStatus: async (...args: any[]) => { throw new Error("Recurring donations not supported"); },

  // Audit
  logAudit: async (entry: any) => {
    await prisma.auditLog.create({
      data: {
        actorType: entry.actorType,
        actorId: entry.actorId,
        action: entry.action,
        entity: entry.entity,
        entityId: entry.entityId,
        newValue: entry.newValue ? JSON.stringify(entry.newValue) : Prisma.JsonNull,
      }
    });
  },
  listAuditLogs: async () => mapDates(await prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' } })),
  listPublishedEvents: async () => mapDates(await prisma.event.findMany({ where: { status: "PUBLISHED" }, orderBy: { eventDate: 'asc' } })),
  listDonationsForUser: async (userId: string) => mapDates(await prisma.donation.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, include: { items: true } })),

  // Social Media
  listInstagramPosts: async () => resolve(prisma.instagramPost.findMany({ orderBy: { displayOrder: 'asc' } })),
  getInstagramPost: async (id: string) => resolve(prisma.instagramPost.findUnique({ where: { id } })),
  createInstagramPost: async (data: any) => {
    const record = await prisma.instagramPost.create({ data });
    triggerTranslation("instagramPost", record.id, record, ["title", "caption"]);
    return resolve(Promise.resolve(record));
  },
  updateInstagramPost: async (id: string, data: any) => {
    const record = await prisma.instagramPost.update({ where: { id }, data });
    triggerTranslation("instagramPost", record.id, record, ["title", "caption"]);
    return resolve(Promise.resolve(record));
  },
  deleteInstagramPost: async (id: string) => { await prisma.instagramPost.delete({ where: { id } }); return true; },

  listYouTubeVideos: async () => resolve(prisma.youTubeVideo.findMany({ orderBy: { displayOrder: 'asc' } })),
  getYouTubeVideo: async (id: string) => resolve(prisma.youTubeVideo.findUnique({ where: { id } })),
  createYouTubeVideo: async (data: any) => {
    const record = await prisma.youTubeVideo.create({ data });
    triggerTranslation("youTubeVideo", record.id, record, ["title", "description"]);
    return resolve(Promise.resolve(record));
  },
  updateYouTubeVideo: async (id: string, data: any) => {
    const record = await prisma.youTubeVideo.update({ where: { id }, data });
    triggerTranslation("youTubeVideo", record.id, record, ["title", "description"]);
    return resolve(Promise.resolve(record));
  },
  deleteYouTubeVideo: async (id: string) => { await prisma.youTubeVideo.delete({ where: { id } }); return true; },

  // Gallery
  listGalleryItems: async (includeUnpublished = false) => resolve(prisma.galleryItem.findMany({ where: includeUnpublished ? {} : { isPublished: true }, orderBy: { displayOrder: 'asc' } })),
  getGalleryItem: async (id: string) => resolve(prisma.galleryItem.findUnique({ where: { id } })),
  createGalleryItem: async (data: any) => {
    const record = await prisma.galleryItem.create({ data });
    triggerTranslation("galleryItem", record.id, record, ["title", "caption", "description", "category", "altText"]);
    return resolve(Promise.resolve(record));
  },
  updateGalleryItem: async (id: string, data: any) => {
    const record = await prisma.galleryItem.update({ where: { id }, data });
    triggerTranslation("galleryItem", record.id, record, ["title", "caption", "description", "category", "altText"]);
    return resolve(Promise.resolve(record));
  },
  deleteGalleryItem: async (id: string) => { await prisma.galleryItem.delete({ where: { id } }); return true; },

  // Team
  listTeamMembers: async (includeUnpublished = false) => resolve(prisma.teamMember.findMany({ where: includeUnpublished ? {} : { isPublished: true }, orderBy: { displayOrder: 'asc' } })),
  getTeamMember: async (id: string) => resolve(prisma.teamMember.findUnique({ where: { id } })),
  createTeamMember: async (data: any) => {
    const record = await prisma.teamMember.create({ data });
    triggerTranslation("teamMember", record.id, record, ["name", "role", "bio"]);
    return resolve(Promise.resolve(record));
  },
  updateTeamMember: async (id: string, data: any) => {
    const record = await prisma.teamMember.update({ where: { id }, data });
    triggerTranslation("teamMember", record.id, record, ["name", "role", "bio"]);
    return resolve(Promise.resolve(record));
  },
  deleteTeamMember: async (id: string) => { await prisma.teamMember.delete({ where: { id } }); return true; },

  getSetting: async (key: string) => {
    const s = await prisma.setting.findUnique({ where: { key } });
    return s?.value ?? null;
  },


  // --- Newsletter ---
  createNewsletterSubscriber: async (data: any) => resolve(prisma.newsletterSubscriber.create({ data })),
  listNewsletterSubscribers: async () => resolve(prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: "desc" } })),
  getNewsletterSubscriberByEmail: async (email: string) => resolve(prisma.newsletterSubscriber.findUnique({ where: { email } })),
  updateNewsletterSubscriber: async (id: string, data: any) => resolve(prisma.newsletterSubscriber.update({ where: { id }, data })),
  deleteNewsletterSubscriber: async (id: string) => { await prisma.newsletterSubscriber.delete({ where: { id } }); return true; },

  // --- Statutory Registrations ---
  listStatutoryRegistrations: async (includeDraft = false) => {
    const p = includeDraft ? {} : { isPublished: true };
    return resolve(prisma.statutoryRegistration.findMany({ where: p, orderBy: { displayOrder: "asc" } }));
  },
  getStatutoryRegistration: async (id: string) => resolve(prisma.statutoryRegistration.findUnique({ where: { id } })),
  createStatutoryRegistration: async (data: any) => {
    const record = await prisma.statutoryRegistration.create({ data });
    triggerTranslation("statutoryRegistration", record.id, record, ["title", "description", "issuingAuthority"]);
    return resolve(Promise.resolve(record));
  },
  updateStatutoryRegistration: async (id: string, data: any) => {
    const record = await prisma.statutoryRegistration.update({ where: { id }, data });
    triggerTranslation("statutoryRegistration", record.id, record, ["title", "description", "issuingAuthority"]);
    return resolve(Promise.resolve(record));
  },
  deleteStatutoryRegistration: async (id: string) => { await prisma.statutoryRegistration.delete({ where: { id } }); return true; },

  // --- 80G Tax Information ---
  createDonorTaxInformation: async (data: any) => resolve(prisma.donorTaxInformation.create({ data })),
  updateDonorTaxInformation: async (id: string, data: any) => resolve(prisma.donorTaxInformation.update({ where: { id }, data })),
  getDonorTaxInformation: async (id: string) => resolve(prisma.donorTaxInformation.findUnique({ where: { id }, include: { donation: true } })),
  getDonorTaxInformationByDonation: async (donationId: string) => resolve(prisma.donorTaxInformation.findUnique({ where: { donationId }, include: { donation: true } })),
  listDonorTaxInformation: async () => resolve(prisma.donorTaxInformation.findMany({ include: { donation: true }, orderBy: { createdAt: "desc" } })),

  // --- Contact Messages ---
  getContactMessage: async (id: string) => resolve(prisma.contactMessage.findUnique({ where: { id } })),
  updateContactMessageStatus: async (id: string, status: string) => resolve(prisma.contactMessage.update({ where: { id }, data: { status } })),
  deleteContactMessage: async (id: string) => { await prisma.contactMessage.delete({ where: { id } }); return true; },
};
