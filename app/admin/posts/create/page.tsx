import { getCategories } from "@/lib/services/categories";
import { getAuthors } from "@/lib/services/authors";
import { getTags } from "@/lib/services/tags";
import { getMediaList } from "@/lib/services/media";
import { CreatePostForm } from "@/components/admin/create-post-form";

export const revalidate = 0;

export default async function CreatePostPage() {
  const [categories, authors, tags, mediaList] = await Promise.all([
    getCategories(),
    getAuthors(),
    getTags(),
    getMediaList(),
  ]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Create New Article</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Draft a high-impact technical essay using the Tiptap rich-text editor.
        </p>
      </div>

      <CreatePostForm
        categories={categories}
        authors={authors}
        tags={tags}
        mediaList={mediaList}
      />
    </div>
  );
}
