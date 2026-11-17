import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { clearUserSession, getCurrentUserId } from "@/lib/auth";
import { db } from "@/lib/db";

const deleteSchema = z.object({ currentPassword: z.string().min(1), confirmation: z.literal("DELETE") });

export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ success: false, error: { message: "Please sign in again before deleting your account." } }, { status: 401 });
  const parsed = deleteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ success: false, error: { message: "Enter your current password and type DELETE to confirm." } }, { status: 400 });

  const user = await db.findUserById(userId);
  const verified = user && await db.verifyUserPassword(user.email, parsed.data.currentPassword);
  if (!user || !verified || verified.id !== user.id) {
    return NextResponse.json({ success: false, error: { message: "Your current password is incorrect." } }, { status: 400 });
  }

  try {
    await db.deactivateUserAccount(userId);
    await clearUserSession();
    return NextResponse.json({ success: true, message: "Your account is deactivated. Donation and receipt records are retained." });
  } catch (error) {
    console.error("Could not deactivate donor account:", error);
    return NextResponse.json({ success: false, error: { message: "Could not deactivate your account." } }, { status: 500 });
  }
}
