import { NextRequest, NextResponse } from "next/server";
import { getAllComments, createComment, getCommentsForPost } from "@/lib/services/comments";
import { createCommentSchema } from "@/lib/validation";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission, type Role } from "@/lib/permissions";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const postId = url.searchParams.get("postId");
    const status = url.searchParams.get("status") as any;

    if (postId) {
      const postComments = await getCommentsForPost(postId);
      return NextResponse.json({ success: true, data: postComments });
    }

    const user = await getCurrentUser();
    const userRoles = (user?.roles as Role[]) || [];
    if (!hasPermission(userRoles, "comment:moderate")) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Requires comment:moderate permission" } },
        { status: 403 }
      );
    }

    const items = await getAllComments(status || undefined);
    return NextResponse.json({ success: true, data: items });
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
    const body = await req.json();
    const validated = createCommentSchema.parse(body);

    const comment = await createComment({
      ...validated,
      userId: user?.id || null,
      authorName: user?.name || validated.authorName,
      authorEmail: user?.email || validated.authorEmail,
    });

    return NextResponse.json(
      {
        success: true,
        data: comment,
        message:
          comment.status === "PENDING"
            ? "Comment submitted for moderation"
            : "Comment posted successfully",
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
