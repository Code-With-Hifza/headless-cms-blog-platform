import { describe, it, expect } from "vitest";
import { slugify, calculateReadingTime, countWords, sanitizeHtml, formatDate } from "@/lib/utils";

describe("Utility Functions Unit Tests", () => {
  describe("slugify", () => {
    it("converts uppercase, spaces, and special characters to clean hyphenated slug", () => {
      expect(slugify("Next.js 16 & Modern Web Architectures!")).toBe("nextjs-16-modern-web-architectures");
      expect(slugify("  Hello   World  ")).toBe("hello-world");
      expect(slugify("C++ & Rust Programming Guide (2026)")).toBe("c-rust-programming-guide-2026");
    });
  });

  describe("countWords & calculateReadingTime", () => {
    it("accurately counts words from text and strips HTML markup", () => {
      const html = "<p>This is a <strong>clean test</strong> article with seven words.</p>";
      expect(countWords(html)).toBe(9);
    });

    it("calculates reading time with 1 min minimum", () => {
      expect(calculateReadingTime("Short post")).toBe(1);
      const longPost = new Array(500).fill("word").join(" ");
      expect(calculateReadingTime(longPost)).toBe(3);
    });
  });

  describe("sanitizeHtml", () => {
    it("strips harmful script tags and keeps safe tags", () => {
      const dirty = `<p>Safe text</p><script>alert('xss')</script><img src="x" onerror="alert(1)"/>`;
      const clean = sanitizeHtml(dirty);
      expect(clean).toContain("<p>Safe text</p>");
      expect(clean).not.toContain("<script>");
      expect(clean).not.toContain("onerror");
    });
  });

  describe("formatDate", () => {
    it("formats ISO date string into readable short date format", () => {
      const formatted = formatDate("2026-09-05T12:00:00Z");
      expect(formatted).toBe("Sep 5, 2026");
    });
  });
});
