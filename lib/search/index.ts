import { db } from "@/lib/db";
import { posts, categories, tags, authors } from "@/lib/db/schema";
import { eq, or, ilike, and, desc } from "drizzle-orm";

export async function searchContent(query: string, limit = 10) {
  if (!query || query.trim().length === 0) {
    return { posts: [], categories: [], tags: [], authors: [] };
  }

  const cleanQuery = query.trim();
  const pattern = `%${cleanQuery}%`;

  const [matchingPosts, matchingCategories, matchingTags, matchingAuthors] =
    await Promise.all([
      db.query.posts.findMany({
        where: and(
          eq(posts.status, "PUBLISHED"),
          or(
            ilike(posts.title, pattern),
            ilike(posts.excerpt, pattern),
            ilike(posts.content, pattern)
          )
        ),
        orderBy: [desc(posts.publishedAt)],
        limit,
        with: {
          author: true,
          category: true,
          featuredImage: true,
        },
      }),

      db.query.categories.findMany({
        where: or(
          ilike(categories.name, pattern),
          ilike(categories.description, pattern)
        ),
        limit: 5,
      }),

      db.query.tags.findMany({
        where: ilike(tags.name, pattern),
        limit: 5,
      }),

      db.query.authors.findMany({
        where: or(
          ilike(authors.displayName, pattern),
          ilike(authors.bio, pattern)
        ),
        limit: 5,
      }),
    ]);

  return {
    posts: matchingPosts,
    categories: matchingCategories,
    tags: matchingTags,
    authors: matchingAuthors,
  };
}
