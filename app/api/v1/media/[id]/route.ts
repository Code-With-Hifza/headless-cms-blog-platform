import { NextRequest, NextResponse } from "next/server";
import { deleteMedia, updateMedia } from "@/lib/services/media";
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

    const { id } = await params;
    const body = await req.json();
    const updated = await updateMedia(id, body);

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Media updated successfully",
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
    if (!hasPermission(userRoles, "media:delete")) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Requires media:delete permission" } },
        { status: 403 }
      );
    }

    const { id } = await params;
    await deleteMedia(id);

    return NextResponse.json({
      success: true,
      message: "Media deleted successfully",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: "BAD_REQUEST", message: err.message } },
      { status: 400 }
    );
  }
}
