import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const body = await req.json();
    
    const translation = await db.prisma.translation.update({
      where: { id: params.id },
      data: {
        translatedText: body.translatedText,
        status: body.status,
        isManual: body.isManual,
      },
    });

    return NextResponse.json({ success: true, data: translation });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}
