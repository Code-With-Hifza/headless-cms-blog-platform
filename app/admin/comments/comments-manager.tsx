"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Check, X, ShieldAlert, Trash2, MessageSquare, ExternalLink } from "lucide-react";
import Link from "next/link";

export function CommentsManager({ initialComments }: { initialComments: any[] }) {
  const router = useRouter();
  const [comments, setComments] = useState(initialComments);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const updateStatus = async (id: string, newStatus: "APPROVED" | "REJECTED" | "SPAM") => {
    try {
      const res = await fetch(`/api/v1/comments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setComments(
          comments.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
        );
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete comment permanently?")) return;

    try {
      const res = await fetch(`/api/v1/comments/${id}`, { method: "DELETE" });
      if (res.ok) {
        setComments(comments.filter((c) => c.id !== id));
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered =
    statusFilter === "ALL"
      ? comments
      : comments.filter((c) => c.status === statusFilter);

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {["ALL", "PENDING", "APPROVED", "REJECTED", "SPAM"].map((s) => (
          <Button
            key={s}
            size="sm"
            variant={statusFilter === s ? "default" : "outline"}
            onClick={() => setStatusFilter(s)}
            className="rounded-xl text-xs font-semibold"
          >
            {s}
          </Button>
        ))}
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-2xl bg-card">
            <p className="text-xs text-muted-foreground">No comments found in this queue.</p>
          </div>
        ) : (
          filtered.map((comment) => (
            <div
              key={comment.id}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
                    {comment.authorName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-bold text-xs text-foreground mr-2">
                      {comment.authorName}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      ({comment.authorEmail})
                    </span>
                    <span className="text-[11px] text-muted-foreground ml-2">
                      • {formatDate(comment.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      comment.status === "APPROVED"
                        ? "success"
                        : comment.status === "PENDING"
                        ? "warning"
                        : "destructive"
                    }
                    className="text-[10px] font-bold"
                  >
                    {comment.status}
                  </Badge>

                  {comment.post && (
                    <Link
                      href={`/blog/${comment.post.slug}`}
                      target="_blank"
                      className="text-[11px] font-semibold text-sky-600 hover:underline flex items-center gap-0.5"
                    >
                      Article <ExternalLink className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              </div>

              <p className="text-xs text-foreground/90 leading-relaxed pl-11">
                {comment.content}
              </p>

              <div className="pt-2 flex items-center justify-end gap-2">
                {comment.status !== "APPROVED" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateStatus(comment.id, "APPROVED")}
                    className="h-7 text-xs text-emerald-600 hover:bg-emerald-500/10 gap-1 font-semibold"
                  >
                    <Check className="h-3.5 w-3.5" /> Approve
                  </Button>
                )}

                {comment.status !== "REJECTED" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateStatus(comment.id, "REJECTED")}
                    className="h-7 text-xs text-amber-600 hover:bg-amber-500/10 gap-1 font-semibold"
                  >
                    <X className="h-3.5 w-3.5" /> Reject
                  </Button>
                )}

                {comment.status !== "SPAM" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateStatus(comment.id, "SPAM")}
                    className="h-7 text-xs text-rose-600 hover:bg-rose-500/10 gap-1 font-semibold"
                  >
                    <ShieldAlert className="h-3.5 w-3.5" /> Mark Spam
                  </Button>
                )}

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDelete(comment.id)}
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  title="Delete comment"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
