import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contactSchema } from "@/lib/schemas";
import { sendEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown-ip";
  if (!rateLimit(`contact_${ip}`, 3, 60 * 60 * 1000)) {
    return NextResponse.json({ success: false, error: { message: "Too many requests. Try again later." } }, { status: 429 });
  }

  const parsed = contactSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message } },
      { status: 400 }
    );
  }

  // 1. Save to database
  const msg = await db.createContactMessage(parsed.data);

  // 2. Send email to admin
  const adminEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";
  await sendEmail({
    to: adminEmail,
    subject: `New Contact Inquiry: ${parsed.data.name}`,
    html: `
      <h2>New Inquiry from Website</h2>
      <p><strong>Name:</strong> ${parsed.data.name}</p>
      <p><strong>Email:</strong> ${parsed.data.email}</p>
      <p><strong>Phone:</strong> ${parsed.data.phone || "Not provided"}</p>
      <p><strong>Message:</strong></p>
      <blockquote style="border-left: 4px solid #ccc; padding-left: 10px;">
        ${parsed.data.message.replace(/\n/g, "<br>")}
      </blockquote>
    `,
  });

  // 3. Send acknowledgement to user
  await sendEmail({
    to: parsed.data.email,
    subject: "Thank you for contacting Charanvandan",
    html: `
      <p>Dear ${parsed.data.name},</p>
      <p>Thank you for reaching out to us. We have received your inquiry and will get back to you shortly.</p>
      <p><strong>Your message:</strong></p>
      <blockquote style="border-left: 4px solid #ccc; padding-left: 10px;">
        ${parsed.data.message.replace(/\n/g, "<br>")}
      </blockquote>
      <p>Warm regards,<br>The Charanvandan Team</p>
    `,
  });

  return NextResponse.json({ success: true, messageId: msg.id });
}
