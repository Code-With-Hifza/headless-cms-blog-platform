import { NextResponse } from "next/server";
import { getPosts } from "@/lib/services/posts";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const postsResult = await getPosts({ status: "PUBLISHED", limit: 30 });

  const itemsXml = postsResult.data
    .map((post) => {
      const pubDate = new Date(post.publishedAt || post.createdAt).toUTCString();
      const authorName = post.author?.displayName || "ContentFlow Editorial";
      const categoryName = post.category?.name || "General";
      const link = `${baseUrl}/blog/${post.slug}`;

      return `
        <item>
          <title><![CDATA[${post.title}]]></title>
          <link>${link}</link>
          <guid isPermaLink="true">${link}</guid>
          <description><![CDATA[${post.excerpt || post.title}]]></description>
          <dc:creator><![CDATA[${authorName}]]></dc:creator>
          <category><![CDATA[${categoryName}]]></category>
          <pubDate>${pubDate}</pubDate>
        </item>
      `;
    })
    .join("");

  const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>ContentFlow — Next-Gen Publishing Platform</title>
    <link>${baseUrl}</link>
    <description>Latest technical architecture publications and high-signal essays from ContentFlow.</description>
    <language>en-US</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    ${itemsXml}
  </channel>
</rss>`;

  return new NextResponse(rssFeed, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
