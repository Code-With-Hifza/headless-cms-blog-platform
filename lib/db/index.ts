import { drizzle, NeonHttpDatabase } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

// -------------------------------------------------------------
// Database Connection Configuration
// -------------------------------------------------------------
const DEFAULT_DB_URL =
  "postgresql://neondb_owner:npg_ruASU7b5lWdn@ep-lucky-king-aw5by7sf-pooler.c-12.us-east-1.aws.neon.tech/neondb?sslmode=require";

function getSanitizedDbUrl(): string {
  const rawUrl = (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.NEON_DATABASE_URL ||
    DEFAULT_DB_URL
  ).trim();

  try {
    const parsed = new URL(rawUrl);
    parsed.searchParams.delete("channel_binding");
    if (!parsed.searchParams.has("sslmode")) {
      parsed.searchParams.set("sslmode", "require");
    }
    return parsed.toString();
  } catch {
    return rawUrl
      .replace(/&channel_binding=[^&]*/g, "")
      .replace(/\?channel_binding=[^&]*&?/g, "?");
  }
}

const connectionString = getSanitizedDbUrl();

// Initialize Neon HTTP Serverless client
const sql = neon(connectionString);

// Initialize strongly typed Drizzle ORM instance with full schema
export const db: NeonHttpDatabase<typeof schema> = drizzle(sql, { schema });

// Export Database Type for dependency injection and service typing
export type Database = typeof db;

// Export all schemas, relations, and TypeScript models
export * from "./schema";
export * from "./types";
export { sql };

