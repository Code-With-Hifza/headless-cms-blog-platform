import Link from "next/link";
import Image from "next/image";
import { getPosts } from "@/lib/services/posts";
import { getCategories } from "@/lib/services/categories";
import { getAuthors } from "@/lib/services/authors";
import { PostCard } from "@/components/blog/post-card";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, TrendingUp, Compass, Users } from "lucide-react";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "ContentFlow — Next-Gen Publishing Platform & Headless CMS",
  description:
    "Explore high-signal engineering essays, modern web architecture, Next.js deep-dives, and composable publishing.",
});

export const revalidate = 60; // 60s cache revalidation

export default async function HomePage() {
  const [featuredResult, latestResult, categories, authors] = await Promise.all([
    getPosts({ status: "PUBLISHED", isFeatured: true, limit: 4 }),
    getPosts({ status: "PUBLISHED", limit: 6 }),
    getCategories(),
    getAuthors(),
  ]);

  const heroPost = featuredResult.data[0] || latestResult.data[0];
  const secondaryFeatured = featuredResult.data.slice(1, 4);

  return (
    <div className="pb-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-500/5 via-transparent to-transparent pt-8 pb-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-sky-600 dark:text-sky-400">
              <Sparkles className="h-4 w-4" />
              <span>Editorial Spotlight</span>
            </div>
            <Link
              href="/blog"
              className="group flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700"
            >
              Browse All Articles{" "}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {heroPost && <PostCard post={heroPost} variant="featured" />}
        </div>
      </section>

      {/* Featured Grid Section */}
      {secondaryFeatured.length > 0 && (
        <section className="py-12 border-t border-border/60">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-8">
              <TrendingUp className="h-5 w-5 text-sky-600" />
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Trending Architecture & Essays
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {secondaryFeatured.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Category Pills Strip */}
      <section className="py-12 bg-muted/30 border-y border-border/60">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Compass className="h-5 w-5 text-sky-600" />
              <h3 className="text-lg font-bold text-foreground">Explore Categories</h3>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="group flex flex-col items-center justify-center p-4 rounded-xl border border-border bg-card text-center transition-all hover:border-sky-500 hover:shadow-md hover:-translate-y-0.5"
              >
                <span className="text-xs font-bold text-foreground group-hover:text-sky-600 line-clamp-1">
                  {cat.name}
                </span>
                <span className="text-[11px] text-muted-foreground mt-1">
                  {cat.postCount} {cat.postCount === 1 ? "article" : "articles"}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Articles + Sidebar */}
      <section className="py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Main column */}
            <div className="lg:col-span-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                  Latest Publications
                </h2>
                <Link href="/blog">
                  <Button variant="ghost" size="sm" className="gap-1 text-xs">
                    View All <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {latestResult.data.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </div>

            {/* Sidebar Column */}
            <div className="lg:col-span-4 space-y-10">
              {/* Authors Spotlight */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6 pb-3 border-b border-border">
                  <Users className="h-4 w-4 text-sky-500" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                    Featured Authors
                  </h3>
                </div>

                <div className="space-y-4">
                  {authors.slice(0, 5).map((author) => (
                    <Link
                      key={author.id}
                      href={`/author/${author.slug}`}
                      className="group flex items-center gap-3 p-2 rounded-xl hover:bg-muted transition-colors"
                    >
                      {author.avatarUrl ? (
                        <Image
                          src={author.avatarUrl}
                          alt={author.displayName}
                          width={44}
                          height={44}
                          className="rounded-full object-cover ring-2 ring-background"
                        />
                      ) : (
                        <div className="h-11 w-11 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-sm">
                          {author.displayName.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h5 className="text-xs font-bold text-foreground group-hover:text-sky-600 line-clamp-1">
                          {author.displayName}
                        </h5>
                        <p className="text-[11px] text-muted-foreground line-clamp-1">
                          {author.bio || `${author.postCount} published articles`}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
