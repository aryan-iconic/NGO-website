import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";

export async function POST(_req: NextRequest) {
  return NextResponse.json({ success: false, error: { code: "RECURRING_UNAVAILABLE", message: "Monthly donations are temporarily unavailable. Please use the one-time donation option." } }, { status: 503 });
}

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Sign in required." } }, { status: 401 });
  return NextResponse.json({ success: true, enabled: false, recurring: [] });
}
