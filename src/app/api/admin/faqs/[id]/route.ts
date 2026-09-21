import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { z } from "zod";

const schema = z.object({
  question: z.string().min(3).optional(),
  answer: z.string().min(3).optional(),
  category: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;
  const { id } = await params;

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message } },
      { status: 400 }
    );
  }
  const updated = db.updateFaq(id, parsed.data);
  if (!updated) return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "FAQ not found." } }, { status: 404 });
  return NextResponse.json({ success: true, faq: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;
  const { id } = await params;
  const ok = db.deleteFaq(id);
  if (!ok) return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "FAQ not found." } }, { status: 404 });
  return NextResponse.json({ success: true });
}
