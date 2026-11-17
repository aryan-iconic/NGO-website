import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyNewsletterUnsubscribeToken } from "@/lib/auth";

function page(message: string, token?: string) {
  const form = token ? `<form method="post"><input type="hidden" name="token" value="${token.replace(/[&<>"']/g, "")}"><button style="padding:12px 20px;background:#6f1d1b;color:#fff;border:0;border-radius:8px" type="submit">Confirm unsubscribe</button></form>` : "";
  return new NextResponse(`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Newsletter preferences</title><body style="font-family:Arial,sans-serif;max-width:560px;margin:80px auto;padding:24px;text-align:center;color:#2d241f"><h1>${message}</h1>${form}</body></html>`, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") || "";
  if (!verifyNewsletterUnsubscribeToken(token)) return page("This unsubscribe link is invalid or expired.");
  return page("Confirm that you want to unsubscribe", token);
}

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const email = verifyNewsletterUnsubscribeToken(String(form.get("token") || ""));
  if (!email) return page("This unsubscribe link is invalid or expired.");
  const existing = await db.getNewsletterSubscriberByEmail(email);
  if (existing?.status === "SUBSCRIBED") {
    await db.updateNewsletterSubscriber(existing.id, { status: "UNSUBSCRIBED", unsubscribedAt: new Date() });
  }
  return page("You are unsubscribed from the newsletter.");
}
