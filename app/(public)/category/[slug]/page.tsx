import { notFound } from "next/navigation";
import { getCategoryBySlug } from "@/lib/services/categories";
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
  const category = await getCategoryBySlug(slug);

  if (!category) return { title: "Category Not Found" };

  return generatePageMetadata({
    title: `${category.name} Articles | ContentFlow`,
    description: category.description || `Browse articles in ${category.name}`,
    path: `/category/${category.slug}`,
  });
}

export const revalidate = 60;

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const postsResult = await getPosts({
    categorySlug: slug,
    status: "PUBLISHED",
    limit: 12,
  });

  return (
    <div className="py-12">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="max-w-3xl mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-sky-600">Category Archive</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground mt-2">
            {category.name}
          </h1>
          {category.description && (
            <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
              {category.description}
            </p>
          )}
        </header>

        {postsResult.data.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-2xl bg-card">
            <p className="text-sm text-muted-foreground">No published posts in this category yet.</p>
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
