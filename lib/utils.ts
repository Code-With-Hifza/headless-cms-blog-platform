import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import DOMPurify from "isomorphic-dompurify";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate an SEO-friendly URL slug from a title string
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9 -]/g, "") // Remove invalid chars
    .replace(/\s+/g, "-") // Collapse whitespace and replace with -
    .replace(/-+/g, "-") // Collapse dashes
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

/**
 * Calculate reading time in minutes (based on avg 200 words per minute)
 */
export function calculateReadingTime(content: string): number {
  const wordCount = countWords(content);
  return Math.max(1, Math.ceil(wordCount / 200));
}

/**
 * Count total words in text/HTML
 */
export function countWords(content: string): number {
  const cleanText = content.replace(/<[^>]*>?/gm, " ").trim();
  if (!cleanText) return 0;
  return cleanText.split(/\s+/).filter(Boolean).length;
}

/**
 * Sanitize HTML to prevent XSS attacks while preserving safe tags & attributes
 */
export function sanitizeHtml(html: string): string {
  if (!html) return "";
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "h1", "h2", "h3", "h4", "h5", "h6", "p", "a", "ul", "ol", "li",
      "b", "i", "strong", "em", "strike", "code", "pre", "blockquote",
      "img", "figure", "figcaption", "table", "thead", "tbody", "tr", "th",
      "td", "hr", "br", "span", "div", "iframe", "video", "source"
    ],
    ALLOWED_ATTR: [
      "href", "target", "rel", "src", "alt", "title", "class", "style",
      "width", "height", "frameborder", "allow", "allowfullscreen", "data-*"
    ],
    ADD_ATTR: ["target"],
  });
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string, length: number): string {
  if (!str || str.length <= length) return str;
  return str.slice(0, length) + "...";
}
