import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const base = "https://www.shrinityanikunjtrust.com";
const routes = ["", "/about", "/campaigns", "/events", "/gallery", "/blog", "/volunteer", "/contact", "/donate", "/faq", "/privacy-policy", "/terms", "/donation-policy", "/refund-policy"];

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = routes.map((route) => ({ url: `${base}${route}`, changeFrequency: route === "" ? "weekly" as const : "monthly" as const, priority: route === "" ? 1 : 0.7 }));
  try {
    const [campaigns, blogs, events] = await Promise.all([
      prisma.campaign.findMany({ where: { status: "ACTIVE" }, select: { slug: true, updatedAt: true } }),
      prisma.blogPost.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
      prisma.event.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
    ]);
    return [
      ...staticRoutes,
      ...campaigns.map((item) => ({ url: `${base}/campaigns/${item.slug}`, lastModified: item.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 })),
      ...blogs.map((item) => ({ url: `${base}/blog/${item.slug}`, lastModified: item.updatedAt, changeFrequency: "monthly" as const, priority: 0.6 })),
      ...events.map((item) => ({ url: `${base}/events/${item.slug}`, lastModified: item.updatedAt, changeFrequency: "weekly" as const, priority: 0.7 })),
    ];
  } catch (error) {
    console.error("Could not load dynamic sitemap entries:", error);
    return staticRoutes;
  }
}
