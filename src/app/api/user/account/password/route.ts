import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { clearUserSession, createUserSession, getCurrentUserId } from "@/lib/auth";

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(12).max(128),
});

export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ success: false, error: { message: "Please sign in." } }, { status: 401 });
  const parsed = passwordSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ success: false, error: { message: "Enter your current password and a new password of at least 12 characters." } }, { status: 400 });

  const user = await db.findUserById(userId);
  const verified = user && await db.verifyUserPassword(user.email, parsed.data.currentPassword);
  if (!user || !verified || verified.id !== user.id) {
    return NextResponse.json({ success: false, error: { message: "Your current password is incorrect." } }, { status: 400 });
  }

  try {
    await db.updateUserPassword(userId, parsed.data.newPassword);
    await clearUserSession();
    await createUserSession(userId, user.name);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Could not change donor password:", error);
    return NextResponse.json({ success: false, error: { message: "Could not update your password." } }, { status: 500 });
  }
}
