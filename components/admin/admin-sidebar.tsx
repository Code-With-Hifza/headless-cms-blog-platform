"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  FolderTree,
  Tag,
  Users,
  Image as ImageIcon,
  MessageSquare,
  BarChart3,
  Settings,
  Sparkles,
  ExternalLink,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";

interface AdminSidebarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    roles?: string[];
  } | null;
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Articles & Posts", href: "/admin/posts", icon: FileText },
    { label: "Media Library", href: "/admin/media", icon: ImageIcon },
    { label: "Categories", href: "/admin/categories", icon: FolderTree },
    { label: "Tags", href: "/admin/tags", icon: Tag },
    { label: "Authors", href: "/admin/authors", icon: Users },
    { label: "Comments", href: "/admin/comments", icon: MessageSquare },
    { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { label: "Site Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-border bg-card flex flex-col justify-between h-screen sticky top-0">
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center gap-2.5 px-6 border-b border-border">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 text-white flex items-center justify-center shadow-md">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <span className="font-bold text-sm text-foreground tracking-tight block">
              ContentFlow CMS
            </span>
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">
              Editorial Studio
            </span>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className={`h-4 w-4 ${isActive ? "text-sky-600 dark:text-sky-400" : ""}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-border space-y-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="h-3.5 w-3.5" /> View Public Site
          </span>
          <span className="text-[10px] bg-background px-1.5 py-0.5 rounded border border-border">Live</span>
        </Link>

        {user && (
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground truncate">{user.name || "Administrator"}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user.roles?.[0] || "ADMIN"}</p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
