import { NextRequest, NextResponse } from "next/server";
import { getAuthors, createAuthor } from "@/lib/services/authors";
import { createAuthorSchema } from "@/lib/validation";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission, type Role } from "@/lib/permissions";

export async function GET() {
  try {
    const list = await getAuthors();
    return NextResponse.json({
      success: true,
      data: list,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: err.message } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "You must be logged in" } },
        { status: 401 }
      );
    }

    const userRoles = (user.roles as Role[]) || ["USER"];
    if (!hasPermission(userRoles, "author:create")) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Requires author:create permission" } },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validated = createAuthorSchema.parse(body);
    const created = await createAuthor(validated);

    return NextResponse.json(
      {
        success: true,
        data: created,
        message: "Author profile created successfully",
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
