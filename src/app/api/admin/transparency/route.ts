import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { statutoryRegistrationSchema } from "@/lib/schemas";

export async function POST(req: NextRequest) {
  await requireAdmin(req);
  const parsed = statutoryRegistrationSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const reg = await db.createStatutoryRegistration(parsed.data);
  return NextResponse.json({ success: true, reg });
}
