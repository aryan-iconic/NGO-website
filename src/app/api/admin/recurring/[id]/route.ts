import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

const schema = z.object({ isActive: z.boolean() });

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(["SUPER_ADMIN", "ADMIN", "FINANCE_ADMIN"]);
  if (auth.error) return auth.error;
  const { id } = await params;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ success: false, error: { message: "Invalid plan update." } }, { status: 400 });
  try {
    const plan = await prisma.monthlyGivingPlan.update({ where: { id }, data: { isActive: parsed.data.isActive } });
    return NextResponse.json({ success: true, plan });
  } catch {
    return NextResponse.json({ success: false, error: { message: "Monthly giving plan not found." } }, { status: 404 });
  }
}
