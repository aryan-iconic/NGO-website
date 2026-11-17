import { spawnSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";

const run = (file, args, env = process.env) => {
  const result = spawnSync(file, args, { stdio: "inherit", env, shell: process.platform === "win32" });
  if (result.status !== 0) process.exit(result.status ?? 1);
};

if (process.env.VERCEL_ENV === "production") {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required for production builds.");
  if (!process.env.DIRECT_URL) throw new Error("DIRECT_URL is required for production migrations. Use Supabase direct or session-pooler connection details, not transaction-pooler port 6543.");

  const prisma = new PrismaClient();
  let baselineExistingDatabase = false;
  try {
    const [state] = await prisma.$queryRaw`
      SELECT to_regclass('public.users')::text AS users,
             to_regclass('public.admins')::text AS admins,
             to_regclass('public.campaigns')::text AS campaigns,
             to_regclass('public.donations')::text AS donations,
             to_regclass('public.settings')::text AS settings,
             to_regclass('public._prisma_migrations')::text AS migrations
    `;
    const coreTables = [state.users, state.admins, state.campaigns, state.donations, state.settings];
    if (coreTables.some(Boolean) && !coreTables.every(Boolean)) {
      throw new Error("Production database has a partial core schema. Reconcile it with prisma/bootstrap-missing-schema.sql before deploying.");
    }
    if (coreTables.every(Boolean)) {
      if (state.migrations) {
        const applied = await prisma.$queryRaw`SELECT 1 FROM "public"."_prisma_migrations" WHERE "migration_name" = '20261101000000_initial_schema' AND "finished_at" IS NOT NULL LIMIT 1`;
        baselineExistingDatabase = applied.length === 0;
      } else baselineExistingDatabase = true;
    }
  } finally {
    await prisma.$disconnect();
  }

  const migrationEnv = { ...process.env, DATABASE_URL: process.env.DIRECT_URL };
  if (baselineExistingDatabase) run(process.execPath, ["node_modules/prisma/build/index.js", "migrate", "resolve", "--applied", "20261101000000_initial_schema"], migrationEnv);
  run(process.execPath, ["node_modules/prisma/build/index.js", "migrate", "deploy"], migrationEnv);
}

run(process.execPath, ["node_modules/next/dist/bin/next", "build"]);
