import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.string().min(1, "Role is required"),
  bio: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  displayOrder: z.number().int().default(0),
  isPublished: z.boolean().default(false),
});

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireAdmin();
  const person = await db.getTeamMember(id);
  if (!person) return NextResponse.json({ success: false, error: { message: "Not found" } }, { status: 404 });
  return NextResponse.json({ success: true, data: person });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireAdmin();
  try {
    const json = await req.json();
    const data = schema.parse(json);
    const person = await db.updateTeamMember(id, data);
    revalidatePath("/about");
    return NextResponse.json({ success: true, data: person });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireAdmin();
  try {
    await db.deleteTeamMember(id);
    revalidatePath("/about");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 400 });
  }
}
