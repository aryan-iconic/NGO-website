const ALLOWED_WHATSAPP_HOSTS = new Set(["wa.me", "api.whatsapp.com", "web.whatsapp.com"]);

export function getWhatsAppHref(value: string | null | undefined): string | null {
  const input = value?.trim();
  if (!input) return null;

  if (/^[+\d\s().-]+$/.test(input)) {
    const number = input.replace(/\D/g, "");
    return number.length >= 8 && number.length <= 15 ? `https://wa.me/${number}` : null;
  }

  try {
    const url = new URL(input);
    if (url.protocol !== "https:" || !ALLOWED_WHATSAPP_HOSTS.has(url.hostname.toLowerCase())) return null;
    return url.toString();
  } catch {
    return null;
  }
}
