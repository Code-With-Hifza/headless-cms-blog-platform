import { notFound } from "next/navigation";
import { getPostById } from "@/lib/services/posts";
import { getCategories } from "@/lib/services/categories";
import { getAuthors } from "@/lib/services/authors";
import { getTags } from "@/lib/services/tags";
import { getMediaList } from "@/lib/services/media";
import { EditPostForm } from "@/components/admin/edit-post-form";

export const revalidate = 0;

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) {
    notFound();
  }

  const [categories, authors, tags, mediaList] = await Promise.all([
    getCategories(),
    getAuthors(),
    getTags(),
    getMediaList(),
  ]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Edit Article</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Make updates, review revisions, and manage editorial status.
        </p>
      </div>

      <EditPostForm
        post={post}
        categories={categories}
        authors={authors}
        tags={tags}
        mediaList={mediaList}
      />
    </div>
  );
}
