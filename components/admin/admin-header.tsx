"use client";

import Link from "next/link";
import { Plus, Bell, Search, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminHeader() {
  return (
    <header className="h-16 border-b border-border bg-card/60 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <h2 className="text-base font-bold text-foreground">Editorial Control Panel</h2>
      </div>

      <div className="flex items-center gap-3">
        <Link href="/" target="_blank">
          <Button size="sm" variant="ghost" className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <Globe className="h-3.5 w-3.5" /> Visit Site
          </Button>
        </Link>

        <Link href="/admin/posts/create">
          <Button size="sm" variant="gradient" className="gap-1.5 text-xs font-semibold shadow-sm">
            <Plus className="h-4 w-4" /> New Article
          </Button>
        </Link>
      </div>
    </header>
  );
}
