import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const searchParams = req.nextUrl.searchParams;
    const locale = searchParams.get("locale") || undefined;
    const status = searchParams.get("status") || undefined;
    const q = searchParams.get("q") || undefined;

    const where: any = {};
    if (locale) where.locale = locale;
    if (status) where.status = status;
    if (q) {
      where.OR = [
        { sourceText: { contains: q, mode: "insensitive" } },
        { translatedText: { contains: q, mode: "insensitive" } },
      ];
    }

    const translations = await db.prisma.translation.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      take: 100, // Limit for now to prevent massive payloads
    });

    return NextResponse.json({ success: true, data: translations });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}
