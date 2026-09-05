import Link from "next/link";
import { getPosts } from "@/lib/services/posts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Eye, Edit3, Trash2, ArrowUpRight, CheckCircle2, Archive } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const revalidate = 0;

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = Number(params.page || 1);
  const status = typeof params.status === "string" ? (params.status as any) : undefined;
  const search = typeof params.q === "string" ? params.q : undefined;

  const postsResult = await getPosts({
    page,
    limit: 15,
    status,
    search,
  });

  const filterTabs = [
    { label: "All Posts", status: undefined },
    { label: "Published", status: "PUBLISHED" },
    { label: "Drafts", status: "DRAFT" },
    { label: "In Review", status: "IN_REVIEW" },
    { label: "Scheduled", status: "SCHEDULED" },
    { label: "Archived", status: "ARCHIVED" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Articles & Posts</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage, write, schedule, and publish all editorial publications.
          </p>
        </div>

        <Link href="/admin/posts/create">
          <Button variant="gradient" className="gap-1.5 shadow-sm text-xs font-semibold">
            <Plus className="h-4 w-4" /> New Article
          </Button>
        </Link>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1">
          {filterTabs.map((tab) => {
            const isSelected = status === tab.status;
            const href = tab.status ? `/admin/posts?status=${tab.status}` : "/admin/posts";
            return (
              <Link key={tab.label} href={href}>
                <Button
                  size="sm"
                  variant={isSelected ? "default" : "ghost"}
                  className="rounded-xl text-xs font-semibold"
                >
                  {tab.label}
                </Button>
              </Link>
            );
          })}
        </div>

        {/* Search */}
        <form method="GET" action="/admin/posts" className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            name="q"
            defaultValue={search}
            placeholder="Search by title..."
            className="h-9 w-full rounded-xl border border-input bg-background pl-9 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </form>
      </div>

      {/* Posts Table */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                <th className="py-3.5 px-4 font-semibold">Title & Excerpt</th>
                <th className="py-3.5 px-4 font-semibold">Author</th>
                <th className="py-3.5 px-4 font-semibold">Category</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold">Date</th>
                <th className="py-3.5 px-4 font-semibold">Views</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {postsResult.data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    No articles found for this filter.
                  </td>
                </tr>
              ) : (
                postsResult.data.map((post) => (
                  <tr key={post.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3.5 px-4 max-w-sm">
                      <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="font-bold text-foreground hover:text-sky-600 line-clamp-1 block"
                      >
                        {post.title}
                      </Link>
                      {post.excerpt && (
                        <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                          {post.excerpt}
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground font-medium whitespace-nowrap">
                      {post.author?.displayName || "—"}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge variant="outline" className="text-[11px]">
                        {post.category?.name || "General"}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge
                        variant={
                          post.status === "PUBLISHED"
                            ? "success"
                            : post.status === "DRAFT"
                            ? "secondary"
                            : post.status === "SCHEDULED"
                            ? "warning"
                            : "outline"
                        }
                        className="text-[10px] font-bold"
                      >
                        {post.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground whitespace-nowrap">
                      {formatDate(post.publishedAt || post.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-muted-foreground whitespace-nowrap">
                      {post.viewsCount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        {post.status === "PUBLISHED" && (
                          <Link href={`/blog/${post.slug}`} target="_blank">
                            <Button size="icon" variant="ghost" className="h-7 w-7" title="View live article">
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                        )}
                        <Link href={`/admin/posts/${post.id}/edit`}>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-sky-600" title="Edit article">
                            <Edit3 className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
