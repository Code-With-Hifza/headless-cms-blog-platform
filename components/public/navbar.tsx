"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, Menu, X, Sparkles, LayoutDashboard, User, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-sm transition-transform group-hover:scale-105">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-sky-900 to-slate-800 dark:from-white dark:via-sky-200 dark:to-slate-300 bg-clip-text text-transparent">
            ContentFlow
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <Link href="/blog" className="hover:text-foreground transition-colors">
            Articles
          </Link>
          <Link href="/category/engineering" className="hover:text-foreground transition-colors">
            Engineering
          </Link>
          <Link href="/category/nextjs-react" className="hover:text-foreground transition-colors">
            React & Next.js
          </Link>
          <Link href="/category/artificial-intelligence" className="hover:text-foreground transition-colors">
            AI & LLMs
          </Link>
          <Link href="/about" className="hover:text-foreground transition-colors">
            About
          </Link>
        </nav>

        {/* Search Bar & Action Buttons */}
        <div className="hidden lg:flex items-center gap-3">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-52 rounded-full border border-input bg-muted/50 pl-9 pr-4 text-xs focus:w-64 focus:bg-background focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
            />
          </form>

          <Link href="/admin">
            <Button size="sm" variant="outline" className="gap-2 font-medium">
              <LayoutDashboard className="h-4 w-4 text-sky-500" />
              CMS Dashboard
            </Button>
          </Link>

          <Link href="/login">
            <Button size="sm" variant="gradient">
              Sign In
            </Button>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          <Link href="/search">
            <Button size="icon" variant="ghost" className="h-9 w-9">
              <Search className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsOpen(!isOpen)}
            className="h-9 w-9"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {isOpen && (
        <div className="md:hidden border-b border-border bg-background p-4 space-y-3">
          <form onSubmit={handleSearch} className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-muted/50 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </form>
          <div className="flex flex-col space-y-2 text-sm font-medium">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="px-2 py-1.5 hover:bg-muted rounded-md"
            >
              Home
            </Link>
            <Link
              href="/blog"
              onClick={() => setIsOpen(false)}
              className="px-2 py-1.5 hover:bg-muted rounded-md"
            >
              All Articles
            </Link>
            <Link
              href="/category/engineering"
              onClick={() => setIsOpen(false)}
              className="px-2 py-1.5 hover:bg-muted rounded-md"
            >
              Engineering
            </Link>
            <Link
              href="/category/nextjs-react"
              onClick={() => setIsOpen(false)}
              className="px-2 py-1.5 hover:bg-muted rounded-md"
            >
              React & Next.js
            </Link>
            <Link
              href="/about"
              onClick={() => setIsOpen(false)}
              className="px-2 py-1.5 hover:bg-muted rounded-md"
            >
              About Platform
            </Link>
            <Link
              href="/admin"
              onClick={() => setIsOpen(false)}
              className="px-2 py-1.5 hover:bg-muted rounded-md text-sky-600 font-semibold"
            >
              Admin CMS Dashboard
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
