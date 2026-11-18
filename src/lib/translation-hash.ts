import { createHash } from "node:crypto";

export function translationSourceHash(sourceText: string, locale: string, sourceId = "") {
  return createHash("sha256").update(JSON.stringify([locale, sourceId, sourceText])).digest("hex");
}

/** Fingerprint used by the first text-only translation implementation. */
export function legacyTranslationSourceHash(sourceText: string, locale: string) {
  return createHash("sha256").update(`${locale}:${sourceText}`).digest("hex");
}
