import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category") ?? undefined;
  const campaigns = (await db.listPublicCampaigns(category)).map((c: any) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    shortDescription: c.shortDescription,
    isFeatured: c.isFeatured,
    isUrgent: c.isUrgent,
  }));
  return NextResponse.json({ success: true, campaigns });
}
