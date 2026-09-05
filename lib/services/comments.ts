import { db } from "@/lib/db";
import { comments } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { sanitizeHtml } from "@/lib/utils";

export async function getCommentsForPost(postId: string) {
  return await db.query.comments.findMany({
    where: and(eq(comments.postId, postId), eq(comments.status, "APPROVED")),
    orderBy: [desc(comments.createdAt)],
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });
}

export async function getAllComments(statusFilter?: "PENDING" | "APPROVED" | "REJECTED" | "SPAM") {
  const whereClause = statusFilter ? eq(comments.status, statusFilter) : undefined;
  return await db.query.comments.findMany({
    where: whereClause,
    orderBy: [desc(comments.createdAt)],
    with: {
      post: {
        columns: {
          id: true,
          title: true,
          slug: true,
        },
      },
      user: {
        columns: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });
}

export async function createComment(data: {
  postId: string;
  userId?: string | null;
  authorName: string;
  authorEmail: string;
  content: string;
  parentId?: string | null;
}) {
  const settings = await db.query.siteSettings.findFirst({
    where: eq(comments.id, "default"),
  });

  const requiresModeration = settings?.requireCommentModeration ?? true;
  const initialStatus = requiresModeration ? "PENDING" : "APPROVED";

  const cleanContent = sanitizeHtml(data.content);

  const [comment] = await db
    .insert(comments)
    .values({
      postId: data.postId,
      userId: data.userId || null,
      authorName: data.authorName,
      authorEmail: data.authorEmail,
      content: cleanContent,
      status: initialStatus,
      parentId: data.parentId || null,
    })
    .returning();

  return comment;
}

export async function updateCommentStatus(
  id: string,
  status: "PENDING" | "APPROVED" | "REJECTED" | "SPAM"
) {
  const [updated] = await db
    .update(comments)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(comments.id, id))
    .returning();

  return updated;
}

export async function deleteComment(id: string) {
  await db.delete(comments).where(eq(comments.id, id));
  return { success: true };
}
