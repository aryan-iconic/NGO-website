"use client";

import { useI18n } from "@/lib/i18n";

export function T({ 
  children, 
  k, 
  vars, 
  dangerouslySetInnerHTML,
  isSensitive
}: { 
  children?: string; 
  k?: string; 
  vars?: Record<string, any>; 
  dangerouslySetInnerHTML?: boolean;
  isSensitive?: boolean;
}) {
  const { t } = useI18n();
  const text = k ? t(k, vars, { isSensitive }) : children ? t(children, vars, { isSensitive }) : "";

  if (dangerouslySetInnerHTML) {
    return <span dangerouslySetInnerHTML={{ __html: text }} />;
  }

  return <>{text}</>;
}
