"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { slugify } from "@/lib/utils";
import { Plus, Trash2, Tag as TagIcon, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export function TagsManager({ initialTags }: { initialTags: any[] }) {
  const router = useRouter();
  const [tags, setTags] = useState(initialTags);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
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
      const res = await fetch("/api/v1/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug: slugify(slug || name),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to create tag");
      }

      setTags([...tags, { ...data.data, postCount: 0 }]);
      setName("");
      setSlug("");
      setSuccess("Tag created successfully!");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this tag?")) return;

    try {
      const res = await fetch(`/api/v1/tags/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTags(tags.filter((t) => t.id !== id));
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Create Tag Form */}
      <div className="lg:col-span-4">
        <form onSubmit={handleCreate} className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <TagIcon className="h-4 w-4 text-sky-500" />
            <h3 className="text-sm font-bold text-foreground">Add New Tag</h3>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Tag Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Next.js 16"
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
              placeholder="nextjs-16"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="h-9 w-full rounded-lg border border-input bg-muted/40 px-3 text-xs font-mono text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sky-500"
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
            Save Tag
          </Button>
        </form>
      </div>

      {/* Tags Cloud / Table */}
      <div className="lg:col-span-8">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
            Existing Tags ({tags.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <div
                key={t.id}
                className="group flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-muted/30 text-xs font-medium hover:border-sky-500 transition-colors"
              >
                <span className="font-semibold text-foreground">#{t.name}</span>
                <span className="text-[10px] text-muted-foreground">({t.postCount || 0})</span>
                <button
                  type="button"
                  onClick={() => handleDelete(t.id)}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                  title="Delete tag"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
