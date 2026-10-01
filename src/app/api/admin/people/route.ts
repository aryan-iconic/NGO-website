import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.string().min(1, "Role is required"),
  bio: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  displayOrder: z.number().int().default(0),
  isPublished: z.boolean().default(false),
});

export async function GET() {
  await requireAdmin();
  const people = await db.listTeamMembers(true);
  return NextResponse.json({ success: true, data: people });
}

export async function POST(req: Request) {
  await requireAdmin();
  try {
    const json = await req.json();
    const data = schema.parse(json);
    const person = await db.createTeamMember(data);
    revalidatePath("/about");
    return NextResponse.json({ success: true, data: person });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 400 });
  }
}
