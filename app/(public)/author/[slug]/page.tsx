import { notFound } from "next/navigation";
import Image from "next/image";
import { getAuthorBySlug } from "@/lib/services/authors";
import { PostCard } from "@/components/blog/post-card";
import { generatePageMetadata, generateJsonLdBreadcrumb } from "@/lib/seo";
import { Globe, Twitter, Linkedin, Github } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);

  if (!author) return { title: "Author Not Found" };

  return generatePageMetadata({
    title: `${author.displayName} — Author Profile | ContentFlow`,
    description: author.bio || `Read articles and publications by ${author.displayName}`,
    path: `/author/${author.slug}`,
    image: author.avatarUrl || undefined,
  });
}

export const dynamic = "force-dynamic";

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);

  if (!author) {
    notFound();
  }

  const jsonLdBreadcrumbs = generateJsonLdBreadcrumb([
    { name: "Home", item: "/" },
    { name: "Authors", item: "/blog" },
    { name: author.displayName, item: `/author/${author.slug}` },
  ]);

  return (
    <div className="py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumbs) }}
      />
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Author Bio Header Card */}
        <div className="rounded-3xl border border-border bg-card p-8 sm:p-12 shadow-sm mb-16 flex flex-col md:flex-row items-center md:items-start gap-8">
          {author.avatarUrl ? (
            <Image
              src={author.avatarUrl}
              alt={author.displayName}
              width={120}
              height={120}
              className="rounded-full object-cover shrink-0 ring-4 ring-sky-500/20 shadow-md"
            />
          ) : (
            <div className="h-28 w-28 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-3xl shrink-0">
              {author.displayName.charAt(0)}
            </div>
          )}

          <div className="flex-1 text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-sky-600">Author Profile</span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mt-1">
              {author.displayName}
            </h1>

            {author.bio && (
              <p className="mt-4 text-base text-muted-foreground leading-relaxed max-w-3xl">
                {author.bio}
              </p>
            )}

            {/* Social profiles */}
            <div className="mt-6 flex items-center justify-center md:justify-start gap-4 text-muted-foreground">
              {author.websiteUrl && (
                <a href={author.websiteUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs hover:text-sky-600 font-medium">
                  <Globe className="h-4 w-4" /> Website
                </a>
              )}
              {author.twitterUrl && (
                <a href={author.twitterUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs hover:text-sky-500 font-medium">
                  <Twitter className="h-4 w-4" /> Twitter/X
                </a>
              )}
              {author.linkedinUrl && (
                <a href={author.linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs hover:text-blue-600 font-medium">
                  <Linkedin className="h-4 w-4" /> LinkedIn
                </a>
              )}
              {author.githubUrl && (
                <a href={author.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs hover:text-foreground font-medium">
                  <Github className="h-4 w-4" /> GitHub
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Author Posts */}
        <div>
          <h3 className="text-2xl font-bold tracking-tight text-foreground mb-8">
            Articles by {author.displayName} ({author.posts.length})
          </h3>

          {author.posts.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-border rounded-2xl bg-card">
              <p className="text-sm text-muted-foreground">No published posts by this author yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {author.posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={{
                    ...post,
                    author: { displayName: author.displayName, avatarUrl: author.avatarUrl, slug: author.slug },
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
