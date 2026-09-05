import { generatePageMetadata } from "@/lib/seo";
import { Sparkles, Layers, Cpu, ShieldCheck, Zap, Globe } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = generatePageMetadata({
  title: "About ContentFlow | Next-Gen Headless CMS",
  description:
    "Learn about the mission, architecture, and technology behind ContentFlow publishing platform.",
  path: "/about",
});

export default function AboutPage() {
  const pillars = [
    {
      icon: Cpu,
      title: "Decoupled Architecture",
      description: "Structured content management separated completely from high-performance edge rendering.",
    },
    {
      icon: Zap,
      title: "Sub-Second Performance",
      description: "Static generation, tag-based revalidation, and zero-JS streaming server components.",
    },
    {
      icon: ShieldCheck,
      title: "Enterprise RBAC & Security",
      description: "Granular role-based permissions, server-side validation, and comprehensive audit logs.",
    },
    {
      icon: Globe,
      title: "REST & Composable APIs",
      description: "Full OpenAPI v3 specification allowing multichannel content syndication anywhere.",
    },
  ];

  return (
    <div className="py-16 sm:py-24">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="max-w-3xl mx-auto text-center mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-500/10 text-sky-700 dark:text-sky-300 text-xs font-semibold mb-4">
            <Sparkles className="h-3.5 w-3.5" /> About ContentFlow
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            Redefining the standard for modern digital publishing.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            ContentFlow was built from the ground up to solve the friction between editorial teams and software engineers. We combine the flexibility of a headless CMS with the polish of a modern SaaS application.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
          {pillars.map((p, idx) => (
            <div key={idx} className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center mb-4">
                <p.icon className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-foreground mb-2">{p.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{p.description}</p>
            </div>
          ))}
        </div>

        {/* Tech Stack Banner */}
        <div className="rounded-3xl border border-border bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 p-8 sm:p-12 text-white shadow-2xl">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-widest text-sky-400">Technology Foundation</span>
            <h2 className="text-3xl font-bold tracking-tight text-white mt-2 sm:text-4xl">
              Engineered with modern full-stack standards.
            </h2>
            <p className="mt-4 text-slate-300 text-sm leading-relaxed">
              Built using Next.js 16 App Router, React 19, TypeScript, PostgreSQL, Drizzle ORM, Tiptap, Auth.js, and Tailwind CSS.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/admin">
                <Button variant="gradient" className="shadow-lg">
                  Explore CMS Dashboard
                </Button>
              </Link>
              <Link href="/api/v1/openapi">
                <Button variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/20">
                  View OpenAPI Specs
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
