import { z } from "zod";

export const donationItemSchema = z.object({
  productId: z.string().optional(),
  productName: z.string(),
  unitPricePaise: z.number().int().positive(),
  quantity: z.number().int().positive(),
});

export const createDonationSchema = z.object({
  campaignId: z.string().optional(),
  items: z.array(donationItemSchema).default([]),
  customAmountPaise: z.number().int().positive().optional(),
  donorName: z.string().min(2, "Name is required"),
  donorEmail: z.string().email("A valid email is required"),
  donorPhone: z.string().optional(),
  isAnonymous: z.boolean().default(false),
});

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const volunteerSchema = z.object({
  name: z.string().min(2),
  email: z.string().trim().email().toLowerCase(),
  phone: z.string().optional(),
  city: z.string().optional(),
  interests: z.array(z.string()).default([]),
  availability: z.string().optional(),
  message: z.string().optional(),
});

export const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10).regex(/^\+?[0-9\s\-]+$/, "Invalid phone number format"),
  subject: z.string().optional(),
  message: z.string().min(5),
});

export const newsletterSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().trim().email("A valid email is required").toLowerCase(),
  city: z.string().optional(),
});

export const statutoryRegistrationSchema = z.object({
  title: z.string().min(2),
  registrationNumber: z.string().optional(),
  issuingAuthority: z.string().optional(),
  description: z.string().optional(),
  documentUrl: z.string().optional(),
  verificationUrl: z.string().url().optional().or(z.literal("")),
  isPublished: z.boolean().default(true),
  displayOrder: z.number().int().default(0),
});

export const donorTaxInformationSchema = z.object({
  donationId: z.string(),
  donorName: z.string().min(2, "Name as per PAN is required"),
  email: z.string().email("A valid email is required"),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format"),
  addressLine1: z.string().min(5, "Address Line 1 is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^[0-9]{6}$/, "Invalid Pincode format"),
});
