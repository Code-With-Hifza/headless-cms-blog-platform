import Link from "next/link";
import { Sparkles, Github, Twitter, Linkedin, Rss } from "lucide-react";
import { NewsletterBox } from "@/components/blog/newsletter-box";

export function Footer() {
  return (
    <footer className="border-t border-border bg-slate-900 text-slate-200">
      {/* Top CTA area */}
      <div className="border-b border-slate-800 py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-semibold mb-4">
                <Sparkles className="h-3.5 w-3.5" /> Stay ahead in modern engineering
              </div>
              <h3 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Get high-signal editorial content in your inbox.
              </h3>
              <p className="mt-3 text-slate-400 text-base max-w-xl">
                Weekly deep dives into systems architecture, Next.js patterns, database indexing, and headless content modeling.
              </p>
            </div>
            <div>
              <NewsletterBox />
            </div>
          </div>
        </div>
      </div>

      {/* Main footer navigation */}
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500 text-white font-bold">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">ContentFlow</span>
            </Link>
            <p className="mt-3 text-xs text-slate-400 leading-relaxed">
              Production-grade headless CMS and publishing platform built with Next.js 16, TypeScript, PostgreSQL, and Drizzle ORM.
            </p>
            <div className="mt-4 flex items-center gap-3 text-slate-400">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                <Github className="h-4 w-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                <Linkedin className="h-4 w-4" />
              </a>
              <Link href="/rss.xml" className="hover:text-amber-400 transition-colors" title="RSS Feed">
                <Rss className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Topics */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Categories</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-300">
              <li><Link href="/category/engineering" className="hover:text-sky-400 transition-colors">Engineering</Link></li>
              <li><Link href="/category/nextjs-react" className="hover:text-sky-400 transition-colors">Next.js & React</Link></li>
              <li><Link href="/category/artificial-intelligence" className="hover:text-sky-400 transition-colors">AI & LLMs</Link></li>
              <li><Link href="/category/frontend-design" className="hover:text-sky-400 transition-colors">Frontend & Design</Link></li>
              <li><Link href="/category/cloud-devops" className="hover:text-sky-400 transition-colors">Cloud & DevOps</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Platform</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-300">
              <li><Link href="/admin" className="hover:text-sky-400 transition-colors">CMS Admin</Link></li>
              <li><Link href="/api/v1/openapi" className="hover:text-sky-400 transition-colors">OpenAPI Spec</Link></li>
              <li><Link href="/rss.xml" className="hover:text-sky-400 transition-colors">RSS Feed</Link></li>
              <li><Link href="/sitemap.xml" className="hover:text-sky-400 transition-colors">XML Sitemap</Link></li>
              <li><Link href="/about" className="hover:text-sky-400 transition-colors">About Us</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Legal</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-300">
              <li><Link href="/privacy" className="hover:text-sky-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-sky-400 transition-colors">Terms of Service</Link></li>
              <li><Link href="/contact" className="hover:text-sky-400 transition-colors">Contact Support</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} ContentFlow Platform. All rights reserved.</p>
          <p>Powered by Next.js 16, PostgreSQL & Drizzle ORM.</p>
        </div>
      </div>
    </footer>
  );
}
