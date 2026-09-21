import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";


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

export const db = {
  // Categories & Seva Areas
  listCategories: async () => mapDates(await prisma.category.findMany({ orderBy: { sortOrder: 'asc' } })),
  listSevaAreas: async () => mapDates(await prisma.sevaArea.findMany({ orderBy: { sortOrder: 'asc' } })),
  getSevaArea: async (id?: string) => {
    if (!id) return null;
    return mapDates(await prisma.sevaArea.findUnique({ where: { id } }));
  },
  getSevaAreaBySlug: async (slug: string) => mapDates(await prisma.sevaArea.findUnique({ where: { slug } })),
  createSevaArea: async (data: any) => {
    return mapDates(await prisma.sevaArea.create({
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
    }));
  },
  updateSevaArea: async (id: string, data: any) => {
    return mapDates(await prisma.sevaArea.update({ where: { id }, data }));
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
    return mapDates(await prisma.campaign.findMany({ where, orderBy: { createdAt: 'desc' } }));
  },
  getPublicCampaignBySlug: async (slug: string) => {
    return mapDates(await prisma.campaign.findFirst({ where: { slug, status: "ACTIVE", deletedAt: null } }));
  },
  getCampaignProducts: async (campaignId: string) => {
    return mapDates(await prisma.campaignProduct.findMany({ where: { campaignId, isActive: true } }));
  },
  getCampaignMilestones: async (campaignId: string) => {
    return mapDates(await prisma.campaignMilestone.findMany({ where: { campaignId }, orderBy: { sortOrder: 'asc' } }));
  },
  getCampaignFaqs: async (campaignId: string) => {
    return mapDates(await prisma.campaignFaq.findMany({ where: { campaignId }, orderBy: { sortOrder: 'asc' } }));
  },
  getCampaignUpdates: async (campaignId: string) => {
    return mapDates(await prisma.campaignUpdate.findMany({ where: { campaignId }, orderBy: { publishedAt: 'desc' } }));
  },
  getCategory: async (id?: string) => {
    if (!id) return null;
    return mapDates(await prisma.category.findUnique({ where: { id } }));
  },

  // Admin campaign management
  listAllCampaigns: async () => mapDates(await prisma.campaign.findMany({ orderBy: { createdAt: 'desc' } })),
  getCampaignById: async (id: string) => mapDates(await prisma.campaign.findUnique({ where: { id } })),
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
    const c = mapDates(campaign);
    c.suggestedAmountsPaise = input.suggestedAmountsPaise || [];
    return c;
  },
  updateCampaign: async (id: string, patch: any) => {
    if (patch.suggestedAmountsPaise) {
      patch.suggestedAmountsJson = JSON.stringify(patch.suggestedAmountsPaise);
      delete patch.suggestedAmountsPaise;
    }
    const updated = await prisma.campaign.update({ where: { id }, data: patch });
    const c = mapDates(updated);
    c.suggestedAmountsPaise = c.suggestedAmountsJson ? JSON.parse(c.suggestedAmountsJson) : [];
    return c;
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
  getDonation: async (id: string) => mapDates(await prisma.donation.findUnique({ where: { id }, include: { items: true } })),
  listAllDonations: async () => mapDates(await prisma.donation.findMany({ orderBy: { createdAt: 'desc' }, include: { items: true } })),
  markDonationCompleted: async (id: string, paymentId: string) => {
    await prisma.$transaction(async (tx) => {
      const result = await tx.donation.updateMany({
        where: { id, status: "PENDING_PAYMENT" },
        data: { status: "SUCCESS" }
      });
      if (result.count === 0) return;

      const d = await tx.donation.findUnique({ where: { id }, include: { items: true } });
      if (!d) return;

      // Update sponsored quantities
      for (const item of d.items) {
        if (item.campaignProductId) {
          await tx.campaignProduct.update({
            where: { id: item.campaignProductId },
            data: { quantitySponsored: { increment: item.quantity } }
          });
        }
      }

      await tx.receipt.create({
        data: {
          donationId: d.id,
          receiptNumber: `REC-${d.donationNumber}`,
        }
      });
    });
  },
  findDonationByOrder: async (orderId: string) => mapDates(await prisma.donation.findFirst({ where: { payments: { some: { gatewayOrderId: orderId } } } })),
  
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
  listEvents: async () => mapDates(await prisma.event.findMany({ orderBy: { eventDate: 'asc' } })),
  getEventBySlug: async (slug: string) => mapDates(await prisma.event.findUnique({ where: { slug } })),
  getAdmin: async (email: string) => await prisma.admin.findUnique({ where: { email } }),
  getAdminById: async (id: string) => await prisma.admin.findUnique({ where: { id } }),
  createAdmin: async (data: any) => await prisma.admin.create({ data }),
  disableTwoFactor: async (adminId: string) => await prisma.admin.update({ where: { id: adminId }, data: { twoFactorEnabled: false } }),
  setTwoFactorPendingSecret: async (adminId: string, secret: string) => { /* Mocked */ },
  confirmTwoFactor: async (adminId: string) => {
    await prisma.admin.update({ where: { id: adminId }, data: { twoFactorEnabled: true } });
    return true;
  },
  getEventById: async (id: string) => mapDates(await prisma.event.findUnique({ where: { id } })),
  createEvent: async (data: any) => mapDates(await prisma.event.create({ data: { ...data, eventDate: new Date(data.eventDate) } })),
  updateEvent: async (id: string, data: any) => {
    if (data.eventDate) data.eventDate = new Date(data.eventDate);
    return mapDates(await prisma.event.update({ where: { id }, data }));
  },
  deleteEvent: async (id: string) => { await prisma.event.delete({ where: { id } }); return true; },
  createEventRegistration: async (data: any) => mapDates(await prisma.eventRegistration.create({ data })),
  listEventRegistrations: async (eventId: string) => mapDates(await prisma.eventRegistration.findMany({ where: { eventId } })),

  // Blog
  listBlogPosts: async () => mapDates(await prisma.blogPost.findMany({ orderBy: { publishedAt: 'desc' } })),
  getBlogPostBySlug: async (slug: string) => mapDates(await prisma.blogPost.findUnique({ where: { slug } })),
  getBlogPostById: async (id: string) => mapDates(await prisma.blogPost.findUnique({ where: { id } })),
  createBlogPost: async (data: any) => mapDates(await prisma.blogPost.create({ data })),
  updateBlogPost: async (id: string, data: any) => mapDates(await prisma.blogPost.update({ where: { id }, data })),
  deleteBlogPost: async (id: string) => { await prisma.blogPost.delete({ where: { id } }); return true; },

  // FAQs
  listFaqs: async () => mapDates(await prisma.faq.findMany({ orderBy: { sortOrder: 'asc' } })),
  getFaq: async (id: string) => mapDates(await prisma.faq.findUnique({ where: { id } })),
  createFaq: async (data: any) => mapDates(await prisma.faq.create({ data })),
  updateFaq: async (id: string, data: any) => mapDates(await prisma.faq.update({ where: { id }, data })),
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
};
