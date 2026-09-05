import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const dynamic = "force-dynamic";

export async function GET() {
  const envUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.NEON_DATABASE_URL;
  const fallbackUrl = "postgresql://neondb_owner:npg_ruASU7b5lWdn@ep-lucky-king-aw5by7sf-pooler.c-12.us-east-1.aws.neon.tech/neondb?sslmode=require";

  let urlToUse = (envUrl || fallbackUrl).trim();
  try {
    const parsed = new URL(urlToUse);
    parsed.searchParams.delete("channel_binding");
    if (!parsed.searchParams.has("sslmode")) {
      parsed.searchParams.set("sslmode", "require");
    }
    urlToUse = parsed.toString();
  } catch (e) {
    // ignore URL parsing error
  }

  try {
    const sql = neon(urlToUse);
    const result = await sql`SELECT 1 as test, NOW() as current_time, current_database() as db;`;
    
    // Check if tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `;

    return NextResponse.json({
      success: true,
      message: "Database connection successful!",
      database: result[0]?.db,
      time: result[0]?.current_time,
      tablesCount: tables.length,
      tables: tables.map((t: any) => t.table_name),
      isEnvVarSet: Boolean(envUrl),
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      message: "Database connection failed",
      errorMessage: err.message,
      errorName: err.name,
      errorCode: err.code,
      stack: err.stack,
      isEnvVarSet: Boolean(envUrl),
    }, { status: 200 }); // return 200 so we can read the JSON diagnostic output
  }
}
