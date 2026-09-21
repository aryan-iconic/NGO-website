import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { z } from "zod";

const patchSchema = z.object({
  title: z.string().min(3).optional(),
  shortDescription: z.string().min(10).optional(),
  story: z.string().min(20).optional(),
  status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "COMPLETED", "ARCHIVED"]).optional(),
  isFeatured: z.boolean().optional(),
  isUrgent: z.boolean().optional(),
  sevaAreaId: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const { id } = await params;
  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message } },
      { status: 400 }
    );
  }

  const updated = await db.updateCampaign(id, parsed.data);
  if (!updated) {
    return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Campaign not found." } }, { status: 404 });
  }

  await db.logAudit({
    actorType: "ADMIN",
    actorId: guard.admin!.id,
    actorName: guard.admin!.name,
    action: parsed.data.status ? `STATUS_CHANGED_TO_${parsed.data.status}` : "CAMPAIGN_UPDATED",
    entity: "campaign",
    entityId: updated.id,
  });

  return NextResponse.json({ success: true, campaign: updated });
}
