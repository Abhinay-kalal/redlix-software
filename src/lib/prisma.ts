import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require("@prisma/client");

const DEFAULT_DATABASE_URL =
  "postgresql://postgres.zemknulufleswmroqcrc:examrishiredlix@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true";

const connectionString = (process.env.DATABASE_URL && process.env.DATABASE_URL.trim()) || DEFAULT_DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalForPrisma = global as unknown as { prisma: any };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
