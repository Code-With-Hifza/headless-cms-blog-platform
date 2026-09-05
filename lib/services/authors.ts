import { db } from "@/lib/db";
import { authors, posts } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export async function getAuthors() {
  const items = await db.query.authors.findMany({
    orderBy: [desc(authors.createdAt)],
    with: {
      user: true,
      posts: {
        where: eq(posts.status, "PUBLISHED"),
      },
    },
  });

  return items.map((author) => ({
    ...author,
    postCount: author.posts.length,
  }));
}

export async function getAuthorBySlug(slug: string) {
  return await db.query.authors.findFirst({
    where: eq(authors.slug, slug),
    with: {
      posts: {
        where: eq(posts.status, "PUBLISHED"),
        with: {
          category: true,
          featuredImage: true,
        },
      },
    },
  });
}

export async function createAuthor(data: {
  userId?: string | null;
  displayName: string;
  slug?: string;
  bio?: string | null;
  avatarUrl?: string | null;
  websiteUrl?: string | null;
  twitterUrl?: string | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
}) {
  const baseSlug = data.slug ? slugify(data.slug) : slugify(data.displayName);

  const existing = await db.query.authors.findFirst({
    where: eq(authors.slug, baseSlug),
  });
  if (existing) {
    throw new Error(`Author with slug "${baseSlug}" already exists`);
  }

  const [created] = await db
    .insert(authors)
    .values({
      userId: data.userId || null,
      displayName: data.displayName,
      slug: baseSlug,
      bio: data.bio || null,
      avatarUrl: data.avatarUrl || null,
      websiteUrl: data.websiteUrl || null,
      twitterUrl: data.twitterUrl || null,
      linkedinUrl: data.linkedinUrl || null,
      githubUrl: data.githubUrl || null,
    })
    .returning();

  revalidatePath("/authors");
  return created;
}

export async function updateAuthor(
  id: string,
  data: Partial<{
    displayName: string;
    slug: string;
    bio: string | null;
    avatarUrl: string | null;
    websiteUrl: string | null;
    twitterUrl: string | null;
    linkedinUrl: string | null;
    githubUrl: string | null;
  }>
) {
  const updateFields: Record<string, any> = { updatedAt: new Date() };
  if (data.displayName !== undefined) updateFields.displayName = data.displayName;
  if (data.bio !== undefined) updateFields.bio = data.bio;
  if (data.avatarUrl !== undefined) updateFields.avatarUrl = data.avatarUrl;
  if (data.websiteUrl !== undefined) updateFields.websiteUrl = data.websiteUrl;
  if (data.twitterUrl !== undefined) updateFields.twitterUrl = data.twitterUrl;
  if (data.linkedinUrl !== undefined) updateFields.linkedinUrl = data.linkedinUrl;
  if (data.githubUrl !== undefined) updateFields.githubUrl = data.githubUrl;

  if (data.slug) {
    const cleanSlug = slugify(data.slug);
    const existing = await db.query.authors.findFirst({
      where: eq(authors.slug, cleanSlug),
    });
    if (existing && existing.id !== id) {
      throw new Error(`Author slug "${cleanSlug}" is already taken`);
    }
    updateFields.slug = cleanSlug;
  }

  const [updated] = await db
    .update(authors)
    .set(updateFields)
    .where(eq(authors.id, id))
    .returning();

  revalidatePath("/authors");
  return updated;
}

export async function deleteAuthor(id: string) {
  await db.delete(authors).where(eq(authors.id, id));
  revalidatePath("/authors");
  return { success: true };
}
