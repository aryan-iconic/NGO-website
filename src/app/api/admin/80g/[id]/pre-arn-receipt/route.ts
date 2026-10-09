import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { sendEmail } from "@/lib/email";

export const runtime = "nodejs";

type PreArnEntry = { arn: string; status: "AVAILABLE" | "ASSIGNED" | "ISSUED"; donorTaxInformationId?: string; assignedAt?: string; issuedAt?: string };
const profileKeyNames = ["name", "pan", "urn", "approval_number", "address", "email", "phone"];
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[char]!));

function getTaxYear(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", year: "numeric", month: "numeric" }).formatToParts(date);
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const startYear = month >= 4 ? year : year - 1;
  return `${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}`;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "long", timeZone: "Asia/Kolkata" }).format(date);
}

function parseEntries(value?: string | null): PreArnEntry[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((entry) => entry && typeof entry.arn === "string") : [];
  } catch {
    return [];
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const adminRes = await requireAdmin();
  if (adminRes.error) return adminRes.error;

  try {
    const { id } = await params;
    const body = await req.json();
    const preArn = typeof body.preArn === "string" ? body.preArn.trim() : "";
    if (!/^[A-Za-z0-9]{1,21}$/.test(preArn)) {
      return NextResponse.json({ success: false, error: "Select a valid imported Pre-ARN." }, { status: 400 });
    }

    const record = await db.getDonorTaxInformation(id);
    if (!record) return NextResponse.json({ success: false, error: "80G request not found." }, { status: 404 });
    if (record.donation?.status !== "SUCCESS") {
      return NextResponse.json({ success: false, error: "A manual donation receipt can only be issued for a successful donation." }, { status: 409 });
    }
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(record.pan)) {
      return NextResponse.json({ success: false, error: "The donor PAN is invalid. Update the donor's tax information first." }, { status: 400 });
    }

    const taxYear = getTaxYear(new Date(record.donation.createdAt));
    const keys = profileKeyNames.map((name) => `tax.receipt.${name}`);
    const settings = await prisma.setting.findMany({ where: { key: { in: [...keys, `tax.pre_arns.${taxYear}`] } } });
    const settingsMap = new Map(settings.map((setting) => [setting.key, setting.value]));
    const profile = {
      name: settingsMap.get("tax.receipt.name") || "",
      pan: settingsMap.get("tax.receipt.pan") || "",
      urn: settingsMap.get("tax.receipt.urn") || "",
      approvalNumber: settingsMap.get("tax.receipt.approval_number") || "",
      address: settingsMap.get("tax.receipt.address") || "",
      email: settingsMap.get("tax.receipt.email") || "",
      phone: settingsMap.get("tax.receipt.phone") || "",
    };
    if (Object.values(profile).some((value) => !value.trim()) || !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(profile.pan)) {
      return NextResponse.json({ success: false, error: "Complete and save the Trust's receipt details in the Pre-ARN panel before issuing receipts." }, { status: 400 });
    }

    const inventoryKey = `tax.pre_arns.${taxYear}`;
    try {
      await prisma.$transaction(async (tx) => {
        const inventory = await tx.setting.findUnique({ where: { key: inventoryKey } });
        const entries = parseEntries(inventory?.value);
        const entry = entries.find((candidate) => candidate.arn.toUpperCase() === preArn.toUpperCase());
        if (!entry) throw new Error("This Pre-ARN is not in the inventory for the donation's tax year.");
        if (entry.status !== "AVAILABLE" && entry.donorTaxInformationId !== id) {
          throw new Error("This Pre-ARN has already been assigned to another donation.");
        }
        entry.status = "ASSIGNED";
        entry.donorTaxInformationId = id;
        entry.assignedAt ||= new Date().toISOString();
        await tx.setting.update({ where: { key: inventoryKey }, data: { value: JSON.stringify(entries) } });
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("This Pre-ARN")) {
        return NextResponse.json({ success: false, error: error.message }, { status: 409 });
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") {
        return NextResponse.json({ success: false, error: "Another admin updated the Pre-ARN inventory. Reload and retry." }, { status: 409 });
      }
      throw error;
    }

    const receipt = await prisma.receipt.findUnique({ where: { donationId: record.donationId } });
    const receiptNumber = receipt?.receiptNumber || record.donation.donationNumber;
    const donationDate = formatDate(new Date(record.donation.createdAt));
    const amount = (record.donation.totalPaise / 100).toFixed(2);
    const rows = [
      ["Trust", profile.name], ["PAN", profile.pan], ["Unique Registration Number", profile.urn],
      ["80G approval reference", profile.approvalNumber], ["Registered address", profile.address],
      ["Contact", `${profile.email} · ${profile.phone}`], ["Donor name", record.donorName],
      ["Donor PAN", record.pan], ["Donor address", [record.addressLine1, record.addressLine2, record.city, record.state, record.pincode].filter(Boolean).join(", ")],
      ["Tax year", taxYear], ["Donation receipt number", receiptNumber], ["Pre-Acknowledgement Number", preArn],
      ["Donation date", donationDate], ["Donation amount", `INR ${amount}`], ["Mode of receipt", "Electronic payment"],
    ];
    const detailRows = rows.map(([label, value]) => `<tr><th style="padding:9px 12px;text-align:left;border:1px solid #ddd;background:#f8f5f0">${escapeHtml(label)}</th><td style="padding:9px 12px;border:1px solid #ddd">${escapeHtml(value)}</td></tr>`).join("");
    const html = `<div style="font-family:Arial,sans-serif;max-width:720px;margin:auto;color:#222"><h1 style="color:#6e2636">Manual Donation Receipt</h1><p><strong>Pre-Acknowledgement Number: ${escapeHtml(preArn)}</strong></p><p>This manual receipt is issued using the Pre-Acknowledgement Number for subsequent reporting in Form 113. It is not the portal-generated Form 114 certificate. The Trust will issue Form 114 after filing Form 113 and downloading the certificate from the Income Tax e-Filing portal.</p><table style="border-collapse:collapse;width:100%">${detailRows}</table><p style="margin-top:24px">For questions, contact ${escapeHtml(profile.email)}.</p><p>${escapeHtml(profile.name)}</p></div>`;
    const emailSent = await sendEmail({
      to: record.email,
      subject: `Your manual donation receipt — Pre-ARN ${preArn}`,
      html,
      requireConfiguration: true,
    });
    if (!emailSent) {
      return NextResponse.json({ success: false, error: "The Pre-ARN is reserved for this donation, but email could not be sent. Check email settings and retry with the same Pre-ARN." }, { status: 503 });
    }

    await prisma.$transaction(async (tx) => {
      const inventory = await tx.setting.findUnique({ where: { key: inventoryKey } });
      const entries = parseEntries(inventory?.value);
      const entry = entries.find((candidate) => candidate.arn.toUpperCase() === preArn.toUpperCase());
      if (entry?.donorTaxInformationId === id) {
        entry.status = "ISSUED";
        entry.issuedAt = new Date().toISOString();
        await tx.setting.update({ where: { key: inventoryKey }, data: { value: JSON.stringify(entries) } });
      }
      await tx.donorTaxInformation.update({
        where: { id },
        data: { status: "MANUAL_RECEIPT_SENT", form10bdStatus: `Pre-ARN ${preArn} — Tax Year ${taxYear}` },
      });
    });

    return NextResponse.json({ success: true, preArn, taxYear });
  } catch (error) {
    console.error("Pre-ARN receipt email error:", error);
    return NextResponse.json({ success: false, error: "Could not issue the manual donation receipt." }, { status: 500 });
  }
}
