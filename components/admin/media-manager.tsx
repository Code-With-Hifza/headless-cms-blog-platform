"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Trash2,
  Copy,
  Check,
  Search,
  Loader2,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react";

export function MediaManager({ initialMedia }: { initialMedia: any[] }) {
  const router = useRouter();
  const [mediaList, setMediaList] = useState(initialMedia);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/v1/media", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to upload file");
      }

      setMediaList([data.data, ...mediaList]);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this media item?")) return;

    try {
      const res = await fetch(`/api/v1/media/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMediaList(mediaList.filter((m) => m.id !== id));
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const copyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = mediaList.filter((m) =>
    m.fileName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Upload & Search Controls */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Filter media files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-xl border border-input bg-background pl-9 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div>
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*,video/*,application/pdf"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
            <Button
              type="button"
              variant="gradient"
              size="sm"
              disabled={uploading}
              className="gap-2 pointer-events-none"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Upload Asset
            </Button>
          </label>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs text-rose-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="group relative rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
          >
            <div className="relative aspect-square w-full bg-muted overflow-hidden">
              <Image
                src={item.fileUrl}
                alt={item.altText || item.fileName}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
              />
            </div>

            <div className="p-2.5 flex-1 flex flex-col justify-between">
              <p className="text-[11px] font-semibold text-foreground truncate" title={item.fileName}>
                {item.fileName}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {(item.fileSize / 1024).toFixed(0)} KB
              </p>

              <div className="mt-2 pt-2 border-t border-border flex items-center justify-between">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => copyUrl(item.id, item.fileUrl)}
                  className="h-6 w-6"
                  title="Copy URL"
                >
                  {copiedId === item.id ? (
                    <Check className="h-3 w-3 text-emerald-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDelete(item.id)}
                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                  title="Delete media"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
