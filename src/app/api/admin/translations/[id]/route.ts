import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdminId } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminId = await getCurrentAdminId();
    if (!adminId) {
      return NextResponse.json({ success: false, error: { message: "Unauthorized" } }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    
    const translation = await prisma.translation.update({
      where: { id },
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
