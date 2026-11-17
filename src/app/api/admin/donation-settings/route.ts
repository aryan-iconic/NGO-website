import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

const donationSettingsSchema = z.object({ minimumAmountPaise: z.number().int().min(100).max(100_000_000) });

export async function GET() {
  const auth = await requireAdmin(["SUPER_ADMIN", "ADMIN", "FINANCE_ADMIN"]);
  if (auth.error) return auth.error;

  try {
    const setting = await prisma.setting.findUnique({ where: { key: "donation.minimumAmountPaise" }, select: { value: true } });
    const amount = Number(setting?.value);
    return NextResponse.json({
      success: true,
      data: { minimumAmountPaise: Number.isSafeInteger(amount) && amount >= 100 ? amount : 100 },
    });
  } catch (error) {
    console.error("Could not load donation settings:", error);
    return NextResponse.json({ success: false, error: { message: "Could not load donation settings." } }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin(["SUPER_ADMIN", "ADMIN", "FINANCE_ADMIN"]);
  if (auth.error) return auth.error;

  try {
    const parsed = donationSettingsSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: { message: "Minimum donation must be between ₹1 and ₹1,000,000." } }, { status: 400 });
    }
    const { minimumAmountPaise } = parsed.data;
    await prisma.setting.upsert({
      where: { key: "donation.minimumAmountPaise" },
      update: { value: String(minimumAmountPaise) },
      create: { key: "donation.minimumAmountPaise", value: String(minimumAmountPaise), translations: {} },
    });
    revalidateTag("public-site-settings", { expire: 0 });
    return NextResponse.json({ success: true, data: { minimumAmountPaise } });
  } catch (error) {
    console.error("Could not save donation settings:", error);
    return NextResponse.json({ success: false, error: { message: "Could not save donation settings." } }, { status: 500 });
  }
}
