import Link from "next/link";
import Image from "next/image";
import { Clock, Calendar, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface PostCardProps {
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt?: string | null;
    publishedAt?: Date | string | null;
    createdAt?: Date | string | null;
    readingTime?: number;
    featuredImage?: { fileUrl: string; altText?: string | null } | null;
    category?: { name: string; slug: string } | null;
    author?: { displayName: string; avatarUrl?: string | null; slug: string } | null;
  };
  variant?: "default" | "featured" | "compact";
}

export function PostCard({ post, variant = "default" }: PostCardProps) {
  const imageUrl =
    post.featuredImage?.fileUrl ||
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800";

  const displayDate = formatDate(post.publishedAt || post.createdAt);

  if (variant === "compact") {
    return (
      <article className="group flex items-center gap-4 py-3 border-b border-border/60 last:border-0">
        <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
          <Image
            src={imageUrl}
            alt={post.featuredImage?.altText || post.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="80px"
          />
        </div>
        <div className="flex-1 min-w-0">
          {post.category && (
            <span className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
              {post.category.name}
            </span>
          )}
          <h4 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-sky-600 transition-colors">
            <Link href={`/blog/${post.slug}`}>{post.title}</Link>
          </h4>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
            <span>{displayDate}</span>
            <span>•</span>
            <span>{post.readingTime || 1} min read</span>
          </p>
        </div>
      </article>
    );
  }

  if (variant === "featured") {
    return (
      <article className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-lg transition-all duration-300 hover:shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Image col */}
        <div className="relative h-72 lg:h-full lg:col-span-7 overflow-hidden bg-muted">
          <Image
            src={imageUrl}
            alt={post.featuredImage?.altText || post.title}
            fill
            priority
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 1024px) 100vw, 60vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:hidden" />
          {post.category && (
            <div className="absolute top-4 left-4 z-10">
              <Link href={`/category/${post.category.slug}`}>
                <Badge className="bg-sky-600 text-white font-medium hover:bg-sky-700 shadow-md">
                  {post.category.name}
                </Badge>
              </Link>
            </div>
          )}
        </div>

        {/* Content col */}
        <div className="p-6 sm:p-8 lg:p-10 lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="hidden lg:flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400 mb-3">
              {post.category?.name || "Featured Essay"}
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground group-hover:text-sky-600 transition-colors line-clamp-3">
              <Link href={`/blog/${post.slug}`} className="flex items-start gap-1">
                <span>{post.title}</span>
                <ArrowUpRight className="h-6 w-6 shrink-0 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all text-sky-500" />
              </Link>
            </h3>
            {post.excerpt && (
              <p className="mt-3 text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                {post.excerpt}
              </p>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-border flex items-center justify-between">
            {post.author && (
              <Link href={`/author/${post.author.slug}`} className="flex items-center gap-2.5 group/author">
                {post.author.avatarUrl ? (
                  <Image
                    src={post.author.avatarUrl}
                    alt={post.author.displayName}
                    width={36}
                    height={36}
                    className="rounded-full object-cover ring-2 ring-background"
                  />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
                    {post.author.displayName.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold text-foreground group-hover/author:text-sky-600">
                    {post.author.displayName}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{displayDate}</p>
                </div>
              </Link>
            )}

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <Clock className="h-3.5 w-3.5" />
              <span>{post.readingTime || 1} min read</span>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // Default Card
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      {/* Featured Image */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
        <Image
          src={imageUrl}
          alt={post.featuredImage?.altText || post.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {post.category && (
          <div className="absolute top-3 left-3 z-10">
            <Link href={`/category/${post.category.slug}`}>
              <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm hover:bg-background shadow-sm text-xs font-semibold">
                {post.category.name}
              </Badge>
            </Link>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
        <div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {displayDate}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {post.readingTime || 1} min read
            </span>
          </div>

          <h3 className="text-lg font-bold tracking-tight text-foreground group-hover:text-sky-600 transition-colors line-clamp-2">
            <Link href={`/blog/${post.slug}`}>{post.title}</Link>
          </h3>

          {post.excerpt && (
            <p className="mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {post.excerpt}
            </p>
          )}
        </div>

        {/* Author Footer */}
        {post.author && (
          <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
            <Link href={`/author/${post.author.slug}`} className="flex items-center gap-2 group/author">
              {post.author.avatarUrl ? (
                <Image
                  src={post.author.avatarUrl}
                  alt={post.author.displayName}
                  width={28}
                  height={28}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="h-7 w-7 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
                  {post.author.displayName.charAt(0)}
                </div>
              )}
              <span className="text-xs font-semibold text-foreground group-hover/author:text-sky-600">
                {post.author.displayName}
              </span>
            </Link>

            <Link href={`/blog/${post.slug}`} className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-0.5">
              Read <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>
    </article>
  );
}
