# Database setup and deployment

`bootstrap-missing-schema.sql` is the baseline for a fresh Supabase project. Run it once in the Supabase SQL Editor, then run `npx prisma migrate deploy` for migrations added after the baseline.

For the existing production database, do not rerun the bootstrap script. Add the migrations to the deployment build so Prisma applies additive changes. The translations migration is safe if that table was previously created by hand (`IF NOT EXISTS`). The November 17 migration adds persisted 2FA secrets and the email retry queue.

The repository does not yet have a complete initial Prisma migration that can safely be replayed against both a fresh database and the manually bootstrapped production database. A fresh database therefore needs the checked-in bootstrap SQL before `prisma migrate deploy`.
