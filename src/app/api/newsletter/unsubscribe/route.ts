import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email) {
    return new NextResponse("Missing email parameter", { status: 400 });
  }

  const existing = await db.getNewsletterSubscriberByEmail(email);
  if (!existing) {
    return new NextResponse("Subscriber not found", { status: 404 });
  }

  if (existing.status === "SUBSCRIBED") {
    await db.updateNewsletterSubscriber(existing.id, {
      status: "UNSUBSCRIBED",
      unsubscribedAt: new Date()
    });
  }

  return new NextResponse(`
    <html>
      <body style="font-family: sans-serif; text-align: center; padding: 50px;">
        <h2>Unsubscribed Successfully</h2>
        <p>You have been removed from our newsletter. We're sorry to see you go!</p>
      </body>
    </html>
  `, { headers: { "Content-Type": "text/html" } });
}
