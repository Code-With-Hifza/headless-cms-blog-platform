import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getPublishedPostBySlug, getRelatedPosts, incrementPostViews } from "@/lib/services/posts";
import { getCommentsForPost } from "@/lib/services/comments";
import { TableOfContents } from "@/components/blog/table-of-contents";
import { SocialShare } from "@/components/blog/social-share";
import { CommentSection } from "@/components/blog/comment-section";
import { PostCard } from "@/components/blog/post-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { generatePageMetadata, generateJsonLdArticle, generateJsonLdBreadcrumb } from "@/lib/seo";
import { Calendar, Clock, ArrowLeft, Twitter, Linkedin, Github, Globe } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) {
    return { title: "Post Not Found" };
  }

  return generatePageMetadata({
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt || post.title,
    path: `/blog/${post.slug}`,
    image: post.ogImage?.fileUrl || post.featuredImage?.fileUrl,
    type: "article",
    publishedTime: post.publishedAt?.toISOString(),
    authors: post.author ? [post.author.displayName] : [],
  });
}

export const revalidate = 60;

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Increment view counter
  await incrementPostViews(post.id);

  const [relatedPosts, postComments] = await Promise.all([
    getRelatedPosts(post.id, post.categoryId, 3),
    getCommentsForPost(post.id),
  ]);

  const jsonLd = generateJsonLdArticle(post);
  const breadcrumbJsonLd = generateJsonLdBreadcrumb([
    { name: "Home", item: "/" },
    { name: "Blog", item: "/blog" },
    { name: post.category?.name || "Articles", item: post.category ? `/category/${post.category.slug}` : "/blog" },
    { name: post.title, item: `/blog/${post.slug}` },
  ]);

  const featuredImg =
    post.featuredImage?.fileUrl ||
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200";

  return (
    <article className="py-12">
      {/* Inject Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
          <Link href="/blog" className="flex items-center gap-1 hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Articles
          </Link>
          {post.category && (
            <>
              <span>/</span>
              <Link href={`/category/${post.category.slug}`} className="hover:text-sky-600 font-medium">
                {post.category.name}
              </Link>
            </>
          )}
        </div>

        {/* Article Header */}
        <header className="max-w-4xl mx-auto text-center mb-12">
          {post.category && (
            <Link href={`/category/${post.category.slug}`}>
              <Badge className="bg-sky-500/10 text-sky-700 dark:text-sky-300 font-semibold mb-4 hover:bg-sky-500/20">
                {post.category.name}
              </Badge>
            </Link>
          )}

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              {post.excerpt}
            </p>
          )}

          {/* Author & Meta bar */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground border-y border-border py-4">
            {post.author && (
              <Link href={`/author/${post.author.slug}`} className="flex items-center gap-2.5 font-semibold text-foreground hover:text-sky-600">
                {post.author.avatarUrl ? (
                  <Image
                    src={post.author.avatarUrl}
                    alt={post.author.displayName}
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                    {post.author.displayName.charAt(0)}
                  </div>
                )}
                <span>{post.author.displayName}</span>
              </Link>
            )}

            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(post.publishedAt || post.createdAt)}
            </span>

            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {post.readingTime} min read
            </span>

            <SocialShare title={post.title} slug={post.slug} />
          </div>
        </header>

        {/* Featured Image */}
        <div className="relative aspect-[21/9] max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-2xl mb-16 bg-muted">
          <Image
            src={featuredImg}
            alt={post.featuredImage?.altText || post.title}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1200px) 100vw, 1200px"
          />
        </div>

        {/* Article Content + Table of Contents Layout */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Prose Content */}
          <div className="lg:col-span-8 max-w-none">
            <div
              className="prose-content"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Post Tags */}
            {post.postTags && post.postTags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-border flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground mr-2">Tags:</span>
                {post.postTags.map(({ tag }) => (
                  <Link key={tag.id} href={`/tag/${tag.slug}`}>
                    <Badge variant="outline" className="hover:bg-muted font-medium">
                      #{tag.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}

            {/* Author Biography Box */}
            {post.author && (
              <div className="mt-12 rounded-2xl border border-border bg-card p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-sm">
                {post.author.avatarUrl ? (
                  <Image
                    src={post.author.avatarUrl}
                    alt={post.author.displayName}
                    width={80}
                    height={80}
                    className="rounded-full object-cover shrink-0 ring-4 ring-sky-500/20"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-2xl shrink-0">
                    {post.author.displayName.charAt(0)}
                  </div>
                )}
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600">Written by</span>
                      <h4 className="text-lg font-bold text-foreground">
                        <Link href={`/author/${post.author.slug}`} className="hover:text-sky-600">
                          {post.author.displayName}
                        </Link>
                      </h4>
                    </div>
                    {/* Social links */}
                    <div className="flex items-center justify-center sm:justify-end gap-2 text-muted-foreground">
                      {post.author.websiteUrl && (
                        <a href={post.author.websiteUrl} target="_blank" rel="noreferrer" className="hover:text-sky-500">
                          <Globe className="h-4 w-4" />
                        </a>
                      )}
                      {post.author.twitterUrl && (
                        <a href={post.author.twitterUrl} target="_blank" rel="noreferrer" className="hover:text-sky-500">
                          <Twitter className="h-4 w-4" />
                        </a>
                      )}
                      {post.author.linkedinUrl && (
                        <a href={post.author.linkedinUrl} target="_blank" rel="noreferrer" className="hover:text-blue-600">
                          <Linkedin className="h-4 w-4" />
                        </a>
                      )}
                      {post.author.githubUrl && (
                        <a href={post.author.githubUrl} target="_blank" rel="noreferrer" className="hover:text-foreground">
                          <Github className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                  {post.author.bio && (
                    <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                      {post.author.bio}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Comments Section */}
            <CommentSection postId={post.id} initialComments={postComments} />
          </div>

          {/* Sticky Sidebar (Table of Contents & Share) */}
          <aside className="hidden lg:block lg:col-span-4 space-y-6">
            <TableOfContents content={post.content} />
          </aside>
        </div>

        {/* Related Posts Section */}
        {relatedPosts.length > 0 && (
          <section className="mt-24 pt-16 border-t border-border">
            <h3 className="text-2xl font-bold tracking-tight text-foreground mb-8">
              Related Articles & Next Reads
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map((relPost) => (
                <PostCard key={relPost.id} post={relPost} />
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
