"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { slugify } from "@/lib/utils";
import { Plus, Trash2, Edit2, Loader2, AlertCircle, CheckCircle2, FolderTree } from "lucide-react";

export function CategoriesManager({ initialCategories }: { initialCategories: any[] }) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!slug || slug === slugify(name)) {
      setSlug(slugify(val));
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/v1/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug: slugify(slug || name),
          description: description || null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to create category");
      }

      setCategories([...categories, { ...data.data, postCount: 0 }]);
      setName("");
      setSlug("");
      setDescription("");
      setSuccess("Category created successfully!");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    try {
      const res = await fetch(`/api/v1/categories/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCategories(categories.filter((c) => c.id !== id));
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Create Category Form */}
      <div className="lg:col-span-5">
        <form onSubmit={handleCreate} className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <FolderTree className="h-4 w-4 text-sky-500" />
            <h3 className="text-sm font-bold text-foreground">Add New Category</h3>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Category Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Distributed Systems"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="h-10 w-full rounded-xl border border-input bg-background px-3.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Slug</label>
            <input
              type="text"
              required
              placeholder="distributed-systems"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="h-9 w-full rounded-lg border border-input bg-muted/40 px-3 text-xs font-mono text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Description</label>
            <textarea
              rows={3}
              placeholder="Brief summary of this category topic..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-input bg-background p-3 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-400">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <Button type="submit" variant="gradient" disabled={loading} className="w-full gap-2 text-xs font-semibold">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Save Category
          </Button>
        </form>
      </div>

      {/* Categories Table */}
      <div className="lg:col-span-7">
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Slug</th>
                  <th className="py-3 px-4">Articles</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {categories.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-bold text-foreground">{c.name}</td>
                    <td className="py-3 px-4 font-mono text-muted-foreground">{c.slug}</td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary" className="text-[10px] font-semibold">
                        {c.postCount || 0} posts
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(c.id)}
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
