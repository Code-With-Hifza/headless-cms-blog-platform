import { getDashboardStats } from "@/lib/services/analytics";
import { getPosts } from "@/lib/services/posts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Eye, FileText, Users, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export const revalidate = 0;

export default async function AdminAnalyticsPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Content Analytics & Traffic</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Privacy-conscious readership insights, trends, and content performance metrics.
        </p>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground">Total Content Views</span>
          <div className="text-3xl font-extrabold text-foreground mt-1">
            {stats.overview.totalViews.toLocaleString()}
          </div>
          <p className="text-[11px] text-emerald-500 font-semibold mt-1">↑ Organic reader engagement</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground">Published Articles</span>
          <div className="text-3xl font-extrabold text-foreground mt-1">
            {stats.overview.publishedPosts}
          </div>
          <p className="text-[11px] text-sky-500 font-semibold mt-1">Across 8 active categories</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground">Newsletter Audience</span>
          <div className="text-3xl font-extrabold text-foreground mt-1">
            {stats.overview.totalSubscribers}
          </div>
          <p className="text-[11px] text-indigo-500 font-semibold mt-1">100% verified opt-in subscribers</p>
        </div>
      </div>

      {/* 14-Day View Activity Bar Visualization */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-sky-500" />
            <h3 className="text-sm font-bold text-foreground">14-Day Readership Activity Trend</h3>
          </div>
          <span className="text-xs text-muted-foreground">Daily Post Views</span>
        </div>

        <div className="pt-4 flex items-end justify-between gap-2 h-48">
          {stats.viewsTrend.map((item, idx) => {
            const maxViews = Math.max(...stats.viewsTrend.map((v) => v.views), 10);
            const heightPercent = Math.max(12, Math.round((item.views / maxViews) * 100));

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[10px] font-bold text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.views}
                </span>
                <div
                  className="w-full bg-sky-500/30 group-hover:bg-sky-500 rounded-t-md transition-all"
                  style={{ height: `${heightPercent}%` }}
                />
                <span className="text-[10px] text-muted-foreground whitespace-nowrap -rotate-45 sm:rotate-0 mt-1">
                  {item.date.split(" ")[1] || item.date}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top 5 Articles Breakdown */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-sm font-bold text-foreground mb-6 pb-3 border-b border-border">
          Highest Readership Articles
        </h3>

        <div className="space-y-4">
          {stats.popularPosts.map((post, idx) => (
            <div
              key={post.id}
              className="flex items-center justify-between p-4 rounded-xl bg-muted/30"
            >
              <div className="flex items-center gap-3 min-w-0 pr-4">
                <span className="text-sm font-extrabold text-sky-600">#{idx + 1}</span>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-foreground truncate">
                    <Link href={`/admin/posts/${post.id}/edit`} className="hover:text-sky-600">
                      {post.title}
                    </Link>
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {post.category?.name || "General"} • {formatDate(post.publishedAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Badge className="bg-sky-500/10 text-sky-700 dark:text-sky-300 font-bold text-xs gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  {post.viewsCount.toLocaleString()} views
                </Badge>
                <Link href={`/blog/${post.slug}`} target="_blank">
                  <Button size="icon" variant="ghost" className="h-8 w-8">
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
