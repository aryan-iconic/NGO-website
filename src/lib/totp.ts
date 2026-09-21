import * as OTPAuth from "otpauth";
import QRCode from "qrcode";

const ISSUER = "Shri Nityanikunj Trust";

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
