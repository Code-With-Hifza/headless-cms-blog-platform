"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TiptapEditor } from "@/components/editor/tiptap-editor";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { slugify } from "@/lib/utils";
import {
  Save,
  Send,
  Trash2,
  ExternalLink,
  Eye,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Archive,
} from "lucide-react";

interface EditPostFormProps {
  post: any;
  categories: Array<{ id: string; name: string }>;
  authors: Array<{ id: string; displayName: string }>;
  tags: Array<{ id: string; name: string }>;
  mediaList: Array<{ id: string; fileName: string; fileUrl: string }>;
}

export function EditPostForm({ post, categories, authors, tags, mediaList }: EditPostFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(post.title);
  const [slug, setSlug] = useState(post.slug);
  const [excerpt, setExcerpt] = useState(post.excerpt || "");
  const [content, setContent] = useState(post.content || "");
  const [authorId, setAuthorId] = useState(post.authorId);
  const [categoryId, setCategoryId] = useState(post.categoryId || "");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    post.postTags ? post.postTags.map((pt: any) => pt.tagId || pt.tag?.id) : []
  );
  const [featuredImageId, setFeaturedImageId] = useState<string>(post.featuredImageId || "");
  const [status, setStatus] = useState<string>(post.status);
  const [scheduledAt, setScheduledAt] = useState<string>(
    post.scheduledAt ? new Date(post.scheduledAt).toISOString().slice(0, 16) : ""
  );
  const [seoTitle, setSeoTitle] = useState(post.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(post.seoDescription || "");
  const [isFeatured, setIsFeatured] = useState(post.isFeatured || false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleAutoSave = async (updatedHtml: string) => {
    await fetch(`/api/v1/posts/${post.id}/autosave`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        content: updatedHtml,
        excerpt,
      }),
    });
  };

  const handleSave = async (overrideStatus?: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    const targetStatus = overrideStatus || status;

    try {
      const res = await fetch(`/api/v1/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug: slugify(slug),
          excerpt: excerpt || null,
          content,
          authorId,
          categoryId: categoryId || null,
          tagIds: selectedTagIds,
          featuredImageId: featuredImageId || null,
          status: targetStatus,
          scheduledAt: targetStatus === "SCHEDULED" && scheduledAt ? new Date(scheduledAt).toISOString() : null,
          seoTitle: seoTitle || title,
          seoDescription: seoDescription || excerpt,
          isFeatured,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to update post");
      }

      setStatus(targetStatus);
      setSuccess("Changes saved successfully!");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this article? This cannot be undone.")) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/v1/posts/${post.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to delete post");
      }
      router.push("/admin/posts");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleGeneratePreview = async () => {
    try {
      const res = await fetch(`/api/v1/posts/${post.id}/preview`, { method: "POST" });
      const data = await res.json();
      if (data.success && data.data?.previewUrl) {
        window.open(data.data.previewUrl, "_blank");
      }
    } catch (err) {
      console.error(err);
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

      {success && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs font-medium text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Editor & SEO */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Article Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-12 w-full rounded-xl border border-input bg-background px-4 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">URL Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="h-9 w-full rounded-lg border border-input bg-muted/40 px-3 text-xs font-mono text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Summary / Excerpt</label>
              <textarea
                rows={2}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="w-full rounded-lg border border-input bg-background p-3 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-foreground">Publication Body</label>
            <TiptapEditor
              content={content}
              postId={post.id}
              onChange={(html) => setContent(html)}
              onAutoSave={handleAutoSave}
            />
          </div>

          {/* SEO Box */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-600">SEO & Social Previews</h4>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">SEO Title</label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Meta Description</label>
                <textarea
                  rows={2}
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Status and Action Buttons */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Publishing Workflow</h4>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="IN_REVIEW">In Review</option>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ARCHIVED">Archived</option>
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
                onClick={() => handleSave()}
                className="w-full gap-2 font-semibold shadow-md"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Changes
              </Button>

              {status !== "PUBLISHED" && (
                <Button
                  type="button"
                  variant="default"
                  disabled={loading}
                  onClick={() => handleSave("PUBLISHED")}
                  className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                >
                  <Send className="h-4 w-4" /> Publish Live
                </Button>
              )}

              {status === "PUBLISHED" && (
                <Link href={`/blog/${post.slug}`} target="_blank" className="w-full">
                  <Button type="button" variant="outline" className="w-full gap-1.5 text-xs font-medium">
                    <ExternalLink className="h-3.5 w-3.5" /> View Live Post
                  </Button>
                </Link>
              )}

              <Button
                type="button"
                variant="ghost"
                onClick={handleGeneratePreview}
                className="w-full gap-1.5 text-xs text-sky-600"
              >
                <Eye className="h-3.5 w-3.5" /> Open Draft Preview
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

          {/* Tags */}
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

          {/* Danger Zone */}
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 shadow-sm">
            <h4 className="text-xs font-bold text-destructive uppercase tracking-wider mb-2">Danger Zone</h4>
            <p className="text-[11px] text-muted-foreground mb-4">
              Permanently remove this article from the database.
            </p>
            <Button
              type="button"
              variant="destructive"
              disabled={loading}
              onClick={handleDelete}
              className="w-full gap-2 text-xs font-semibold"
            >
              <Trash2 className="h-4 w-4" /> Delete Article
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
