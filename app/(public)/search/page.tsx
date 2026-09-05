import { searchContent } from "@/lib/search";
import { PostCard } from "@/components/blog/post-card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Search as SearchIcon, Compass, Tag, Users } from "lucide-react";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Search Content | ContentFlow",
  description: "Search across technical articles, categories, authors, and topics.",
});

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || "";

  const results = query ? await searchContent(query, 12) : null;

  return (
    <div className="py-12">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Search Header */}
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Search ContentFlow
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Instant full-text search across all published articles, tags, authors, and categories.
          </p>

          <form action="/search" method="GET" className="mt-6 relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search by keyword, topic, author, or tech..."
              className="h-12 w-full rounded-2xl border border-input bg-card pl-12 pr-4 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </form>
        </div>

        {query && results && (
          <div className="space-y-12">
            {/* Matching Categories & Tags Pills */}
            {(results.categories.length > 0 || results.tags.length > 0) && (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
                  Matching Topics & Categories
                </h4>
                <div className="flex flex-wrap items-center gap-3">
                  {results.categories.map((c) => (
                    <Link key={c.id} href={`/category/${c.slug}`}>
                      <Badge className="bg-sky-500/10 text-sky-700 dark:text-sky-300 hover:bg-sky-500/20 px-3 py-1 font-semibold">
                        <Compass className="h-3.5 w-3.5 mr-1" />
                        {c.name}
                      </Badge>
                    </Link>
                  ))}
                  {results.tags.map((t) => (
                    <Link key={t.id} href={`/tag/${t.slug}`}>
                      <Badge variant="outline" className="px-3 py-1 font-medium hover:bg-muted">
                        <Tag className="h-3 w-3 mr-1" />
                        #{t.name}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Matching Articles */}
            <div>
              <h3 className="text-xl font-bold tracking-tight text-foreground mb-6">
                Matching Articles ({results.posts.length})
              </h3>

              {results.posts.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-border rounded-2xl bg-card">
                  <p className="text-sm text-muted-foreground">
                    No articles found matching &quot;{query}&quot;. Try different keywords or browse our categories.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {results.posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
