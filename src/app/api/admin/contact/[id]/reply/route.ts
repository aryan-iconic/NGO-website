import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { sendEmail } from "@/lib/email";

const replySchema = z.object({
  subject: z.string().trim().min(2).max(160),
  message: z.string().trim().min(2).max(5000),
  template: z.enum(["ACKNOWLEDGE", "MORE_INFORMATION", "FOLLOW_UP", "CUSTOM"]),
});

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const adminRes = await requireAdmin();
  if (adminRes.error) return adminRes.error;

  const parsed = replySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message ?? "Invalid reply." } }, { status: 400 });
  }
  const { id } = await params;
  const inquiry = await prisma.contactMessage.findUnique({ where: { id } });
  if (!inquiry) return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Inquiry not found." } }, { status: 404 });

  const htmlMessage = escapeHtml(parsed.data.message).replace(/\n/g, "<br>");
  const sent = await sendEmail({
    to: inquiry.email,
    subject: parsed.data.subject,
    html: `<p>Dear ${escapeHtml(inquiry.name)},</p><p>${htmlMessage}</p><hr><p style="font-size:12px;color:#666">Regarding your inquiry to Shri Nityanikunj Trust${inquiry.subject ? ` about “${escapeHtml(inquiry.subject)}”` : ""}.</p><p>Warm regards,<br>Shri Nityanikunj Trust</p>`,
    requireConfiguration: true,
  });
  if (!sent) {
    return NextResponse.json({ success: false, error: { code: "EMAIL_SEND_FAILED", message: "Reply could not be sent. Check the email configuration and try again." } }, { status: 503 });
  }

  await prisma.contactMessage.update({ where: { id }, data: { status: "READ" } });
  await prisma.auditLog.create({ data: {
    actorType: "ADMIN", actorId: adminRes.admin.id,
    action: "CONTACT_INQUIRY_REPLY_SENT", entity: "CONTACT_MESSAGE", entityId: id,
    newValue: { to: inquiry.email, subject: parsed.data.subject, template: parsed.data.template, message: parsed.data.message, sentAt: new Date().toISOString() },
  } });
  return NextResponse.json({ success: true });
}
