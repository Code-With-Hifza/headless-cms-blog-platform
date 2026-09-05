import { db } from "@/lib/db";
import { tags, postTags, posts } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export async function getTags() {
  const items = await db.query.tags.findMany({
    orderBy: [desc(tags.createdAt)],
    with: {
      postTags: {
        with: {
          post: true,
        },
      },
    },
  });

  return items.map((tag) => ({
    ...tag,
    postCount: tag.postTags?.filter((pt) => pt.post?.status === "PUBLISHED").length || 0,
  }));
}

export async function getTagBySlug(slug: string) {
  return await db.query.tags.findFirst({
    where: eq(tags.slug, slug),
  });
}

export async function createTag(data: {
  name: string;
  slug?: string;
  description?: string | null;
}) {
  const baseSlug = data.slug ? slugify(data.slug) : slugify(data.name);

  const existing = await db.query.tags.findFirst({
    where: eq(tags.slug, baseSlug),
  });
  if (existing) {
    throw new Error(`Tag with slug "${baseSlug}" already exists`);
  }

  const [created] = await db
    .insert(tags)
    .values({
      name: data.name,
      slug: baseSlug,
      description: data.description || null,
    })
    .returning();

  revalidatePath("/tags");
  revalidatePath("/blog");
  return created;
}

export async function updateTag(
  id: string,
  data: Partial<{
    name: string;
    slug: string;
    description: string | null;
  }>
) {
  const updateFields: Record<string, any> = { updatedAt: new Date() };
  if (data.name !== undefined) updateFields.name = data.name;
  if (data.description !== undefined) updateFields.description = data.description;

  if (data.slug) {
    const cleanSlug = slugify(data.slug);
    const existing = await db.query.tags.findFirst({
      where: eq(tags.slug, cleanSlug),
    });
    if (existing && existing.id !== id) {
      throw new Error(`Tag slug "${cleanSlug}" is already taken`);
    }
    updateFields.slug = cleanSlug;
  }

  const [updated] = await db
    .update(tags)
    .set(updateFields)
    .where(eq(tags.id, id))
    .returning();

  revalidatePath("/tags");
  revalidatePath("/blog");
  return updated;
}

export async function deleteTag(id: string) {
  await db.delete(tags).where(eq(tags.id, id));
  revalidatePath("/tags");
  revalidatePath("/blog");
  return { success: true };
}
