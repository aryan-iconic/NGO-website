import { NextRequest, NextResponse } from "next/server";
import { verifyReceiptConfirmationToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("confirmation") || "";
  if (token.length > 2048) return NextResponse.json({ success: false }, { status: 400 });
  const confirmation = verifyReceiptConfirmationToken(token);
  if (!confirmation) return NextResponse.json({ success: false, error: { message: "This payment confirmation is invalid or expired." } }, { status: 404 });
  return NextResponse.json({ success: true, ...confirmation }, { headers: { "Cache-Control": "no-store" } });
}
