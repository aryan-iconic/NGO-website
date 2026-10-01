import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { statutoryRegistrationSchema } from "@/lib/schemas";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  await requireAdmin(req);
  const parsed = statutoryRegistrationSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const reg = await db.updateStatutoryRegistration(params.id, parsed.data);
  return NextResponse.json({ success: true, reg });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await requireAdmin(req);
  await db.deleteStatutoryRegistration(params.id);
  return NextResponse.json({ success: true });
}
