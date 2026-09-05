import { getPosts } from "@/lib/services/posts";
import { getCategories } from "@/lib/services/categories";
import { getTags } from "@/lib/services/tags";
import { PostCard } from "@/components/blog/post-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { generatePageMetadata } from "@/lib/seo";
import { Search, Filter, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";

export const metadata = generatePageMetadata({
  title: "Articles & Engineering Guides | ContentFlow",
  description:
    "Explore deep-dive technical publications, architecture case studies, and editorial essays.",
});

export const revalidate = 60;

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = Number(params.page || 1);
  const category = typeof params.category === "string" ? params.category : undefined;
  const tag = typeof params.tag === "string" ? params.tag : undefined;
  const search = typeof params.q === "string" ? params.q : undefined;
  const sort = typeof params.sort === "string" ? (params.sort as any) : "latest";

  const [postsResult, categories, tags] = await Promise.all([
    getPosts({
      page,
      limit: 9,
      status: "PUBLISHED",
      categorySlug: category,
      tagSlug: tag,
      search,
      sort,
    }),
    getCategories(),
    getTags(),
  ]);

  return (
    <div className="py-12">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 text-sky-700 dark:text-sky-300 text-xs font-semibold mb-3">
            <BookOpen className="h-3.5 w-3.5" /> All Publications
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Articles & Technical Insights
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Explore deep dives into modern web platforms, database design, React 19, and full-stack engineering.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm mb-10 flex flex-wrap items-center justify-between gap-4">
          {/* Categories Horizontal Scroll */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            <Link href="/blog">
              <Button
                size="sm"
                variant={!category ? "default" : "outline"}
                className="rounded-full text-xs font-medium"
              >
                All
              </Button>
            </Link>
            {categories.map((c) => (
              <Link key={c.id} href={`/blog?category=${c.slug}`}>
                <Button
                  size="sm"
                  variant={category === c.slug ? "default" : "outline"}
                  className="rounded-full text-xs font-medium shrink-0"
                >
                  {c.name}
                </Button>
              </Link>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground ml-auto">
            <span>Sort:</span>
            <Link
              href={`/blog?sort=latest${category ? `&category=${category}` : ""}`}
              className={`font-semibold ${sort === "latest" ? "text-sky-600" : "hover:text-foreground"}`}
            >
              Latest
            </Link>
            <span>•</span>
            <Link
              href={`/blog?sort=popular${category ? `&category=${category}` : ""}`}
              className={`font-semibold ${sort === "popular" ? "text-sky-600" : "hover:text-foreground"}`}
            >
              Most Popular
            </Link>
          </div>
        </div>

        {/* Post Grid */}
        {postsResult.data.length === 0 ? (
          <div className="text-center py-24 rounded-3xl border border-dashed border-border bg-card">
            <h3 className="text-lg font-bold text-foreground">No articles found</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              Try adjusting your category filters or search query to find what you are looking for.
            </p>
            <Link href="/blog" className="mt-4 inline-block">
              <Button size="sm" variant="outline">
                Clear Filters
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {postsResult.data.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {postsResult.meta.totalPages > 1 && (
          <div className="mt-16 flex items-center justify-center gap-4">
            {page > 1 && (
              <Link href={`/blog?page=${page - 1}${category ? `&category=${category}` : ""}`}>
                <Button variant="outline" size="sm" className="gap-1">
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
              </Link>
            )}
            <span className="text-xs font-semibold text-muted-foreground">
              Page {page} of {postsResult.meta.totalPages}
            </span>
            {page < postsResult.meta.totalPages && (
              <Link href={`/blog?page=${page + 1}${category ? `&category=${category}` : ""}`}>
                <Button variant="outline" size="sm" className="gap-1">
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
