import { NextRequest, NextResponse } from "next/server";
import { updateTag, deleteTag } from "@/lib/services/tags";
import { updateTagSchema } from "@/lib/validation";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission, type Role } from "@/lib/permissions";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "You must be logged in" } },
        { status: 401 }
      );
    }

    const userRoles = (user.roles as Role[]) || ["USER"];
    if (!hasPermission(userRoles, "tag:update")) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Requires tag:update permission" } },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const validated = updateTagSchema.parse(body);
    const updated = await updateTag(id, validated);

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Tag updated successfully",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: "BAD_REQUEST", message: err.message } },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "You must be logged in" } },
        { status: 401 }
      );
    }

    const userRoles = (user.roles as Role[]) || ["USER"];
    if (!hasPermission(userRoles, "tag:delete")) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Requires tag:delete permission" } },
        { status: 403 }
      );
    }

    const { id } = await params;
    await deleteTag(id);

    return NextResponse.json({
      success: true,
      message: "Tag deleted successfully",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: "BAD_REQUEST", message: err.message } },
      { status: 400 }
    );
  }
}
