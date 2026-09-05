"use client";

import { useEffect, useState } from "react";
import { ListTree } from "lucide-react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents({ content }: { content: string }) {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    // Extract H2 and H3 from HTML content
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");
    const headingElements = doc.querySelectorAll("h2, h3");

    const items: TocItem[] = [];
    headingElements.forEach((el, index) => {
      const text = el.textContent || "";
      const id = el.id || `section-${index}-${text.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
      const level = el.tagName === "H2" ? 2 : 3;
      items.push({ id, text, level });
    });

    setHeadings(items);

    // Intersection observer for tracking active scroll heading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-80px 0% -60% 0%" }
    );

    const liveHeadings = document.querySelectorAll(".prose-content h2, .prose-content h3");
    liveHeadings.forEach((el, index) => {
      if (!el.id && items[index]) {
        el.id = items[index].id;
      }
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [content]);

  if (headings.length === 0) return null;

  return (
    <nav className="rounded-2xl border border-border bg-card p-5 shadow-sm sticky top-24">
      <div className="flex items-center gap-2 pb-3 mb-3 border-b border-border text-xs font-bold uppercase tracking-wider text-muted-foreground">
        <ListTree className="h-4 w-4 text-sky-500" />
        Table of Contents
      </div>
      <ul className="space-y-2 text-xs">
        {headings.map((h) => (
          <li key={h.id} className={h.level === 3 ? "pl-3.5 border-l border-border/80" : ""}>
            <a
              href={`#${h.id}`}
              onClick={(e) => {
                e.preventDefault();
                const target = document.getElementById(h.id);
                if (target) {
                  const y = target.getBoundingClientRect().top + window.scrollY - 90;
                  window.scrollTo({ top: y, behavior: "smooth" });
                }
              }}
              className={`block py-0.5 transition-colors line-clamp-1 ${
                activeId === h.id
                  ? "text-sky-600 dark:text-sky-400 font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
