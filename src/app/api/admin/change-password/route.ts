import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { clearAdminPasswordChangeSession, createAdminSession, getAdminPasswordChangeId } from "@/lib/auth";

const schema = z.object({ password: z.string().min(12, "Use at least 12 characters."), confirmPassword: z.string() }).refine((data) => data.password === data.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match." });

export async function POST(req: NextRequest) {
  const adminId = await getAdminPasswordChangeId();
  if (!adminId) return NextResponse.json({ success: false, error: { message: "This password-change session expired. Sign in again." } }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ success: false, error: { message: parsed.error.issues[0]?.message || "Invalid password." } }, { status: 400 });
  await db.changeAdminPassword(adminId, parsed.data.password);
  await clearAdminPasswordChangeSession();
  await createAdminSession(adminId);
  return NextResponse.json({ success: true });
}
