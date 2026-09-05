import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/lib/validation";
import { db } from "@/lib/db";
import { users, userRoles, siteSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = registerSchema.parse(body);

    const settings = await db.query.siteSettings.findFirst({
      where: eq(siteSettings.id, "default"),
    });

    if (settings && !settings.allowRegistration) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "User registration is currently disabled." } },
        { status: 403 }
      );
    }

    const email = validated.email.toLowerCase().trim();
    const existing = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: { code: "CONFLICT", message: "An account with this email already exists." } },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(validated.password, 10);
    const defaultRole = settings?.defaultRole || "USER";

    const [newUser] = await db
      .insert(users)
      .values({
        name: validated.name,
        email,
        passwordHash,
        emailVerified: new Date(),
        isActive: true,
      })
      .returning();

    await db.insert(userRoles).values({
      userId: newUser.id,
      roleId: defaultRole,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
        },
        message: "Account registered successfully!",
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: "BAD_REQUEST", message: err.message } },
      { status: 400 }
    );
  }
}
