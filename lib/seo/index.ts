import type { Metadata } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
const SITE_NAME = "ContentFlow";
const DEFAULT_DESCRIPTION =
  "ContentFlow is a next-generation headless CMS and digital publishing platform built for modern editorial teams and content creators.";

export function generatePageMetadata({
  title,
  description,
  path = "",
  image,
  type = "website",
  publishedTime,
  authors,
}: {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  authors?: string[];
}): Metadata {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const fullDescription = description || DEFAULT_DESCRIPTION;
  const url = `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const ogImageUrl = image || `${SITE_URL}/og-default.png`;

  return {
    title: fullTitle,
    description: fullDescription,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description: fullDescription,
      url,
      siteName: SITE_NAME,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      type,
      publishedTime: publishedTime,
      authors: authors,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: fullDescription,
      images: [ogImageUrl],
      creator: "@contentflow",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export function generateJsonLdArticle(post: {
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string;
  publishedAt?: Date | string | null;
  updatedAt?: Date | string | null;
  author?: { displayName: string; avatarUrl?: string | null } | null;
  featuredImage?: { fileUrl: string } | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || post.title,
    image: post.featuredImage?.fileUrl
      ? `${SITE_URL}${post.featuredImage.fileUrl}`
      : `${SITE_URL}/og-default.png`,
    datePublished: post.publishedAt || new Date().toISOString(),
    dateModified: post.updatedAt || post.publishedAt || new Date().toISOString(),
    author: {
      "@type": "Person",
      name: post.author?.displayName || "ContentFlow Editorial",
      image: post.author?.avatarUrl ? `${SITE_URL}${post.author.avatarUrl}` : undefined,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${post.slug}`,
    },
  };
}

export function generateJsonLdBreadcrumb(items: { name: string; item: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((crumb, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: crumb.name,
      item: `${SITE_URL}${crumb.item}`,
    })),
  };
}
