import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

// Minimal signed-cookie session (HMAC-SHA256), no external JWT dependency.
// Good enough to demonstrate the real auth flow end-to-end; swap for
// rotating refresh tokens + HttpOnly cookie families per Section 6.2 of the
// spec when this goes to production.

const SECRET = process.env.AUTH_SECRET ?? "dev-only-secret-change-in-production-min-32-chars";
const USER_COOKIE = "snt_session";
const ADMIN_COOKIE = "snt_admin_session";

interface SessionPayload {
  sub: string;
  kind: "user" | "admin";
  exp: number;
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

export async function createUserSession(userId: string) {
  const token = sign({ sub: userId, kind: "user", exp: Date.now() + SEVEN_DAYS });
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

export async function getCurrentUserId(): Promise<string | null> {
  const jar = await cookies();
  const token = jar.get(USER_COOKIE)?.value;
  if (!token) return null;
  const payload = verify(token);
  return payload?.kind === "user" ? payload.sub : null;
}

export async function getCurrentAdminId(): Promise<string | null> {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  const payload = verify(token);
  return payload?.kind === "admin" ? payload.sub : null;
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
