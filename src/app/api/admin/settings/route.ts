import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { z } from "zod";

const settingsSchema = z.record(
  z.string(),
  z.union([
    z.string(),
    z.object({
      value: z.string(),
      translations: z.record(z.string(), z.string()).optional(),
    }),
  ])
);

export async function GET(request: NextRequest) {
  try {
    const { admin, error } = await requireAdmin();
    if (error) return error;

    const settings = await prisma.setting.findMany();
    const settingsMap = settings.reduce((acc: any, curr: any) => ({
      ...acc,
      [curr.key]: { value: curr.value, translations: curr.translations },
    }), {});
    
    revalidatePath("/", "layout");
    return NextResponse.json({ success: true, data: settingsMap });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: { message: "Internal Server Error" } }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { admin, error } = await requireAdmin();
    if (error) return error;

    const body = await request.json();
    const result = settingsSchema.safeParse(body);
    if (!result.success) return NextResponse.json({ success: false, error: result.error }, { status: 400 });

    const updates = result.data;
    
    await prisma.$transaction(
      Object.entries(updates).map(([key, data]) => {
        const val = typeof data === "string" ? data : data.value;
        const translations = typeof data === "string" ? undefined : data.translations;
        
        return prisma.setting.upsert({
          where: { key },
          update: { value: val, translations: translations ?? undefined },
          create: { key, value: val, translations: translations ?? undefined },
        });
      })
    );

    revalidatePath("/", "layout");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: { message: "Internal Server Error" } }, { status: 500 });
  }
}
