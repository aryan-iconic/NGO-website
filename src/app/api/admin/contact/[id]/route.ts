import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await requireAdmin(req);
  const inquiry = await db.getContactMessage(params.id);
  if (!inquiry) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ inquiry });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  await requireAdmin(req);
  const body = await req.json();
  if (body.status) {
    await db.updateContactMessageStatus(params.id, body.status);
  }
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await requireAdmin(req);
  await db.deleteContactMessage(params.id);
  return NextResponse.json({ success: true });
}
