import { NextRequest, NextResponse } from "next/server";
import { getPosts, createPost } from "@/lib/services/posts";
import { paginationQuerySchema, createPostSchema } from "@/lib/validation";
import { getCurrentUser } from "@/lib/auth";
import type { Role } from "@/lib/permissions";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const rawQuery = Object.fromEntries(url.searchParams.entries());
    const query = paginationQuerySchema.parse(rawQuery);

    const user = await getCurrentUser();
    const userRoles = (user?.roles as Role[]) || [];
    const isEditorial = userRoles.includes("ADMIN") || userRoles.includes("EDITOR");

    // Public users can ONLY see PUBLISHED posts
    const status = isEditorial ? query.status : "PUBLISHED";

    const result = await getPosts({
      page: query.page,
      limit: query.limit,
      search: query.search,
      categorySlug: query.category,
      tagSlug: query.tag,
      authorSlug: query.author,
      status: status || undefined,
      sort: query.sort,
    });

    return NextResponse.json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: err.message || "Failed to fetch posts",
        },
      },
      { status: 400 }
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

    const body = await req.json();
    const validatedData = createPostSchema.parse(body);

    const newPost = await createPost(
      validatedData,
      user.id,
      (user.roles as Role[]) || ["USER"]
    );

    return NextResponse.json(
      {
        success: true,
        data: newPost,
        message: "Post created successfully",
      },
      { status: 201 }
    );
  } catch (err: any) {
    const status = err.message.includes("Forbidden") ? 403 : 400;
    return NextResponse.json(
      {
        success: false,
        error: {
          code: status === 403 ? "FORBIDDEN" : "VALIDATION_ERROR",
          message: err.message || "Failed to create post",
        },
      },
      { status }
    );
  }
}
