import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { generatePageMetadata } from "@/lib/seo";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = generatePageMetadata({
  title: "ContentFlow — Headless CMS & Digital Publishing Platform",
  description:
    "Production-grade headless CMS and publishing platform engineered with Next.js 16, PostgreSQL, and Drizzle ORM.",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
