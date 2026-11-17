import { sendEmail } from "@/lib/email";
import { formatPaise } from "@/lib/types";
import { prisma } from "@/lib/prisma";

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[char]!));

export interface DonationReceiptEmailInput {
  email: string;
  name: string;
  donationNumber: string;
  receiptNumber: string;
  amountPaise: number;
  paymentId: string;
  paymentMethod?: string;
  campaignTitle?: string | null;
  paidAt: string;
}

export async function sendDonationReceiptEmail(input: DonationReceiptEmailInput) {
  const paidAt = new Date(input.paidAt).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });
  const details: [string, string][] = [
    ["Donation number", input.donationNumber],
    ["Receipt number", input.receiptNumber],
    ["Amount received", formatPaise(input.amountPaise)],
    ["Razorpay payment ID", input.paymentId],
    ["Payment date", paidAt],
  ];
  if (input.campaignTitle) details.splice(3, 0, ["Campaign", input.campaignTitle]);
  if (input.paymentMethod) details.splice(input.campaignTitle ? 5 : 4, 0, ["Payment method", input.paymentMethod]);
  const rows = details.map(([label, value]) =>
    `<tr><th align="left" style="padding:10px;border:1px solid #eadfD1;color:#6b625b">${escapeHtml(label)}</th><td style="padding:10px;border:1px solid #eadfd1">${escapeHtml(value)}</td></tr>`,
  ).join("");

  const html = `<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#2d241f;line-height:1.6"><h1 style="color:#6f1d1b">Thank you for your donation</h1><p>Dear ${escapeHtml(input.name)},</p><p>We have received your donation. Please keep these details for your records:</p><table style="width:100%;border-collapse:collapse">${rows}</table><p style="margin-top:24px">This email confirms payment and is not an 80G tax exemption certificate. Any applicable tax certificate is issued separately.</p><p>With gratitude,<br /><strong>Shri Nityanikunj Ras Seva Sansthan Trust</strong></p></div>`;
  const idempotencyKey = `donation-receipt/${input.paymentId}`;
  const sent = await sendEmail({
    to: input.email,
    subject: `Donation receipt ${input.receiptNumber} — Shri Nityanikunj Trust`,
    html,
    requireConfiguration: true,
    idempotencyKey,
  });
  try {
    if (sent) {
      await prisma.emailDelivery.deleteMany({ where: { idempotencyKey } });
    } else {
      await prisma.emailDelivery.upsert({
        where: { idempotencyKey },
        update: { status: "PENDING", nextAttemptAt: new Date(Date.now() + 60_000), lastError: "Email provider did not accept the message." },
        create: { idempotencyKey, toEmail: input.email, subject: `Donation receipt ${input.receiptNumber} — Shri Nityanikunj Trust`, html, status: "PENDING", attempts: 0, lastError: "Email provider did not accept the message.", nextAttemptAt: new Date(Date.now() + 60_000) },
      });
    }
  } catch (error) {
    console.error("Could not update the durable donation email queue:", error);
  }
  return sent;
}
