import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { z } from "zod";

const statusSchema = z.enum(["REVIEWING", "ON_HOLD", "DECLINED", "ACTIVE"]);

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;
  const { id } = await params;
  const application = await prisma.volunteerApplication.findUnique({ where: { id } });
  if (!application) return NextResponse.json({ success: false, error: "Application not found" }, { status: 404 });
  const auditLogs = await prisma.auditLog.findMany({
    where: { entity: "VOLUNTEER_APPLICATION", entityId: id, action: { in: ["VOLUNTEER_ACCEPTANCE_EMAIL_SENT", "VOLUNTEER_WORK_EMAIL_SENT"] } },
    orderBy: { createdAt: "desc" },
  });
  let interests: unknown = [];
  try { interests = JSON.parse(application.interests); } catch { /* preserve malformed legacy data as empty */ }
  return NextResponse.json({
    success: true,
    application: { ...application, interests },
    communications: auditLogs.map((log) => ({ action: log.action, createdAt: log.createdAt, details: log.newValue })),
  });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;
  const parsed = statusSchema.safeParse((await request.json()).status);
  if (!parsed.success) return NextResponse.json({ success: false, error: "Invalid volunteer status" }, { status: 400 });
  const { id } = await params;
  const existing = await prisma.volunteerApplication.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ success: false, error: "Application not found" }, { status: 404 });
  if (parsed.data === "ACTIVE" && !["ACCEPTED", "ACTIVE"].includes(existing.status)) {
    return NextResponse.json({ success: false, error: "Send an acceptance email before marking this volunteer active" }, { status: 409 });
  }
  const application = await prisma.volunteerApplication.update({ where: { id }, data: { status: parsed.data } });
  await prisma.auditLog.create({ data: {
    actorType: "ADMIN", actorId: guard.admin.id, action: "VOLUNTEER_STATUS_UPDATED",
    entity: "VOLUNTEER_APPLICATION", entityId: id,
    oldValue: { status: existing.status }, newValue: { status: parsed.data },
  } });
  return NextResponse.json({ success: true, application });
}
