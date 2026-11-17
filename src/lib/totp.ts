import * as OTPAuth from "otpauth";
import QRCode from "qrcode";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const ISSUER = "Shri Nityanikunj Trust";
const encryptionKey = () => createHash("sha256").update(process.env.AUTH_SECRET || "dev-only-secret-change-in-production-min-32-chars").digest();

export function encryptTotpSecret(secret: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()]);
  return `enc.v1.${iv.toString("base64url")}.${cipher.getAuthTag().toString("base64url")}.${ciphertext.toString("base64url")}`;
}

export function decryptTotpSecret(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  if (!value.startsWith("enc.v1.")) return value;
  const [, , ivText, tagText, ciphertextText] = value.split(".");
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(ivText, "base64url"));
  decipher.setAuthTag(Buffer.from(tagText, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(ciphertextText, "base64url")), decipher.final()]).toString("utf8");
}

export function generateSecret(): string {
  return new OTPAuth.Secret({ size: 20 }).base32;
}

function buildTotp(email: string, secretBase32: string) {
  return new OTPAuth.TOTP({
    issuer: ISSUER,
    label: email,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secretBase32),
  });
}

export function verifyTotpCode(email: string, secretBase32: string, code: string): boolean {
  const totp = buildTotp(email, secretBase32);
  // window: 1 tolerates minor clock drift (±30s) between server and authenticator app.
  const delta = totp.validate({ token: code.trim(), window: 1 });
  return delta !== null;
}

export async function generateQrCodeDataUrl(email: string, secretBase32: string): Promise<string> {
  const totp = buildTotp(email, secretBase32);
  return QRCode.toDataURL(totp.toString());
}
