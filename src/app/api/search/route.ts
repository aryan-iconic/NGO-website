import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { getLocale } from "@/lib/get-locale";
import { resolveLocalizedRecord } from "@/lib/translation";

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`search:${ip}`, 60, 60_000)) return NextResponse.json({ error: "Too many searches. Please try again shortly." }, { status: 429 });
  const q = (req.nextUrl.searchParams.get("q") || "").trim().slice(0, 100);
  if (q.length < 2) return NextResponse.json({ results: [] });
  const locale = await getLocale();
  const [campaigns, blogs, events] = await Promise.all([
    prisma.campaign.findMany({ where: { status: "ACTIVE", OR: [{ title: { contains: q, mode: "insensitive" } }, { shortDescription: { contains: q, mode: "insensitive" } }] }, select: { title: true, slug: true, shortDescription: true, translations: true }, take: 10 }),
    prisma.blogPost.findMany({ where: { status: "PUBLISHED", OR: [{ title: { contains: q, mode: "insensitive" } }, { excerpt: { contains: q, mode: "insensitive" } }] }, select: { title: true, slug: true, excerpt: true, translations: true }, take: 10 }),
    prisma.event.findMany({ where: { status: "PUBLISHED", title: { contains: q, mode: "insensitive" } }, select: { title: true, slug: true, description: true, translations: true }, take: 10 }),
  ]);
  const results = [
    ...campaigns.map((item) => { const localized = resolveLocalizedRecord(item, locale); return { title: localized.title, type: "Campaign", href: `/campaigns/${item.slug}`, description: localized.shortDescription }; }),
    ...blogs.map((item) => { const localized = resolveLocalizedRecord(item, locale); return { title: localized.title, type: "Blog", href: `/blog/${item.slug}`, description: localized.excerpt }; }),
    ...events.map((item) => { const localized = resolveLocalizedRecord(item, locale); return { title: localized.title, type: "Event", href: `/events/${item.slug}`, description: localized.description }; }),
  ].slice(0, 20);
  return NextResponse.json({ results });
}
