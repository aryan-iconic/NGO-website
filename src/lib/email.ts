import nodemailer from "nodemailer";

const resendApiKey = process.env.RESEND_API_KEY;
const host = process.env.EMAIL_HOST;
const port = Number.parseInt(process.env.EMAIL_PORT || "465", 10);
const user = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASSWORD;
const fromAddress = process.env.EMAIL_FROM?.trim();

function formatFromAddress(address: string) {
  return address.includes("<")
    ? address
    : `"Shri Nityanikunj Trust" <${address}>`;
}

export async function sendEmail({
  to,
  subject,
  html,
  attachments,
  requireConfiguration = false,
  idempotencyKey,
}: {
  to: string | string[];
  subject: string;
  html: string;
  attachments?: Array<{ filename: string; content: Buffer; contentType: string }>;
  requireConfiguration?: boolean;
  idempotencyKey?: string;
}) {
  if (resendApiKey) {
    if (!fromAddress) {
      console.error("Resend requires EMAIL_FROM to be set to an address on a verified sending domain.");
      return false;
    }
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
          ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
        },
        body: JSON.stringify({
          from: formatFromAddress(fromAddress),
          to: Array.isArray(to) ? to : [to],
          subject,
          html,
          ...(attachments?.length
            ? {
                attachments: attachments.map((attachment) => ({
                  filename: attachment.filename,
                  content: attachment.content.toString("base64"),
                  content_type: attachment.contentType,
                })),
              }
            : {}),
        }),
        cache: "no-store",
      });
      const responseBody = await response.text();
      if (!response.ok) {
        console.error(`Resend email API returned ${response.status}:`, responseBody);
        return false;
      }

      let messageId = "accepted";
      try {
        messageId = JSON.parse(responseBody).id || messageId;
      } catch {
        // A successful API response is enough to confirm acceptance.
      }
      console.info("Resend accepted email:", messageId);
      return true;
    } catch (error) {
      console.error("Resend email request failed:", error);
      return false;
    }
  }

  if (host && user && pass) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      const info = await transporter.sendMail({
        from: formatFromAddress(fromAddress || "onboarding@resend.dev"),
        to,
        subject,
        html,
        attachments,
      });
      console.info("Email sent:", info.messageId);
      return true;
    } catch (error) {
      console.error("SMTP email send failed:", error);
      return false;
    }
  }

  const message = "Email is not configured. Set RESEND_API_KEY and EMAIL_FROM, or configure SMTP.";
  if (requireConfiguration) console.error(message);
  else console.warn(message);
  return false;
}
