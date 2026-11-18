import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getLocale } from "@/lib/get-locale";
import { resolveLocalizedRecord } from "@/lib/translation";

export async function GET() {
  try {
    const locale = await getLocale();
    const plans = await prisma.monthlyGivingPlan.findMany({
      where: { isActive: true },
      select: { id: true, name: true, description: true, amountPaise: true, totalCycles: true },
      orderBy: [{ amountPaise: "asc" }, { createdAt: "asc" }],
    });
    const localizedPlans = plans.map((plan) => resolveLocalizedRecord(plan, locale));
    return NextResponse.json({ success: true, plans: localizedPlans }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Could not load monthly giving plans:", error);
    return NextResponse.json({ success: false, error: { message: "Monthly giving plans are temporarily unavailable." } }, { status: 500 });
  }
}
