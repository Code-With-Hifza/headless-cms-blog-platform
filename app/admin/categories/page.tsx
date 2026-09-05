import { getCategories } from "@/lib/services/categories";
import { CategoriesManager } from "./categories-manager";

export const revalidate = 0;

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Category Taxonomy</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Organize editorial content into semantic categories and manage SEO slugs.
        </p>
      </div>

      <CategoriesManager initialCategories={categories} />
    </div>
  );
}
