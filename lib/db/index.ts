import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import * as schema from "./schema";

// Configure web sockets / fetch for environments if needed
if (typeof window === "undefined") {
  // Server-side
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is missing.");
}

const pool = new Pool({ connectionString });
export const db = drizzle(pool, { schema });
export * from "./schema";
