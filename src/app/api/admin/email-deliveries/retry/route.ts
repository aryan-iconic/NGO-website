import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { requireAdmin } from "@/lib/require-admin";

export async function POST() {
  const guard = await requireAdmin(["SUPER_ADMIN", "ADMIN", "FINANCE_ADMIN"]);
  if (guard.error) return guard.error;
  const due = await prisma.emailDelivery.findMany({ where: { status: { in: ["PENDING", "FAILED"] }, nextAttemptAt: { lte: new Date() } }, orderBy: { createdAt: "asc" }, take: 25 });
  let delivered = 0;
  for (const item of due) {
    const sent = await sendEmail({ to: item.toEmail, subject: item.subject, html: item.html, requireConfiguration: true, idempotencyKey: item.idempotencyKey });
    const attempts = item.attempts + 1;
    if (sent) {
      await prisma.emailDelivery.delete({ where: { id: item.id } });
      delivered += 1;
    } else {
      await prisma.emailDelivery.update({ where: { id: item.id }, data: { status: attempts >= 10 ? "FAILED" : "PENDING", attempts, lastError: "Email provider retry failed.", nextAttemptAt: new Date(Date.now() + Math.min(3_600_000, 60_000 * 2 ** Math.min(attempts, 6))) } });
    }
  }
  return NextResponse.json({ success: true, attempted: due.length, delivered });
}

