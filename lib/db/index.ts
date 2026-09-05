import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

const DEFAULT_DB_URL =
  "postgresql://neondb_owner:npg_ruASU7b5lWdn@ep-lucky-king-aw5by7sf-pooler.c-12.us-east-1.aws.neon.tech/neondb?sslmode=require";

const connectionString = (
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.NEON_DATABASE_URL ||
  DEFAULT_DB_URL
).trim();

const sql = neon(connectionString);
export const db = drizzle(sql, { schema });
export * from "./schema";
