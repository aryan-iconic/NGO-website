import { cookies } from "next/headers";
import { ENABLED_LOCALES } from "./translation";

export async function getLocale(): Promise<string> {
  try {
    const cookieStore = await cookies();
    const locale = cookieStore.get("NEXT_LOCALE")?.value;
    return locale && ["en", ...ENABLED_LOCALES].includes(locale) ? locale : "en";
  } catch {
    // Fails safely during build or outside request context
    return "en";
  }
}
