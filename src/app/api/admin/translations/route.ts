import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdminId } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const adminId = await getCurrentAdminId();
    if (!adminId) {
      return NextResponse.json({ success: false, error: { message: "Unauthorized" } }, { status: 401 });
    }

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

    const translations = await prisma.translation.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      take: 100, // Limit for now to prevent massive payloads
    });

    return NextResponse.json({ success: true, data: translations });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}
