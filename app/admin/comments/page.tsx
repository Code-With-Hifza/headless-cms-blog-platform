import { getAllComments } from "@/lib/services/comments";
import { CommentsManager } from "@/components/admin/comments-manager";

export const revalidate = 0;

export default async function AdminCommentsPage() {
  const comments = await getAllComments();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Comment Moderation</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Review reader responses, moderate spam, and approve thoughtful discussion.
        </p>
      </div>

      <CommentsManager initialComments={comments} />
    </div>
  );
}
