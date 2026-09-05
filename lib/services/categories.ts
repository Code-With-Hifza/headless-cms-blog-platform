import { db } from "@/lib/db";
import { categories, posts } from "@/lib/db/schema";
import { eq, sql, count, desc } from "drizzle-orm";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export async function getCategories() {
  const items = await db.query.categories.findMany({
    orderBy: [desc(categories.createdAt)],
    with: {
      posts: {
        where: eq(posts.status, "PUBLISHED"),
      },
    },
  });

  return items.map((cat) => ({
    ...cat,
    postCount: cat.posts?.length || 0,
  }));
}

export async function getCategoryBySlug(slug: string) {
  return await db.query.categories.findFirst({
    where: eq(categories.slug, slug),
  });
}

export async function createCategory(data: {
  name: string;
  slug?: string;
  description?: string | null;
  image?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
}) {
  const baseSlug = data.slug ? slugify(data.slug) : slugify(data.name);

  const existing = await db.query.categories.findFirst({
    where: eq(categories.slug, baseSlug),
  });
  if (existing) {
    throw new Error(`Category with slug "${baseSlug}" already exists`);
  }

  const [created] = await db
    .insert(categories)
    .values({
      name: data.name,
      slug: baseSlug,
      description: data.description || null,
      image: data.image || null,
      seoTitle: data.seoTitle || data.name,
      seoDescription: data.seoDescription || data.description,
    })
    .returning();

  revalidatePath("/categories");
  revalidatePath("/blog");
  return created;
}

export async function updateCategory(
  id: string,
  data: Partial<{
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
  }>
) {
  const updateFields: Record<string, any> = { updatedAt: new Date() };
  if (data.name !== undefined) updateFields.name = data.name;
  if (data.description !== undefined) updateFields.description = data.description;
  if (data.image !== undefined) updateFields.image = data.image;
  if (data.seoTitle !== undefined) updateFields.seoTitle = data.seoTitle;
  if (data.seoDescription !== undefined) updateFields.seoDescription = data.seoDescription;

  if (data.slug) {
    const cleanSlug = slugify(data.slug);
    const existing = await db.query.categories.findFirst({
      where: eq(categories.slug, cleanSlug),
    });
    if (existing && existing.id !== id) {
      throw new Error(`Category slug "${cleanSlug}" is already taken`);
    }
    updateFields.slug = cleanSlug;
  }

  const [updated] = await db
    .update(categories)
    .set(updateFields)
    .where(eq(categories.id, id))
    .returning();

  revalidatePath("/categories");
  revalidatePath("/blog");
  return updated;
}

export async function deleteCategory(id: string) {
  await db.delete(categories).where(eq(categories.id, id));
  revalidatePath("/categories");
  revalidatePath("/blog");
  return { success: true };
}
