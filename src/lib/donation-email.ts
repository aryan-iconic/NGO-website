import { sendEmail } from "@/lib/email";
import { formatPaise } from "@/lib/types";

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[char]!));

export async function sendDonationReceiptEmail(input: {
  email: string;
  name: string;
  receiptNumber: string;
  amountPaise: number;
}) {
  return sendEmail({
    to: input.email,
    subject: "Your donation receipt — Shri Nityanikunj Trust",
    html: `<p>Dear ${escapeHtml(input.name)},</p><p>Thank you for your donation of ${formatPaise(input.amountPaise)}.</p><p>Your receipt number is <strong>${escapeHtml(input.receiptNumber)}</strong>.</p><p>Shri Nityanikunj Ras Seva Sansthan Trust</p>`,
  });
}
