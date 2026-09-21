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
  email: z.string().email(),
  phone: z.string().optional(),
  city: z.string().optional(),
  interests: z.array(z.string()).default([]),
  availability: z.string().optional(),
  message: z.string().optional(),
});

export const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(5),
});
