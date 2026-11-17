import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

// Share one settings query across the root layout and Server Components during
// a single render. React's server cache is request-scoped, so CMS updates remain
// visible on the next request without a persistent stale cache.
export const getServerSettings = unstable_cache(() => prisma.setting.findMany({
  where: { OR: ["contact.", "social.", "home.", "about.", "legal."].map((prefix) => ({ key: { startsWith: prefix } })) },
}), ["public-site-settings"], { revalidate: 60, tags: ["public-site-settings"] });

export const getMinimumDonationAmountPaise = unstable_cache(async () => {
  const setting = await prisma.setting.findUnique({ where: { key: "donation.minimumAmountPaise" }, select: { value: true } });
  const parsed = Number(setting?.value);
  return Number.isSafeInteger(parsed) && parsed >= 100 ? parsed : 100;
}, ["minimum-donation-setting"], { revalidate: 60, tags: ["public-site-settings"] });
