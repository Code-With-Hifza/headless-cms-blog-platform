import { NextRequest, NextResponse } from "next/server";
import { updateCommentStatus, deleteComment } from "@/lib/services/comments";
import { updateCommentStatusSchema } from "@/lib/validation";
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
    if (!hasPermission(userRoles, "comment:moderate")) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Requires comment:moderate permission" } },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const validated = updateCommentStatusSchema.parse(body);
    const updated = await updateCommentStatus(id, validated.status);

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Comment status updated successfully",
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
    if (!hasPermission(userRoles, "comment:moderate")) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Requires comment:moderate permission" } },
        { status: 403 }
      );
    }

    const { id } = await params;
    await deleteComment(id);

    return NextResponse.json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: "BAD_REQUEST", message: err.message } },
      { status: 400 }
    );
  }
}
