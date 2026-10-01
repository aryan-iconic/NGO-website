import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const adminRes = await requireAdmin();
  if (adminRes.error) return adminRes.error;
  
  const { id } = await params;
  const inquiry = await db.getContactMessage(id);
  if (!inquiry) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ inquiry });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const adminRes = await requireAdmin();
  if (adminRes.error) return adminRes.error;
  
  const { id } = await params;
  const body = await req.json();
  if (body.status) {
    await db.updateContactMessageStatus(id, body.status);
  }
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const adminRes = await requireAdmin();
  if (adminRes.error) return adminRes.error;
  
  const { id } = await params;
  await db.deleteContactMessage(id);
  return NextResponse.json({ success: true });
}
