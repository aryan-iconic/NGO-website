import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

// Minimal signed-cookie session (HMAC-SHA256), no external JWT dependency.
// Good enough to demonstrate the real auth flow end-to-end; swap for
// rotating refresh tokens + HttpOnly cookie families per Section 6.2 of the
// spec when this goes to production.

const SECRET = process.env.AUTH_SECRET ?? (process.env.NODE_ENV === "production" ? "" : "dev-only-secret-change-in-production-min-32-chars");
if (process.env.NODE_ENV === "production" && SECRET.length < 32) {
  throw new Error("AUTH_SECRET must be configured with at least 32 characters in production.");
}
const USER_COOKIE = "snt_session";
const ADMIN_COOKIE = "snt_admin_session";
const ADMIN_PASSWORD_CHANGE_COOKIE = "snt_admin_password_change";

interface SessionPayload {
  sub: string;
  kind: "user" | "admin" | "admin-password-change" | "email-verification" | "newsletter-unsubscribe" | "receipt-confirmation";
  exp: number;
  email?: string;
  name?: string;
  receiptNumber?: string;
  amountPaise?: number;
}

function sign(payload: SessionPayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", SECRET).update(body).digest("base64url");
  return `${body}.${sig}`;
}

function verify(token: string): SessionPayload | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", SECRET).update(body).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload: SessionPayload = JSON.parse(Buffer.from(body, "base64url").toString());
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
const TWO_HOURS = 2 * 60 * 60 * 1000;

export async function createUserSession(userId: string, name?: string) {
  const token = sign({ sub: userId, kind: "user", name, exp: Date.now() + SEVEN_DAYS });
  const jar = await cookies();
  jar.set(USER_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SEVEN_DAYS / 1000,
  });
}

export async function createAdminSession(adminId: string) {
  const token = sign({ sub: adminId, kind: "admin", exp: Date.now() + TWO_HOURS });
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TWO_HOURS / 1000,
  });
}

export async function createAdminPasswordChangeSession(adminId: string) {
  const token = sign({ sub: adminId, kind: "admin-password-change", exp: Date.now() + 15 * 60 * 1000 });
  const jar = await cookies();
  jar.set(ADMIN_PASSWORD_CHANGE_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 15 * 60 });
}

export async function getAdminPasswordChangeId() {
  const jar = await cookies();
  const token = jar.get(ADMIN_PASSWORD_CHANGE_COOKIE)?.value;
  if (!token) return null;
  const payload = verify(token);
  if (payload?.kind !== "admin-password-change") return null;
  const admin = await prisma.admin.findUnique({ where: { id: payload.sub }, select: { id: true, mustChangePassword: true } });
  return admin?.mustChangePassword ? payload.sub : null;
}

export async function clearAdminPasswordChangeSession() {
  const jar = await cookies();
  jar.delete(ADMIN_PASSWORD_CHANGE_COOKIE);
}

export async function getCurrentUserId(): Promise<string | null> {
  const jar = await cookies();
  const token = jar.get(USER_COOKIE)?.value;
  if (!token) return null;
  const payload = verify(token);
  if (payload?.kind !== "user") return null;
  const user = await prisma.user.findUnique({ where: { id: payload.sub }, select: { status: true } });
  return user?.status === "ACTIVE" ? payload.sub : null;
}

export async function getCurrentUserSummary(): Promise<{ name: string } | null> {
  const jar = await cookies();
  const token = jar.get(USER_COOKIE)?.value;
  if (!token) return null;
  const payload = verify(token);
  if (payload?.kind !== "user") return null;
  const user = await prisma.user.findUnique({ where: { id: payload.sub }, select: { name: true, status: true } });
  return user?.status === "ACTIVE" ? { name: user.name || "My Account" } : null;
}

export async function getCurrentAdminId(): Promise<string | null> {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  const payload = verify(token);
  if (payload?.kind !== "admin") return null;
  const admin = await prisma.admin.findUnique({ where: { id: payload.sub }, select: { id: true } });
  return admin?.id ?? null;
}

const EMAIL_VERIFICATION_TTL = 24 * 60 * 60 * 1000;

export function createEmailVerificationToken(userId: string, email: string) {
  return sign({
    sub: userId,
    kind: "email-verification",
    email: email.trim().toLowerCase(),
    exp: Date.now() + EMAIL_VERIFICATION_TTL,
  });
}

export function verifyEmailVerificationToken(token: string) {
  const payload = verify(token);
  if (payload?.kind !== "email-verification" || !payload.email) return null;
  return { userId: payload.sub, email: payload.email };
}

export function createNewsletterUnsubscribeToken(email: string) {
  return sign({ sub: email.trim().toLowerCase(), kind: "newsletter-unsubscribe", exp: Date.now() + 10 * 365 * 24 * 60 * 60 * 1000 });
}

export function verifyNewsletterUnsubscribeToken(token: string) {
  const payload = verify(token);
  if (payload?.kind !== "newsletter-unsubscribe" || !payload.sub.includes("@")) return null;
  return payload.sub;
}

export function createReceiptConfirmationToken(receiptNumber: string, amountPaise: number) {
  return sign({ sub: receiptNumber, kind: "receipt-confirmation", receiptNumber, amountPaise, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 });
}

export function verifyReceiptConfirmationToken(token: string) {
  const payload = verify(token);
  if (payload?.kind !== "receipt-confirmation" || !payload.receiptNumber || !Number.isSafeInteger(payload.amountPaise) || (payload.amountPaise ?? 0) < 100) return null;
  return { receiptNumber: payload.receiptNumber, amountPaise: payload.amountPaise! };
}

export async function clearUserSession() {
  const jar = await cookies();
  jar.delete(USER_COOKIE);
}

export async function clearAdminSession() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
}

// Short-lived token proving "this browser just supplied the correct admin
// password for <adminId>" — issued by /api/admin/login when 2FA is enabled,
// and required by /api/admin/2fa/challenge before a full session is created.
// Not a cookie: returned in the response body and held by the login form's
// React state only, so it can't be replayed after the tab closes.
const TWO_FA_PENDING_TTL = 5 * 60 * 1000;

export function signTwoFactorPending(adminId: string): string {
  return sign({ sub: adminId, kind: "admin", exp: Date.now() + TWO_FA_PENDING_TTL });
}

export function verifyTwoFactorPending(token: string): string | null {
  const payload = verify(token);
  return payload?.kind === "admin" ? payload.sub : null;
}
