import { NextRequest, NextResponse } from "next/server";
import { updatePost } from "@/lib/services/posts";
import { autoSavePostSchema } from "@/lib/validation";
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
    const body = await req.json();
    const validated = autoSavePostSchema.parse({ ...body, id });

    const updated = await updatePost(
      id,
      {
        title: validated.title,
        content: validated.content,
        excerpt: validated.excerpt,
      },
      user.id,
      (user.roles as Role[]) || ["USER"]
    );

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        updatedAt: updated.updatedAt,
      },
      message: "Post auto-saved successfully",
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
