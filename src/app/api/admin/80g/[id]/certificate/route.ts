import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { sendEmail } from "@/lib/email";

export const runtime = "nodejs";

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[char]!));

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const adminRes = await requireAdmin();
  if (adminRes.error) return adminRes.error;

  try {
    const { id } = await params;
    const record = await db.getDonorTaxInformation(id);
    if (!record) return NextResponse.json({ success: false, error: "80G request not found." }, { status: 404 });

    const formData = await req.formData();
    const certificate = formData.get("certificate");
    if (!(certificate instanceof File)) {
      return NextResponse.json({ success: false, error: "Attach the official Form 114 PDF." }, { status: 400 });
    }
    if (certificate.size < 5 || certificate.size > 10 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: "Certificate must be a PDF smaller than 10 MB." }, { status: 400 });
    }

    const content = Buffer.from(await certificate.arrayBuffer());
    if (certificate.type !== "application/pdf" || content.subarray(0, 5).toString("ascii") !== "%PDF-") {
      return NextResponse.json({ success: false, error: "The uploaded file is not a valid PDF." }, { status: 400 });
    }

    const emailSent = await sendEmail({
      to: record.email,
      subject: "Your official donation certificate — Shri Nityanikunj Trust",
      html: `<p>Dear ${escapeHtml(record.donorName)},</p><p>Please find your official donation certificate attached.</p><p>For questions, contact Shri Nityanikunj Trust.</p>`,
      attachments: [{ filename: "Form-114-Donation-Certificate.pdf", content, contentType: "application/pdf" }],
      requireConfiguration: true,
    });
    if (!emailSent) {
      return NextResponse.json({ success: false, error: "Email could not be sent. Check the email server configuration and try again." }, { status: 503 });
    }

    const updated = await db.updateDonorTaxInformation(id, {
      status: "FORM_114_SENT",
      form10beRef: `Emailed to ${record.email} on ${new Date().toISOString()}`,
    });
    return NextResponse.json({ success: true, record: updated });
  } catch (error) {
    console.error("Form 114 email error:", error);
    return NextResponse.json({ success: false, error: "Could not email the certificate." }, { status: 500 });
  }
}
