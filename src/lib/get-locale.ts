import { cookies } from "next/headers";

export async function getLocale(): Promise<string> {
  try {
    const cookieStore = await cookies();
    const locale = cookieStore.get("NEXT_LOCALE")?.value;
    return locale && ["en", "hi", "te", "ta"].includes(locale) ? locale : "en";
  } catch (error) {
    // Fails safely during build or outside request context
    return "en";
  }
}
