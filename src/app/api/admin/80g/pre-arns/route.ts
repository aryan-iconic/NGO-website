import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { z } from "zod";

const profileKeys = {
  name: "tax.receipt.name",
  pan: "tax.receipt.pan",
  urn: "tax.receipt.urn",
  approvalNumber: "tax.receipt.approval_number",
  address: "tax.receipt.address",
  email: "tax.receipt.email",
  phone: "tax.receipt.phone",
} as const;

const profileSchema = z.object({
  name: z.string().trim().min(2).max(200),
  pan: z.string().trim().toUpperCase().regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/),
  urn: z.string().trim().min(1).max(100),
  approvalNumber: z.string().trim().min(1).max(100),
  address: z.string().trim().min(5).max(1000),
  email: z.string().trim().email(),
  phone: z.string().trim().min(7).max(30),
});

const taxYearSchema = z.string().regex(/^\d{4}-\d{2}$/);
type PreArnEntry = { arn: string; status: "AVAILABLE" | "ASSIGNED" | "ISSUED"; donorTaxInformationId?: string; assignedAt?: string; issuedAt?: string };

function parseEntries(value?: string | null): PreArnEntry[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((entry) => entry && typeof entry.arn === "string") : [];
  } catch {
    return [];
  }
}

export async function GET(req: NextRequest) {
  const adminRes = await requireAdmin();
  if (adminRes.error) return adminRes.error;

  const taxYear = req.nextUrl.searchParams.get("taxYear") || "";
  const donorId = req.nextUrl.searchParams.get("donorId");
  if (!taxYearSchema.safeParse(taxYear).success) {
    return NextResponse.json({ success: false, error: "A valid tax year is required." }, { status: 400 });
  }

  const keys = [...Object.values(profileKeys), `tax.pre_arns.${taxYear}`];
  const settings = await prisma.setting.findMany({ where: { key: { in: keys } } });
  const values = new Map(settings.map((setting) => [setting.key, setting.value]));
  const profile = Object.fromEntries(Object.entries(profileKeys).map(([field, key]) => [field, values.get(key) || ""]));
  const allEntries = parseEntries(values.get(`tax.pre_arns.${taxYear}`));
  const entries = donorId ? allEntries.filter((entry) => entry.status === "AVAILABLE" || entry.donorTaxInformationId === donorId) : allEntries;
  return NextResponse.json({ success: true, profile, entries, taxYear });
}

export async function POST(req: NextRequest) {
  const adminRes = await requireAdmin();
  if (adminRes.error) return adminRes.error;

  try {
    const body = await req.json();
    const taxYearResult = taxYearSchema.safeParse(body.taxYear);
    if (!taxYearResult.success) return NextResponse.json({ success: false, error: "A valid tax year is required." }, { status: 400 });
    const taxYear = taxYearResult.data;
    const transactionOperations: Prisma.PrismaPromise<unknown>[] = [];

    if (body.profile !== undefined) {
      const profileResult = profileSchema.safeParse(body.profile);
      if (!profileResult.success) {
        return NextResponse.json({ success: false, error: "Complete the Trust's receipt details with valid values." }, { status: 400 });
      }
      for (const [field, key] of Object.entries(profileKeys) as Array<[keyof typeof profileKeys, string]>) {
        const value = profileResult.data[field];
        transactionOperations.push(prisma.setting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        }));
      }
    }

    if (body.arns !== undefined) {
      if (!Array.isArray(body.arns) || body.arns.length === 0 || body.arns.length > 1000) {
        return NextResponse.json({ success: false, error: "Import between 1 and 1,000 Pre-ARNs at a time." }, { status: 400 });
      }
      const arns = body.arns.map((value: unknown) => typeof value === "string" ? value.trim().replace(/^['"]|['"]$/g, "") : "");
      if (arns.some((arn: string) => !/^[A-Za-z0-9]{1,21}$/.test(arn)) || new Set(arns).size !== arns.length) {
        return NextResponse.json({ success: false, error: "Pre-ARNs must be unique alphanumeric values of up to 21 characters." }, { status: 400 });
      }

      const key = `tax.pre_arns.${taxYear}`;
      try {
        await prisma.$transaction(async (tx) => {
          const setting = await tx.setting.findUnique({ where: { key } });
          const existing = parseEntries(setting?.value);
          const existingValues = new Set(existing.map((entry) => entry.arn.toUpperCase()));
          if (arns.some((arn: string) => existingValues.has(arn.toUpperCase()))) {
            throw new Error("One or more Pre-ARNs are already imported for this tax year.");
          }
          if (existing.length + arns.length > 1000) {
            throw new Error("This tax-year inventory cannot exceed 1,000 Pre-ARNs.");
          }
          const value = JSON.stringify([...existing, ...arns.map((arn: string): PreArnEntry => ({ arn, status: "AVAILABLE" }))]);
          await tx.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
        }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
      } catch (error) {
        if (error instanceof Error && error.message.startsWith("One or more")) {
          return NextResponse.json({ success: false, error: error.message }, { status: 409 });
        }
        if (error instanceof Error && error.message.startsWith("This tax-year")) {
          return NextResponse.json({ success: false, error: error.message }, { status: 400 });
        }
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") {
          return NextResponse.json({ success: false, error: "Another admin updated this Pre-ARN list. Reload and retry." }, { status: 409 });
        }
        throw error;
      }
    }

    if (transactionOperations.length > 0) await prisma.$transaction(transactionOperations);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Pre-ARN admin operation error:", error);
    return NextResponse.json({ success: false, error: "Could not save Pre-ARN settings." }, { status: 500 });
  }
}
