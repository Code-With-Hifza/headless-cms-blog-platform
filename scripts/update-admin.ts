import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { eq } from "drizzle-orm";
import * as schema from "../lib/db/schema";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🔄 Updating Admin user credentials in Neon PostgreSQL database...");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  const adminEmail = "admin@gmail.com";
  const newPasswordHash = await bcrypt.hash("Admin@12345", 10);

  // Check if admin@gmail.com already exists
  const [existingAdmin] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, adminEmail));

  let userId: string;

  if (existingAdmin) {
    console.log(`Found existing user with email ${adminEmail}, updating password...`);
    await db
      .update(schema.users)
      .set({
        passwordHash: newPasswordHash,
        name: "Admin User",
        isActive: true,
      })
      .where(eq(schema.users.id, existingAdmin.id));
    userId = existingAdmin.id;
  } else {
    console.log(`Creating new Admin user with email ${adminEmail}...`);
    const [newUser] = await db
      .insert(schema.users)
      .values({
        name: "Admin User",
        email: adminEmail,
        emailVerified: new Date(),
        passwordHash: newPasswordHash,
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        isActive: true,
      })
      .returning();
    userId = newUser.id;
  }

  // Ensure ADMIN role assignment
  await db
    .insert(schema.userRoles)
    .values({
      userId,
      roleId: "ADMIN",
    })
    .onConflictDoNothing();

  // Also ensure Eleanor Vance / previous admin password is also updated or exists
  const [oldAdmin] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, "admin@contentflow.io"));

  if (oldAdmin) {
    await db
      .update(schema.users)
      .set({ passwordHash: newPasswordHash })
      .where(eq(schema.users.id, oldAdmin.id));
  }

  console.log("✅ Successfully updated Admin credentials:");
  console.log(`   Email: ${adminEmail}`);
  console.log("   Password: Admin@12345");
  console.log("   Role: ADMIN");

  await pool.end();
}

main().catch((err) => {
  console.error("❌ Failed to update admin credentials:", err);
  process.exit(1);
});
