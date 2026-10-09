import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { z } from "zod";
import { getWhatsAppHref } from "@/lib/whatsapp";

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

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const settings = await prisma.setting.findMany();
    const settingsMap = Object.fromEntries(settings.map((setting) => [setting.key, { value: setting.value, translations: setting.translations }]));
    
    revalidatePath("/", "layout");
    return NextResponse.json({ success: true, data: settingsMap });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: { message: "Internal Server Error" } }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const body = await request.json();
    const result = settingsSchema.safeParse(body);
    if (!result.success) return NextResponse.json({ success: false, error: result.error }, { status: 400 });

    const updates = result.data;

    if (Object.hasOwn(updates, "contact.whatsapp")) {
      const rawWhatsApp = updates["contact.whatsapp"];
      const value = typeof rawWhatsApp === "string" ? rawWhatsApp : rawWhatsApp.value;
      if (value.trim() && !getWhatsAppHref(value)) {
        return NextResponse.json({ success: false, error: { message: "Enter a WhatsApp number with country code or a valid https://wa.me link." } }, { status: 400 });
      }
    }
    
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
