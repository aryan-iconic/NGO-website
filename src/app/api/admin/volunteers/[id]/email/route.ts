import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { sendEmail } from "@/lib/email";

const schema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("ACCEPTANCE") }),
  z.object({ type: z.literal("WORK_UPDATE"), subject: z.string().trim().min(3).max(160), message: z.string().trim().min(5).max(5000) }),
]);

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message ?? "Invalid email" }, { status: 400 });
  const { id } = await params;
  const application = await prisma.volunteerApplication.findUnique({ where: { id } });
  if (!application) return NextResponse.json({ success: false, error: "Application not found" }, { status: 404 });
  if (parsed.data.type === "ACCEPTANCE" && application.status === "DECLINED") {
    return NextResponse.json({ success: false, error: "Change the application status before sending an acceptance" }, { status: 409 });
  }
  if (parsed.data.type === "WORK_UPDATE" && !["ACCEPTED", "ACTIVE"].includes(application.status)) {
    return NextResponse.json({ success: false, error: "Accept the applicant before sending volunteer work updates" }, { status: 409 });
  }

  const acceptance = parsed.data.type === "ACCEPTANCE";
  const subject = parsed.data.type === "ACCEPTANCE" ? "Your volunteer application has been accepted" : parsed.data.subject;
  const body = parsed.data.type === "ACCEPTANCE"
    ? `<p>Dear ${escapeHtml(application.name)},</p><p>We are pleased to accept your volunteer application with Shri Nityanikunj Trust.</p><p>Our team will contact you with orientation and next steps. Please reply to confirm that you would like to proceed.</p><p>Thank you,<br>Shri Nityanikunj Trust</p>`
    : `<p>Dear ${escapeHtml(application.name)},</p><p>${escapeHtml(parsed.data.message).replace(/\n/g, "<br>")}</p><p>Thank you,<br>Shri Nityanikunj Trust</p>`;
  if (!await sendEmail({ to: application.email, subject, html: body, requireConfiguration: true })) {
    return NextResponse.json({ success: false, error: "Email could not be sent. Check email configuration and try again." }, { status: 503 });
  }

  if (acceptance && application.status !== "ACTIVE" && application.status !== "ACCEPTED") {
    await prisma.volunteerApplication.update({ where: { id }, data: { status: "ACCEPTED" } });
  }
  await prisma.auditLog.create({ data: {
    actorType: "ADMIN", actorId: guard.admin.id,
    action: acceptance ? "VOLUNTEER_ACCEPTANCE_EMAIL_SENT" : "VOLUNTEER_WORK_EMAIL_SENT",
    entity: "VOLUNTEER_APPLICATION", entityId: id,
    newValue: acceptance
      ? { type: parsed.data.type, to: application.email, subject, sentAt: new Date().toISOString() }
      : { type: parsed.data.type, to: application.email, subject, message: parsed.data.type === "WORK_UPDATE" ? parsed.data.message : "", sentAt: new Date().toISOString() },
  } });
  return NextResponse.json({ success: true });
}
