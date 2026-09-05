import { NextRequest, NextResponse } from "next/server";
import { updatePost } from "@/lib/services/posts";
import { getCurrentUser } from "@/lib/auth";
import type { Role } from "@/lib/permissions";

export async function POST(
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
    const updated = await updatePost(
      id,
      { status: "PUBLISHED", publishedAt: new Date().toISOString() },
      user.id,
      (user.roles as Role[]) || ["USER"]
    );

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Post published successfully",
    });
  } catch (err: any) {
    const status = err.message.includes("Forbidden") ? 403 : 400;
    return NextResponse.json(
      {
        success: false,
        error: { code: status === 403 ? "FORBIDDEN" : "BAD_REQUEST", message: err.message },
      },
      { status }
    );
  }
}
