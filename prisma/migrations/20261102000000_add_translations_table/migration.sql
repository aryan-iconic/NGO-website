-- Adds the table used by src/lib/i18n-server.ts for stored translations.
-- IF NOT EXISTS also makes this safe to apply where the table was created
-- manually before Prisma migration history was established.
CREATE TABLE IF NOT EXISTS "public"."translations" (
    "id" TEXT NOT NULL,
    "source_text" TEXT NOT NULL,
    "source_hash" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "translated_text" TEXT NOT NULL,
    "source_type" TEXT NOT NULL DEFAULT 'STATIC',
    "source_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'AUTO',
    "provider" TEXT NOT NULL DEFAULT 'google',
    "is_manual" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "translations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "translations_source_hash_key"
    ON "public"."translations"("source_hash");

CREATE INDEX IF NOT EXISTS "translations_locale_source_hash_idx"
    ON "public"."translations"("locale", "source_hash");
