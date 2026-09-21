import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserId, getCurrentAdminId } from "@/lib/auth";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  const adminId = await getCurrentAdminId();

  if (!userId && !adminId) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Sign in required." } }, { status: 401 });
  }

  const cancelled = db.cancelRecurring(id, adminId ? undefined : userId!);
  if (!cancelled) {
    return NextResponse.json(
      { success: false, error: { code: "NOT_FOUND", message: "Recurring donation not found." } },
      { status: 404 }
    );
  }
  return NextResponse.json({ success: true, recurring: cancelled });
}
