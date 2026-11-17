import { NextResponse } from "next/server";
import { getMinimumDonationAmountPaise } from "@/lib/server-settings";

export async function GET() {
  return NextResponse.json({ minimumAmountPaise: await getMinimumDonationAmountPaise() }, { headers: { "Cache-Control": "no-store" } });
}
