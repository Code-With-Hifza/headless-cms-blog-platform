import { db } from "@/lib/db";
import {
  posts,
  postTags,
  tags,
  categories,
  authors,
  media,
  comments,
  postViews,
  type postStatusEnum,
} from "@/lib/db/schema";
import {
  eq,
  and,
  or,
  desc,
  asc,
  ilike,
  sql,
  inArray,
  lte,
  count,
} from "drizzle-orm";
import { slugify, calculateReadingTime, countWords, sanitizeHtml } from "@/lib/utils";
import { canModifyPost, hasPermission, type Role } from "@/lib/permissions";
import { revalidatePath } from "next/cache";

export interface GetPostsParams {
  page?: number;
  limit?: number;
  search?: string;
  categorySlug?: string;
  tagSlug?: string;
  authorSlug?: string;
  status?: "DRAFT" | "IN_REVIEW" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";
  sort?: "latest" | "oldest" | "popular" | "title";
  isFeatured?: boolean;
}

export async function getPosts(params: GetPostsParams = {}) {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 10));
  const offset = (page - 1) * limit;

  const conditions = [];

  if (params.status) {
    conditions.push(eq(posts.status, params.status));
  }

  if (params.isFeatured !== undefined) {
    conditions.push(eq(posts.isFeatured, params.isFeatured));
  }

  if (params.search) {
    const searchPattern = `%${params.search}%`;
    conditions.push(
      or(
        ilike(posts.title, searchPattern),
        ilike(posts.excerpt, searchPattern),
        ilike(posts.content, searchPattern)
      )
    );
  }

  let sortOrder = desc(posts.publishedAt);
  if (params.sort === "oldest") sortOrder = asc(posts.publishedAt);
  if (params.sort === "popular") sortOrder = desc(posts.viewsCount);
  if (params.sort === "title") sortOrder = asc(posts.title);

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalResult] = await db
    .select({ count: count() })
    .from(posts)
    .where(whereClause);

  const total = Number(totalResult?.count || 0);

  const items = await db.query.posts.findMany({
    where: whereClause,
    orderBy: [sortOrder, desc(posts.createdAt)],
    limit,
    offset,
    with: {
      author: true,
      category: true,
      featuredImage: true,
      postTags: {
        with: {
          tag: true,
        },
      },
    },
  });

  return {
    data: items,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function getPublishedPostBySlug(slug: string, previewToken?: string) {
  const post = await db.query.posts.findFirst({
    where: eq(posts.slug, slug),
    with: {
      author: true,
      category: true,
      featuredImage: true,
      ogImage: true,
      postTags: {
        with: {
          tag: true,
        },
      },
    },
  });

  if (!post) return null;

  // If published, return directly
  if (post.status === "PUBLISHED") {
    return post;
  }

  // If preview token matches and not expired, allow viewing draft
  if (
    previewToken &&
    post.previewToken === previewToken &&
    post.previewExpiresAt &&
    new Date(post.previewExpiresAt) > new Date()
  ) {
    return post;
  }

  return null;
}

export async function getPostById(id: string) {
  return await db.query.posts.findFirst({
    where: eq(posts.id, id),
    with: {
      author: true,
      category: true,
      featuredImage: true,
      ogImage: true,
      postTags: {
        with: {
          tag: true,
        },
      },
    },
  });
}

export async function createPost(
  data: {
    title: string;
    slug?: string;
    excerpt?: string | null;
    content?: string;
    featuredImageId?: string | null;
    authorId: string;
    categoryId?: string | null;
    tagIds?: string[];
    status?: "DRAFT" | "IN_REVIEW" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";
    publishedAt?: string | null;
    scheduledAt?: string | null;
    seoTitle?: string | null;
    seoDescription?: string | null;
    canonicalUrl?: string | null;
    ogImageId?: string | null;
    isFeatured?: boolean;
  },
  currentUserId: string,
  userRoles: Role[]
) {
  if (!hasPermission(userRoles, "post:create")) {
    throw new Error("Forbidden: You do not have permission to create posts");
  }

  // Ensure unique slug
  let baseSlug = data.slug ? slugify(data.slug) : slugify(data.title);
  let uniqueSlug = baseSlug;
  let counter = 1;
  while (true) {
    const existing = await db.query.posts.findFirst({
      where: eq(posts.slug, uniqueSlug),
    });
    if (!existing) break;
    uniqueSlug = `${baseSlug}-${counter}`;
    counter++;
  }

  const rawContent = data.content || "";
  const sanitizedContent = sanitizeHtml(rawContent);
  const readingTime = calculateReadingTime(sanitizedContent);
  const wordCount = countWords(sanitizedContent);

  const initialStatus = data.status || "DRAFT";
  const publishedAtDate =
    initialStatus === "PUBLISHED"
      ? data.publishedAt
        ? new Date(data.publishedAt)
        : new Date()
      : null;

  const [newPost] = await db
    .insert(posts)
    .values({
      title: data.title,
      slug: uniqueSlug,
      excerpt: data.excerpt || null,
      content: sanitizedContent,
      featuredImageId: data.featuredImageId || null,
      authorId: data.authorId,
      categoryId: data.categoryId || null,
      status: initialStatus,
      publishedAt: publishedAtDate,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
      seoTitle: data.seoTitle || data.title,
      seoDescription: data.seoDescription || data.excerpt,
      canonicalUrl: data.canonicalUrl || null,
      ogImageId: data.ogImageId || null,
      readingTime,
      wordCount,
      isFeatured: data.isFeatured || false,
    })
    .returning();

  if (data.tagIds && data.tagIds.length > 0) {
    const tagInserts = data.tagIds.map((tagId) => ({
      postId: newPost.id,
      tagId,
    }));
    await db.insert(postTags).values(tagInserts);
  }

  revalidatePath("/blog");
  revalidatePath("/");
  return newPost;
}

export async function updatePost(
  id: string,
  data: Partial<{
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    featuredImageId: string | null;
    authorId: string;
    categoryId: string | null;
    tagIds: string[];
    status: "DRAFT" | "IN_REVIEW" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";
    publishedAt: string | null;
    scheduledAt: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
    canonicalUrl: string | null;
    ogImageId: string | null;
    isFeatured: boolean;
  }>,
  currentUserId: string,
  userRoles: Role[]
) {
  const existing = await db.query.posts.findFirst({
    where: eq(posts.id, id),
    with: { author: true },
  });

  if (!existing) {
    throw new Error("Post not found");
  }

  if (!canModifyPost(userRoles, currentUserId, existing.author?.userId)) {
    throw new Error("Forbidden: You cannot modify this post");
  }

  const updateFields: Record<string, any> = {
    updatedAt: new Date(),
  };

  if (data.title !== undefined) updateFields.title = data.title;
  if (data.excerpt !== undefined) updateFields.excerpt = data.excerpt;
  if (data.featuredImageId !== undefined) updateFields.featuredImageId = data.featuredImageId;
  if (data.authorId !== undefined) updateFields.authorId = data.authorId;
  if (data.categoryId !== undefined) updateFields.categoryId = data.categoryId;
  if (data.seoTitle !== undefined) updateFields.seoTitle = data.seoTitle;
  if (data.seoDescription !== undefined) updateFields.seoDescription = data.seoDescription;
  if (data.canonicalUrl !== undefined) updateFields.canonicalUrl = data.canonicalUrl;
  if (data.ogImageId !== undefined) updateFields.ogImageId = data.ogImageId;
  if (data.isFeatured !== undefined) updateFields.isFeatured = data.isFeatured;

  if (data.slug && data.slug !== existing.slug) {
    const cleanSlug = slugify(data.slug);
    const conflict = await db.query.posts.findFirst({
      where: and(eq(posts.slug, cleanSlug), sql`${posts.id} != ${id}`),
    });
    if (conflict) {
      throw new Error(`Slug "${cleanSlug}" is already in use by another post`);
    }
    updateFields.slug = cleanSlug;
  }

  if (data.content !== undefined) {
    const sanitized = sanitizeHtml(data.content);
    updateFields.content = sanitized;
    updateFields.readingTime = calculateReadingTime(sanitized);
    updateFields.wordCount = countWords(sanitized);
  }

  if (data.status !== undefined) {
    if (["PUBLISHED", "ARCHIVED"].includes(data.status) && !hasPermission(userRoles, "post:publish")) {
      throw new Error("Forbidden: Only editors/admins can publish or archive posts");
    }
    updateFields.status = data.status;
    if (data.status === "PUBLISHED" && !existing.publishedAt) {
      updateFields.publishedAt = new Date();
    }
  }

  if (data.scheduledAt !== undefined) {
    updateFields.scheduledAt = data.scheduledAt ? new Date(data.scheduledAt) : null;
  }

  const [updatedPost] = await db
    .update(posts)
    .set(updateFields)
    .where(eq(posts.id, id))
    .returning();

  if (data.tagIds !== undefined) {
    await db.delete(postTags).where(eq(postTags.postId, id));
    if (data.tagIds.length > 0) {
      await db.insert(postTags).values(
        data.tagIds.map((tagId) => ({
          postId: id,
          tagId,
        }))
      );
    }
  }

  revalidatePath(`/blog/${updatedPost.slug}`);
  revalidatePath("/blog");
  revalidatePath("/");
  return updatedPost;
}

export async function deletePost(id: string, currentUserId: string, userRoles: Role[]) {
  const existing = await db.query.posts.findFirst({
    where: eq(posts.id, id),
    with: { author: true },
  });

  if (!existing) {
    throw new Error("Post not found");
  }

  if (!canModifyPost(userRoles, currentUserId, existing.author?.userId)) {
    throw new Error("Forbidden: You cannot delete this post");
  }

  await db.delete(posts).where(eq(posts.id, id));
  revalidatePath("/blog");
  revalidatePath("/");
  return { success: true };
}

export async function generatePreviewToken(id: string) {
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await db
    .update(posts)
    .set({
      previewToken: token,
      previewExpiresAt: expiresAt,
    })
    .where(eq(posts.id, id));

  return token;
}

export async function getRelatedPosts(postId: string, categoryId: string | null, limit = 3) {
  if (!categoryId) {
    return await db.query.posts.findMany({
      where: and(eq(posts.status, "PUBLISHED"), sql`${posts.id} != ${postId}`),
      orderBy: [desc(posts.publishedAt)],
      limit,
      with: { author: true, category: true, featuredImage: true },
    });
  }

  return await db.query.posts.findMany({
    where: and(
      eq(posts.status, "PUBLISHED"),
      eq(posts.categoryId, categoryId),
      sql`${posts.id} != ${postId}`
    ),
    orderBy: [desc(posts.publishedAt)],
    limit,
    with: { author: true, category: true, featuredImage: true },
  });
}

export async function incrementPostViews(postId: string, ipHash?: string) {
  try {
    await db.insert(postViews).values({
      postId,
      ipHash: ipHash || null,
    });

    await db
      .update(posts)
      .set({
        viewsCount: sql`${posts.viewsCount} + 1`,
      })
      .where(eq(posts.id, postId));
  } catch (err) {
    console.error("Failed to track view:", err);
  }
}

/**
 * Server-side cron worker: Publishes all posts where status = SCHEDULED and scheduledAt <= now()
 */
export async function processScheduledPosts() {
  const now = new Date();
  const duePosts = await db.query.posts.findMany({
    where: and(eq(posts.status, "SCHEDULED"), lte(posts.scheduledAt, now)),
  });

  if (duePosts.length === 0) return { publishedCount: 0 };

  for (const post of duePosts) {
    await db
      .update(posts)
      .set({
        status: "PUBLISHED",
        publishedAt: post.scheduledAt || now,
        updatedAt: now,
      })
      .where(eq(posts.id, post.id));
  }

  revalidatePath("/blog");
  revalidatePath("/");
  return { publishedCount: duePosts.length };
}
