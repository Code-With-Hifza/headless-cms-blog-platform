import { getTags } from "@/lib/services/tags";
import { TagsManager } from "./tags-manager";

export const revalidate = 0;

export default async function AdminTagsPage() {
  const tags = await getTags();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Tags & Keywords</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Manage topic tags and keyword indexing for search and cross-linking.
        </p>
      </div>

      <TagsManager initialTags={tags} />
    </div>
  );
}
