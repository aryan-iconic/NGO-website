import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await requireAdmin(req);
  const record = await db.getDonorTaxInformation(params.id);
  if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ record });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  await requireAdmin(req);
  const body = await req.json();
  const { status, form10bdStatus, form10beRef } = body;
  
  const record = await db.updateDonorTaxInformation(params.id, {
    ...(status ? { status } : {}),
    ...(form10bdStatus !== undefined ? { form10bdStatus } : {}),
    ...(form10beRef !== undefined ? { form10beRef } : {})
  });
  
  return NextResponse.json({ success: true, record });
}
