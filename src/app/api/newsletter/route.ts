import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { newsletterSchema } from "@/lib/schemas";
import { sendEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown-ip";
  if (!rateLimit(`newsletter_${ip}`, 3, 60 * 60 * 1000)) {
    return NextResponse.json({ success: false, error: { message: "Too many requests. Try again later." } }, { status: 429 });
  }

  const parsed = newsletterSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message } },
      { status: 400 }
    );
  }

  try {
    const existing = await db.getNewsletterSubscriberByEmail(parsed.data.email);
    if (existing && existing.status === "SUBSCRIBED") {
      return NextResponse.json({ success: false, error: { message: "Already subscribed." } }, { status: 400 });
    }

    if (existing) {
      await db.updateNewsletterSubscriber(existing.id, { 
        status: "SUBSCRIBED", 
        name: parsed.data.name, 
        city: parsed.data.city,
        subscribedAt: new Date(),
        unsubscribedAt: null
      });
    } else {
      await db.createNewsletterSubscriber(parsed.data);
    }

    // Send welcome email
    await sendEmail({
      to: parsed.data.email,
      subject: "Welcome to Charanvandan Newsletter",
      html: `
        <h2>Receive a Little Divine Inspiration</h2>
        <p>Dear ${parsed.data.name},</p>
        <p>Thank you for subscribing to the Charanvandan weekly newsletter. We will send you our latest stories, seva updates, and spiritual insights directly to your inbox.</p>
        <p>Warm regards,<br>The Charanvandan Team</p>
        <hr>
        <p style="font-size: 12px; color: #666;">
          You are receiving this because you subscribed on our website. 
          <a href="${process.env.NEXT_PUBLIC_BASE_URL || "https://charanvandan.org"}/api/newsletter/unsubscribe?email=${encodeURIComponent(parsed.data.email)}">Unsubscribe here</a>
        </p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: { message: err.message } }, { status: 500 });
  }
}
