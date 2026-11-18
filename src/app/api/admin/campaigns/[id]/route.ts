import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { z } from "zod";

const patchSchema = z.object({
  title: z.string().min(3).optional(),
  shortDescription: z.string().min(10).optional(),
  story: z.string().min(20).optional(),
  beneficiaryInfo: z.string().nullable().optional(),
  impactDescription: z.string().nullable().optional(),
  locationText: z.string().nullable().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "COMPLETED", "ARCHIVED"]).optional(),
  isFeatured: z.boolean().optional(),
  isUrgent: z.boolean().optional(),
  sevaAreaId: z.string().nullable().optional(),
  coverImage: z.string().optional().nullable(),
  donationMode: z.enum(["PRODUCTS", "GENERAL", "BOTH"]).optional(),
  allowCustomAmount: z.boolean().optional(),
  minimumAmountPaise: z.number().int().min(100).max(100_000_000).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin(["SUPER_ADMIN", "ADMIN", "CONTENT_ADMIN"]);
  if (guard.error) return guard.error;

  const { id } = await params;
  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message } },
      { status: 400 }
    );
  }
  const existing = await db.getCampaignById(id);
  if (!existing || existing.deletedAt) {
    return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Campaign not found." } }, { status: 404 });
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

  revalidatePath("/campaigns");
  revalidatePath(`/campaigns/${updated.slug}`);
  revalidatePath("/donate");
  revalidatePath("/");
  return NextResponse.json({ success: true, campaign: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin(["SUPER_ADMIN", "ADMIN", "CONTENT_ADMIN"]);
  if (guard.error) return guard.error;

  const { id } = await params;
  const existing = await db.getCampaignById(id);
  if (!existing || existing.deletedAt) {
    return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Campaign not found." } }, { status: 404 });
  }
  await db.deleteCampaign(id);

  await db.logAudit({
    actorType: "ADMIN",
    actorId: guard.admin!.id,
    actorName: guard.admin!.name,
    action: "CAMPAIGN_DELETED",
    entity: "campaign",
    entityId: id,
  });

  revalidatePath("/campaigns");
  revalidatePath(`/campaigns/${existing.slug}`);
  revalidatePath("/donate");
  revalidatePath("/");
  return NextResponse.json({ success: true });
}
