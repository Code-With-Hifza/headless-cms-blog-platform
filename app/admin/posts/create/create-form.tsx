"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TiptapEditor } from "@/components/editor/tiptap-editor";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { slugify } from "@/lib/utils";
import { Save, Send, Clock, Sparkles, Loader2, Image as ImageIcon, AlertCircle } from "lucide-react";

interface CreatePostFormProps {
  categories: Array<{ id: string; name: string }>;
  authors: Array<{ id: string; displayName: string }>;
  tags: Array<{ id: string; name: string }>;
  mediaList: Array<{ id: string; fileName: string; fileUrl: string }>;
}

export function CreatePostForm({ categories, authors, tags, mediaList }: CreatePostFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [authorId, setAuthorId] = useState(authors[0]?.id || "");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [featuredImageId, setFeaturedImageId] = useState<string>("");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED" | "IN_REVIEW" | "SCHEDULED">("DRAFT");
  const [scheduledAt, setScheduledAt] = useState<string>("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slug || slug === slugify(title)) {
      setSlug(slugify(val));
    }
    if (!seoTitle) {
      setSeoTitle(val);
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleSubmit = async (submitStatus = status) => {
    if (!title.trim() || !authorId) {
      setError("Title and author are required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/v1/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug: slug ? slugify(slug) : slugify(title),
          excerpt: excerpt || null,
          content,
          authorId,
          categoryId: categoryId || null,
          tagIds: selectedTagIds,
          featuredImageId: featuredImageId || null,
          status: submitStatus,
          scheduledAt: submitStatus === "SCHEDULED" && scheduledAt ? new Date(scheduledAt).toISOString() : null,
          seoTitle: seoTitle || title,
          seoDescription: seoDescription || excerpt,
          isFeatured,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to create post");
      }

      router.push(`/admin/posts/${data.data.id}/edit`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs font-medium text-rose-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Editor & Main Content */}
        <div className="lg:col-span-8 space-y-6">
          {/* Title */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Article Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Architecting Distributed Systems with Next.js 16"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="h-12 w-full rounded-xl border border-input bg-background px-4 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">URL Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="architecting-distributed-systems"
                className="h-9 w-full rounded-lg border border-input bg-muted/40 px-3 text-xs font-mono text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Summary / Excerpt</label>
              <textarea
                rows={2}
                value={excerpt}
                onChange={(e) => {
                  setExcerpt(e.target.value);
                  if (!seoDescription) setSeoDescription(e.target.value);
                }}
                placeholder="A concise synopsis of this publication for cards and search engines..."
                className="w-full rounded-lg border border-input bg-background p-3 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Tiptap Rich Editor */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-foreground">Publication Body</label>
            <TiptapEditor
              content={content}
              onChange={(html) => setContent(html)}
            />
          </div>

          {/* SEO Metadata Box */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-600">SEO & Social Previews</h4>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">SEO Title</label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder={title || "SEO optimized title"}
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Meta Description</label>
                <textarea
                  rows={2}
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder={excerpt || "Search engine description..."}
                  className="w-full rounded-lg border border-input bg-background p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Publishing Settings */}
        <div className="lg:col-span-4 space-y-6">
          {/* Action Box */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Publishing Workflow</h4>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="IN_REVIEW">Submit for Review</option>
                  <option value="SCHEDULED">Schedule Publish</option>
                  <option value="PUBLISHED">Publish Immediately</option>
                </select>
              </div>

              {status === "SCHEDULED" && (
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Scheduled Date & Time</label>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="h-9 w-full rounded-lg border border-input bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="h-4 w-4 rounded border-input text-sky-600 focus:ring-sky-500"
                />
                <label htmlFor="isFeatured" className="text-xs font-medium text-foreground cursor-pointer">
                  Feature in homepage hero spotlight
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex flex-col gap-2">
              <Button
                type="button"
                variant="gradient"
                disabled={loading}
                onClick={() => handleSubmit("PUBLISHED")}
                className="w-full gap-2 font-semibold shadow-md"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Publish Article
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={() => handleSubmit("DRAFT")}
                className="w-full gap-2 text-xs"
              >
                <Save className="h-4 w-4" /> Save as Draft
              </Button>
            </div>
          </div>

          {/* Author & Category Selection */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Author</label>
              <select
                value={authorId}
                onChange={(e) => setAuthorId(e.target.value)}
                className="h-9 w-full rounded-lg border border-input bg-background px-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {authors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.displayName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="h-9 w-full rounded-lg border border-input bg-background px-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="">Uncategorized</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Featured Image Picker */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Featured Image</label>
              <select
                value={featuredImageId}
                onChange={(e) => setFeaturedImageId(e.target.value)}
                className="h-9 w-full rounded-lg border border-input bg-background px-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="">Default Image</option>
                {mediaList.slice(0, 30).map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.fileName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags Picker */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <label className="block text-xs font-bold text-foreground mb-3">Attach Tags</label>
            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
              {tags.map((t) => {
                const isSelected = selectedTagIds.includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleTag(t.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-sky-600 text-white font-semibold shadow-sm"
                        : "bg-muted/60 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    #{t.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
