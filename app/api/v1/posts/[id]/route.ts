import { NextRequest, NextResponse } from "next/server";
import { getPostById, updatePost, deletePost } from "@/lib/services/posts";
import { updatePostSchema } from "@/lib/validation";
import { getCurrentUser } from "@/lib/auth";
import type { Role } from "@/lib/permissions";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const post = await getPostById(id);

    if (!post) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Post not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: post,
      message: "Post retrieved successfully",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: err.message } },
      { status: 500 }
    );
  }
}

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
    const validated = updatePostSchema.parse(body);

    const updated = await updatePost(
      id,
      validated,
      user.id,
      (user.roles as Role[]) || ["USER"]
    );

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Post updated successfully",
    });
  } catch (err: any) {
    const status = err.message.includes("Forbidden")
      ? 403
      : err.message.includes("not found")
      ? 404
      : 400;
    return NextResponse.json(
      {
        success: false,
        error: {
          code: status === 403 ? "FORBIDDEN" : status === 404 ? "NOT_FOUND" : "BAD_REQUEST",
          message: err.message || "Failed to update post",
        },
      },
      { status }
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

    const { id } = await params;
    await deletePost(id, user.id, (user.roles as Role[]) || ["USER"]);

    return NextResponse.json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (err: any) {
    const status = err.message.includes("Forbidden")
      ? 403
      : err.message.includes("not found")
      ? 404
      : 400;
    return NextResponse.json(
      {
        success: false,
        error: {
          code: status === 403 ? "FORBIDDEN" : status === 404 ? "NOT_FOUND" : "BAD_REQUEST",
          message: err.message || "Failed to delete post",
        },
      },
      { status }
    );
  }
}
