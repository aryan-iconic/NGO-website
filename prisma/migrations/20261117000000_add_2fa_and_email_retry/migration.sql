ALTER TABLE "public"."admins"
  ADD COLUMN IF NOT EXISTS "two_factor_secret" TEXT,
  ADD COLUMN IF NOT EXISTS "two_factor_pending_secret" TEXT;

CREATE TABLE IF NOT EXISTS "public"."email_deliveries" (
  "id" TEXT NOT NULL,
  "idempotency_key" TEXT NOT NULL,
  "to_email" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "html" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "last_error" TEXT,
  "next_attempt_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "email_deliveries_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "email_deliveries_idempotency_key_key" ON "public"."email_deliveries"("idempotency_key");
CREATE INDEX IF NOT EXISTS "email_deliveries_status_next_attempt_at_idx" ON "public"."email_deliveries"("status", "next_attempt_at");
