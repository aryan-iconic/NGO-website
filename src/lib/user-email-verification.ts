import { createEmailVerificationToken, createPasswordResetToken } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[char]!));

export async function sendUserEmailVerification(user: { id: string; name: string; email: string }, options: { restoringAccount?: boolean } = {}) {
  const token = createEmailVerificationToken(user.id, user.email);
  const siteUrl = (process.env.APP_URL || "https://www.shrinityanikunjtrust.com").replace(/\/$/, "");
  const verificationUrl = `${siteUrl}/verify-email?token=${encodeURIComponent(token)}`;

  return sendEmail({
    to: user.email,
    subject: options.restoringAccount ? "Restore your account — Shri Nityanikunj Trust" : "Verify your email — Shri Nityanikunj Trust",
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#2d241f;line-height:1.6"><h1 style="color:#6f1d1b">${options.restoringAccount ? "Restore your account" : "Verify your email"}</h1><p>Hello ${escapeHtml(user.name)},</p><p>${options.restoringAccount ? "Confirm that you own this email address, then choose a new password to restore access to your account and retained donation history." : "Verify this email address to finish creating your account and securely link donations made using this same address."}</p><p><a href="${verificationUrl}" style="display:inline-block;padding:12px 20px;border-radius:8px;background:#d97706;color:#fff;text-decoration:none;font-weight:bold">${options.restoringAccount ? "Restore account" : "Verify email address"}</a></p><p>This link expires in 24 hours. If you did not request this, you can ignore this email.</p><p>Shri Nityanikunj Ras Seva Sansthan Trust</p></div>`,
    requireConfiguration: true,
  });
}

export async function sendUserPasswordReset(user: { id: string; name: string; email: string; sessionVersion: number }) {
  const token = createPasswordResetToken(user.id, user.email, user.sessionVersion);
  const siteUrl = (process.env.APP_URL || "https://www.shrinityanikunjtrust.com").replace(/\/$/, "");
  const resetUrl = `${siteUrl}/reset-password?token=${encodeURIComponent(token)}`;
  return sendEmail({
    to: user.email,
    subject: "Reset your password — Shri Nityanikunj Trust",
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#2d241f;line-height:1.6"><h1 style="color:#6f1d1b">Reset your password</h1><p>Hello ${escapeHtml(user.name)},</p><p>Use the link below to choose a new password for your donor account. This link expires in one hour and can only be used once.</p><p><a href="${resetUrl}" style="display:inline-block;padding:12px 20px;border-radius:8px;background:#d97706;color:#fff;text-decoration:none;font-weight:bold">Reset password</a></p><p>If you did not request this, you can ignore this email.</p><p>Shri Nityanikunj Ras Seva Sansthan Trust</p></div>`,
    requireConfiguration: true,
  });
}
