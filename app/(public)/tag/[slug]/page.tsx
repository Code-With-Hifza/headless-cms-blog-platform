import { notFound } from "next/navigation";
import { getTagBySlug } from "@/lib/services/tags";
import { getPosts } from "@/lib/services/posts";
import { PostCard } from "@/components/blog/post-card";
import { generatePageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);

  if (!tag) return { title: "Tag Not Found" };

  return generatePageMetadata({
    title: `#${tag.name} Posts | ContentFlow`,
    description: tag.description || `Browse articles tagged #${tag.name}`,
    path: `/tag/${tag.slug}`,
  });
}

export const revalidate = 60;

export default async function TagPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);

  if (!tag) {
    notFound();
  }

  const postsResult = await getPosts({
    tagSlug: slug,
    status: "PUBLISHED",
    limit: 12,
  });

  return (
    <div className="py-12">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="max-w-3xl mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-sky-600">Tag Archive</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground mt-2">
            #{tag.name}
          </h1>
          {tag.description && (
            <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
              {tag.description}
            </p>
          )}
        </header>

        {postsResult.data.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-2xl bg-card">
            <p className="text-sm text-muted-foreground">No published posts with this tag yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {postsResult.data.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
