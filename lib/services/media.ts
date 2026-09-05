import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";
import { eq, desc, ilike, or } from "drizzle-orm";
import { deleteFile } from "@/lib/storage";

export async function getMediaList(params: { search?: string; type?: string } = {}) {
  const conditions = [];

  if (params.search) {
    conditions.push(
      or(
        ilike(media.fileName, `%${params.search}%`),
        ilike(media.altText, `%${params.search}%`)
      )
    );
  }

  if (params.type) {
    conditions.push(eq(media.fileType, params.type));
  }

  return await db.query.media.findMany({
    orderBy: [desc(media.createdAt)],
    with: {
      uploader: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

export async function getMediaById(id: string) {
  return await db.query.media.findFirst({
    where: eq(media.id, id),
  });
}

export async function createMediaRecord(data: {
  fileName: string;
  fileUrl: string;
  fileType: string;
  mimeType: string;
  fileSize: number;
  width?: number | null;
  height?: number | null;
  altText?: string | null;
  caption?: string | null;
  uploaderId?: string | null;
  provider?: string;
}) {
  const [record] = await db
    .insert(media)
    .values({
      fileName: data.fileName,
      fileUrl: data.fileUrl,
      fileType: data.fileType,
      mimeType: data.mimeType,
      fileSize: data.fileSize,
      width: data.width || null,
      height: data.height || null,
      altText: data.altText || data.fileName,
      caption: data.caption || null,
      uploaderId: data.uploaderId || null,
      provider: data.provider || "local",
    })
    .returning();

  return record;
}

export async function updateMedia(
  id: string,
  data: { altText?: string | null; caption?: string | null }
) {
  const [updated] = await db
    .update(media)
    .set({
      altText: data.altText,
      caption: data.caption,
      updatedAt: new Date(),
    })
    .where(eq(media.id, id))
    .returning();

  return updated;
}

export async function deleteMedia(id: string) {
  const item = await db.query.media.findFirst({
    where: eq(media.id, id),
  });

  if (!item) {
    throw new Error("Media not found");
  }

  await deleteFile(item.fileUrl);
  await db.delete(media).where(eq(media.id, id));

  return { success: true };
}
