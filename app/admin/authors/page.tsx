import { getAuthors } from "@/lib/services/authors";
import { AuthorsManager } from "./authors-manager";

export const revalidate = 0;

export default async function AdminAuthorsPage() {
  const authors = await getAuthors();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Authors & Contributors</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Manage writer profiles, bios, avatars, and social credentials.
        </p>
      </div>

      <AuthorsManager initialAuthors={authors} />
    </div>
  );
}
