"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { slugify } from "@/lib/utils";
import { Plus, Trash2, Users, Loader2, AlertCircle, CheckCircle2, Globe, Twitter, Linkedin, Github } from "lucide-react";

export function AuthorsManager({ initialAuthors }: { initialAuthors: any[] }) {
  const router = useRouter();
  const [authors, setAuthors] = useState(initialAuthors);
  const [displayName, setDisplayName] = useState("");
  const [slug, setSlug] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/v1/authors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          slug: slugify(slug || displayName),
          bio: bio || null,
          avatarUrl: avatarUrl || null,
          websiteUrl: websiteUrl || null,
          twitterUrl: twitterUrl || null,
          linkedinUrl: linkedinUrl || null,
          githubUrl: githubUrl || null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to create author");
      }

      setAuthors([...authors, { ...data.data, postCount: 0 }]);
      setDisplayName("");
      setSlug("");
      setBio("");
      setAvatarUrl("");
      setWebsiteUrl("");
      setTwitterUrl("");
      setLinkedinUrl("");
      setGithubUrl("");
      setSuccess("Author profile created successfully!");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this author?")) return;

    try {
      const res = await fetch(`/api/v1/authors/${id}`, { method: "DELETE" });
      if (res.ok) {
        setAuthors(authors.filter((a) => a.id !== id));
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-5">
        <form onSubmit={handleCreate} className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <Users className="h-4 w-4 text-sky-500" />
            <h3 className="text-sm font-bold text-foreground">Add New Author</h3>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Display Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Maya Lin"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                if (!slug || slug === slugify(displayName)) setSlug(slugify(e.target.value));
              }}
              className="h-10 w-full rounded-xl border border-input bg-background px-3.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Slug</label>
            <input
              type="text"
              required
              placeholder="maya-lin"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="h-9 w-full rounded-lg border border-input bg-muted/40 px-3 text-xs font-mono text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Avatar Image URL</label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="h-9 w-full rounded-lg border border-input bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Bio</label>
            <textarea
              rows={2}
              placeholder="Author biographical sketch..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full rounded-lg border border-input bg-background p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] text-muted-foreground mb-1">Website URL</label>
              <input
                type="url"
                placeholder="https://..."
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] text-muted-foreground mb-1">Twitter / X URL</label>
              <input
                type="url"
                placeholder="https://twitter.com/..."
                value={twitterUrl}
                onChange={(e) => setTwitterUrl(e.target.value)}
                className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-xs"
              />
            </div>
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
            Save Author Profile
          </Button>
        </form>
      </div>

      <div className="lg:col-span-7 space-y-4">
        {authors.map((a) => (
          <div
            key={a.id}
            className="rounded-2xl border border-border bg-card p-5 shadow-sm flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4 min-w-0">
              {a.avatarUrl ? (
                <Image
                  src={a.avatarUrl}
                  alt={a.displayName}
                  width={48}
                  height={48}
                  className="rounded-full object-cover shrink-0 ring-2 ring-sky-500/20"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-sm shrink-0">
                  {a.displayName.charAt(0)}
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-foreground truncate">{a.displayName}</h4>
                  <Badge variant="secondary" className="text-[10px]">
                    {a.postCount || 0} articles
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">{a.slug}</p>
                {a.bio && (
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{a.bio}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleDelete(a.id)}
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                title="Delete author"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
