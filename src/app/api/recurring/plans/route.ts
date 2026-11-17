import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const plans = await prisma.monthlyGivingPlan.findMany({
      where: { isActive: true },
      select: { id: true, name: true, description: true, amountPaise: true, totalCycles: true },
      orderBy: [{ amountPaise: "asc" }, { createdAt: "asc" }],
    });
    return NextResponse.json({ success: true, plans }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
  } catch (error) {
    console.error("Could not load monthly giving plans:", error);
    return NextResponse.json({ success: false, error: { message: "Monthly giving plans are temporarily unavailable." } }, { status: 500 });
  }
}
