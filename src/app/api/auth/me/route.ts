import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ success: true, user: null });
  const user = db.findUserById(userId);
  if (!user) return NextResponse.json({ success: true, user: null });
  return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
}
