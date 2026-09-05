"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface CommentItem {
  id: string;
  authorName: string;
  content: string;
  createdAt: string | Date;
  user?: { image?: string | null } | null;
}

export function CommentSection({
  postId,
  initialComments = [],
}: {
  postId: string;
  initialComments?: CommentItem[];
}) {
  const [commentsList, setCommentsList] = useState<CommentItem[]>(initialComments);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !content) return;

    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch("/api/v1/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          authorName: name,
          authorEmail: email,
          content,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to post comment");
      }

      if (data.data?.status === "APPROVED") {
        setCommentsList([data.data, ...commentsList]);
        setStatus({ type: "success", message: "Your comment was published!" });
      } else {
        setStatus({
          type: "success",
          message: "Thank you! Your comment has been submitted and is awaiting moderation.",
        });
      }

      setContent("");
    } catch (err: any) {
      setStatus({ type: "error", message: err.message || "An error occurred." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mt-16 pt-12 border-t border-border">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-9 w-9 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center font-bold">
          <MessageSquare className="h-5 w-5" />
        </div>
        <h3 className="text-2xl font-bold tracking-tight text-foreground">
          Discussion ({commentsList.length})
        </h3>
      </div>

      {/* Post Comment Form */}
      <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-6 shadow-sm mb-10">
        <h4 className="text-sm font-semibold text-foreground mb-4">Leave a thoughtful reply</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Your Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Alex Rivera"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 w-full rounded-lg border border-input bg-background px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Email (not published)</label>
            <input
              type="email"
              required
              placeholder="alex@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 w-full rounded-lg border border-input bg-background px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-medium text-muted-foreground mb-1">Your Comment</label>
          <textarea
            required
            rows={4}
            placeholder="Share your thoughts, experiences, or questions..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full rounded-lg border border-input bg-background p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground">Markdown formatting is supported. HTML is sanitized.</p>
          <Button type="submit" variant="gradient" disabled={loading} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Post Comment
          </Button>
        </div>

        {status && (
          <div
            className={`mt-4 flex items-center gap-2 rounded-lg p-3 text-xs font-medium ${
              status.type === "success"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
            }`}
          >
            {status.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <span>{status.message}</span>
          </div>
        )}
      </form>

      {/* Comments List */}
      <div className="space-y-6">
        {commentsList.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-border rounded-2xl">
            <p className="text-sm text-muted-foreground">No comments yet. Be the first to start the conversation!</p>
          </div>
        ) : (
          commentsList.map((c) => (
            <div key={c.id} className="rounded-2xl border border-border bg-card/60 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-sky-400 to-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                    {c.authorName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h5 className="font-semibold text-sm text-foreground">{c.authorName}</h5>
                    <p className="text-[11px] text-muted-foreground">{formatDate(c.createdAt)}</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed pl-12">{c.content}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
