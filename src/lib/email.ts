import nodemailer from "nodemailer";

const host = process.env.EMAIL_HOST;
const port = parseInt(process.env.EMAIL_PORT || "465", 10);
const user = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASSWORD;
const fromAddress = process.env.EMAIL_FROM || "onboarding@resend.dev";

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: { user, pass },
});

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  if (!host || !user || !pass) {
    console.warn("Email configuration missing. Simulating email send:");
    console.warn("To:", to);
    console.warn("Subject:", subject);
    return true; // Fake success for local dev without config
  }

  try {
    const info = await transporter.sendMail({
      from: `"Shri Nityanikunj Trust" <${fromAddress}>`,
      to,
      subject,
      html,
    });
    console.log("Email sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}
