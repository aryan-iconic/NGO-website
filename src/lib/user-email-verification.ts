import { createEmailVerificationToken } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[char]!));

export async function sendUserEmailVerification(user: { id: string; name: string; email: string }) {
  const token = createEmailVerificationToken(user.id, user.email);
  const siteUrl = (process.env.APP_URL || "https://www.shrinityanikunjtrust.com").replace(/\/$/, "");
  const verificationUrl = `${siteUrl}/verify-email?token=${encodeURIComponent(token)}`;

  return sendEmail({
    to: user.email,
    subject: "Verify your email — Shri Nityanikunj Trust",
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#2d241f;line-height:1.6"><h1 style="color:#6f1d1b">Verify your email</h1><p>Hello ${escapeHtml(user.name)},</p><p>Verify this email address to finish creating your account and securely link donations made using this same address.</p><p><a href="${verificationUrl}" style="display:inline-block;padding:12px 20px;border-radius:8px;background:#d97706;color:#fff;text-decoration:none;font-weight:bold">Verify email address</a></p><p>This link expires in 24 hours. If you did not request an account, you can ignore this email.</p><p>Shri Nityanikunj Ras Seva Sansthan Trust</p></div>`,
    requireConfiguration: true,
  });
}
