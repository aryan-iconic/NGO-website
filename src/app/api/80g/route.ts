import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import prisma from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown-ip";
  if (!rateLimit(`80g_${ip}`, 5, 15 * 60 * 1000)) {
    return NextResponse.json({ success: false, error: { message: "Too many attempts. Try again later." } }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { receiptNumber, email, donorName, pan, addressLine1, addressLine2, city, state, pincode } = body;

    if (!receiptNumber || !email || !donorName || !pan || !addressLine1 || !city || !state || !pincode) {
      return NextResponse.json({ success: false, error: { message: "Missing required fields." } }, { status: 400 });
    }

    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan)) {
      return NextResponse.json({ success: false, error: { message: "Invalid PAN format." } }, { status: 400 });
    }

    // Lookup receipt
    const receipt = await prisma.receipt.findUnique({
      where: { receiptNumber },
      include: { donation: true }
    });

    if (!receipt || !receipt.donation) {
      return NextResponse.json({ success: false, error: { message: "Donation receipt not found." } }, { status: 404 });
    }

    // Verify email matches to prevent unauthorized lookup
    if (receipt.donation.donorEmail.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json({ success: false, error: { message: "Email does not match the donation record." } }, { status: 403 });
    }

    // Check if tax info already exists
    const existing = await db.getDonorTaxInformationByDonation(receipt.donationId);
    if (existing) {
      return NextResponse.json({ success: false, error: { message: "80G information has already been submitted for this donation." } }, { status: 400 });
    }

    // Create record
    await db.createDonorTaxInformation({
      donationId: receipt.donationId,
      donorName,
      email,
      pan,
      addressLine1,
      addressLine2: addressLine2 || null,
      city,
      state,
      pincode,
      status: "SUBMITTED"
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("80g Submission Error:", error);
    return NextResponse.json({ success: false, error: { message: "An unexpected error occurred." } }, { status: 500 });
  }
}
