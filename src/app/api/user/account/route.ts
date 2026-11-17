import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";

const profileSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().max(32).optional(),
});

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ success: false, error: { message: "Please sign in." } }, { status: 401 });
  const user = await db.findUserById(userId);
  if (!user) return NextResponse.json({ success: false, error: { message: "Account not found." } }, { status: 404 });
  return NextResponse.json({ success: true, user: { name: user.name, email: user.email, phone: user.phone ?? "", emailVerified: Boolean(user.emailVerifiedAt), memberSince: user.createdAt } });
}

export async function PATCH(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ success: false, error: { message: "Please sign in." } }, { status: 401 });
  const parsed = profileSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ success: false, error: { message: "Enter a name with at least 2 characters and a valid phone number." } }, { status: 400 });
  try {
    const user = await db.updateUserProfile(userId, parsed.data.name, parsed.data.phone?.trim() || null);
    return NextResponse.json({ success: true, user: { name: user.name, email: user.email, phone: user.phone ?? "" } });
  } catch (error) {
    console.error("Could not update donor profile:", error);
    return NextResponse.json({ success: false, error: { message: "Could not update your profile." } }, { status: 500 });
  }
}
