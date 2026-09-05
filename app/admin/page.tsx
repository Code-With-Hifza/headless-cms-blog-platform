import Link from "next/link";
import { getDashboardStats } from "@/lib/services/analytics";
import { getPosts } from "@/lib/services/posts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Eye,
  MessageSquare,
  Users,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Send,
  Sparkles,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export const revalidate = 0; // Dynamic real-time dashboard

export default async function AdminDashboardPage() {
  const [stats, recentPostsResult] = await Promise.all([
    getDashboardStats(),
    getPosts({ limit: 5 }),
  ]);

  const overview = stats.overview;

  const statCards = [
    {
      label: "Published Articles",
      value: overview.publishedPosts,
      sub: `${overview.draftPosts} drafts • ${overview.scheduledPosts} scheduled`,
      icon: FileText,
      color: "text-sky-600 bg-sky-500/10",
    },
    {
      label: "Total Reader Views",
      value: overview.totalViews.toLocaleString(),
      sub: "+18.4% this month",
      icon: Eye,
      color: "text-emerald-600 bg-emerald-500/10",
    },
    {
      label: "Total Comments",
      value: overview.totalComments,
      sub: `${overview.pendingComments} awaiting review`,
      icon: MessageSquare,
      color: "text-amber-600 bg-amber-500/10",
    },
    {
      label: "Subscribers",
      value: overview.totalSubscribers,
      sub: `${overview.totalAuthors} active authors`,
      icon: Send,
      color: "text-indigo-600 bg-indigo-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            CMS Dashboard
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time publishing metrics, article performance, and moderation queues.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/posts/create">
            <Button variant="gradient" className="gap-2 shadow-sm text-xs font-semibold">
              <Plus className="h-4 w-4" /> Create New Post
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-muted-foreground">{card.label}</span>
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${card.color}`}>
                <card.icon className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {card.value}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Two column layout: Popular Posts & Categories breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Popular Posts */}
        <div className="lg:col-span-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-sky-500" />
              <h3 className="text-sm font-bold text-foreground">Top Performing Articles</h3>
            </div>
            <Link href="/admin/posts" className="text-xs font-semibold text-sky-600 hover:underline">
              View all
            </Link>
          </div>

          <div className="space-y-4">
            {stats.popularPosts.map((post, idx) => (
              <div
                key={post.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-muted/30 hover:bg-muted/60 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 pr-4">
                  <span className="text-xs font-bold text-muted-foreground w-4 text-center">
                    #{idx + 1}
                  </span>
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-foreground truncate">
                      <Link href={`/admin/posts/${post.id}/edit`} className="hover:text-sky-600">
                        {post.title}
                      </Link>
                    </h5>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {post.category?.name || "General"} • {formatDate(post.publishedAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant="secondary" className="gap-1 font-semibold text-xs">
                    <Eye className="h-3 w-3 text-sky-500" />
                    {post.viewsCount.toLocaleString()}
                  </Badge>
                  <Link href={`/blog/${post.slug}`} target="_blank">
                    <Button size="icon" variant="ghost" className="h-7 w-7" title="View live article">
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Categories Distribution */}
        <div className="lg:col-span-4 rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-border">
              <h3 className="text-sm font-bold text-foreground">Content by Category</h3>
              <Link href="/admin/categories" className="text-xs font-semibold text-sky-600 hover:underline">
                Manage
              </Link>
            </div>

            <div className="space-y-3.5">
              {stats.categoriesData.map((cat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">{cat.name}</span>
                    <span className="text-muted-foreground">{cat.count} articles</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-sky-500 rounded-full"
                      style={{
                        width: `${Math.min(100, Math.max(8, (cat.count / Math.max(1, overview.publishedPosts)) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border">
            <Link href="/admin/posts/create" className="w-full">
              <Button variant="outline" className="w-full text-xs font-semibold">
                + Write in New Category
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Posts Table */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-border">
          <h3 className="text-sm font-bold text-foreground">Recent Editorial Content</h3>
          <Link href="/admin/posts">
            <Button size="sm" variant="outline" className="text-xs">
              Manage All Articles
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground font-semibold">
                <th className="pb-3 font-semibold">Title</th>
                <th className="pb-3 font-semibold">Author</th>
                <th className="pb-3 font-semibold">Category</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Views</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentPostsResult.data.map((post) => (
                <tr key={post.id} className="hover:bg-muted/40 transition-colors">
                  <td className="py-3 font-semibold text-foreground max-w-xs truncate">
                    <Link href={`/admin/posts/${post.id}/edit`} className="hover:text-sky-600">
                      {post.title}
                    </Link>
                  </td>
                  <td className="py-3 text-muted-foreground">{post.author?.displayName || "—"}</td>
                  <td className="py-3">
                    <Badge variant="outline" className="text-[11px]">
                      {post.category?.name || "Uncategorized"}
                    </Badge>
                  </td>
                  <td className="py-3">
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
                      className="text-[11px] font-bold"
                    >
                      {post.status}
                    </Badge>
                  </td>
                  <td className="py-3 font-medium text-muted-foreground">{post.viewsCount}</td>
                  <td className="py-3 text-right">
                    <Link href={`/admin/posts/${post.id}/edit`}>
                      <Button size="sm" variant="ghost" className="h-7 text-xs font-semibold text-sky-600">
                        Edit
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
