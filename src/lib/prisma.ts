import { Prisma, PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const logDefinitions = [
  { emit: "event", level: "query" },
  { emit: "stdout", level: "error" },
  ...(process.env.NODE_ENV === "development" ? [{ emit: "stdout", level: "warn" } as const] : []),
] as const satisfies Prisma.LogDefinition[];

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ log: logDefinitions });

// Emit only elapsed time. Never log SQL text, bound parameters, or credentials.
const queryEventClient = prisma as unknown as {
  $on: (eventType: "query", callback: (event: Prisma.QueryEvent) => void) => void;
};
queryEventClient.$on("query", (event) => {
  console.info("[prisma:query-duration]", JSON.stringify({ durationMs: event.duration }));
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
