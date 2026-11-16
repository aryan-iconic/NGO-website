import { cache } from "react";
import { prisma } from "@/lib/prisma";

// Share one settings query across the root layout and Server Components during
// a single render. React's server cache is request-scoped, so CMS updates remain
// visible on the next request without a persistent stale cache.
export const getServerSettings = cache(() => prisma.setting.findMany());
