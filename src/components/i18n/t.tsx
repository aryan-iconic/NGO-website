"use client";

import { useI18n, TranslationKey } from "@/lib/i18n";

// Lets a server component drop a translated string into otherwise
// server-rendered markup without converting the whole page to a client
// component (which would break its direct db.ts usage — see lib/i18n.tsx
// for why this whole approach is a lightweight stand-in for next-intl).
export function T({ k }: { k: TranslationKey }) {
  const { t } = useI18n();
  return <>{t(k)}</>;
}
