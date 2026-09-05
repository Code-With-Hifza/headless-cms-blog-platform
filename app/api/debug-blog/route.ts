import { NextResponse } from "next/server";
import { getPosts } from "@/lib/services/posts";
import { getCategories, getCategoryBySlug } from "@/lib/services/categories";
import { getTags } from "@/lib/services/tags";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const category = url.searchParams.get("category") || undefined;
  const tag = url.searchParams.get("tag") || undefined;

  const debug: Record<string, any> = {};

  try {
    debug.step = "getCategories";
    const categories = await getCategories();
    debug.categoriesCount = categories.length;

    debug.step = "getTags";
    const tags = await getTags();
    debug.tagsCount = tags.length;

    debug.step = "getPosts";
    const postsResult = await getPosts({
      page: 1,
      limit: 9,
      status: "PUBLISHED",
      categorySlug: category,
      tagSlug: tag,
    });
    debug.postsCount = postsResult.data.length;

    if (category) {
      debug.step = "getCategoryBySlug";
      const cat = await getCategoryBySlug(category);
      debug.category = cat;
    }

    return NextResponse.json({
      success: true,
      debug,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      failedStep: debug.step,
      errorName: err.name,
      errorMessage: err.message,
      errorStack: err.stack,
    }, { status: 200 });
  }
}
