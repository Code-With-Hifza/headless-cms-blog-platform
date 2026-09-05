import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { eq } from "drizzle-orm";
import * as schema from "../lib/db/schema";
import bcrypt from "bcryptjs";
import { slugify, calculateReadingTime, countWords } from "../lib/utils";

async function main() {
  console.log("🌱 Starting ContentFlow database seeding...");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  // 1. Seed Roles
  console.log("Creating roles...");
  const roleData = [
    { id: "ADMIN", name: "Administrator", description: "Full system and content access" },
    { id: "EDITOR", name: "Editor", description: "Can edit, moderate and publish all content" },
    { id: "AUTHOR", name: "Author", description: "Can write and manage own articles" },
    { id: "USER", name: "User", description: "Standard registered user with commenting access" },
  ];

  for (const r of roleData) {
    await db.insert(schema.roles).values(r).onConflictDoNothing();
  }

  // 2. Seed Users & Accounts
  console.log("Creating demo user accounts...");
  const defaultPassword = await bcrypt.hash("Password123!", 10);

  const demoUsers = [
    { name: "Eleanor Vance", email: "admin@contentflow.io", role: "ADMIN", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" },
    { name: "Marcus Chen", email: "editor@contentflow.io", role: "EDITOR", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" },
    { name: "Sophia Rodriguez", email: "author@contentflow.io", role: "AUTHOR", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" },
    { name: "David Kim", email: "david@contentflow.io", role: "AUTHOR", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150" },
    { name: "Amara Okafor", email: "amara@contentflow.io", role: "AUTHOR", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150" },
    { name: "Alex Rivers", email: "user@contentflow.io", role: "USER", image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150" },
  ];

  const createdUsers: Record<string, string> = {};

  for (const u of demoUsers) {
    const [existing] = await db.select().from(schema.users).where(eq(schema.users.email, u.email));
    let userId = existing?.id;

    if (!userId) {
      const [newUser] = await db
        .insert(schema.users)
        .values({
          name: u.name,
          email: u.email,
          emailVerified: new Date(),
          passwordHash: defaultPassword,
          image: u.image,
          isActive: true,
        })
        .returning();
      userId = newUser.id;

      await db.insert(schema.userRoles).values({
        userId,
        roleId: u.role,
      });
    }

    createdUsers[u.email] = userId;
  }

  // 3. Seed Authors (5 authors)
  console.log("Creating authors...");
  const authorData = [
    {
      email: "admin@contentflow.io",
      displayName: "Eleanor Vance",
      slug: "eleanor-vance",
      bio: "Chief Editor and systems architect specializing in distributed platforms, editorial engineering, and modern web frameworks.",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
      websiteUrl: "https://eleanorvance.dev",
      twitterUrl: "https://twitter.com/eleanorvance",
      linkedinUrl: "https://linkedin.com/in/eleanorvance",
      githubUrl: "https://github.com/eleanorvance",
    },
    {
      email: "editor@contentflow.io",
      displayName: "Marcus Chen",
      slug: "marcus-chen",
      bio: "Senior Technical Writer and open-source contributor exploring TypeScript, React compiler internals, and cloud infrastructure.",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
      websiteUrl: "https://marcuschen.io",
      twitterUrl: "https://twitter.com/marcuschen",
      githubUrl: "https://github.com/marcuschen",
    },
    {
      email: "author@contentflow.io",
      displayName: "Sophia Rodriguez",
      slug: "sophia-rodriguez",
      bio: "UI/UX lead and frontend specialist focusing on design systems, micro-interactions, and accessible web experiences.",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
      websiteUrl: "https://sophiarodriguez.design",
      twitterUrl: "https://twitter.com/sophiarodriguez",
      linkedinUrl: "https://linkedin.com/in/sophiarodriguez",
    },
    {
      email: "david@contentflow.io",
      displayName: "David Kim",
      slug: "david-kim",
      bio: "Full-stack engineer with deep expertise in database performance, PostgreSQL internals, and edge computing.",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
      websiteUrl: "https://davidkim.tech",
      githubUrl: "https://github.com/davidkim",
    },
    {
      email: "amara@contentflow.io",
      displayName: "Amara Okafor",
      slug: "amara-okafor",
      bio: "AI researcher and software engineer writing about LLM integration, agentic workflows, and the future of headless CMS.",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400",
      websiteUrl: "https://amaraokafor.ai",
      twitterUrl: "https://twitter.com/amaraokafor",
      linkedinUrl: "https://linkedin.com/in/amaraokafor",
    },
  ];

  const authorIds: string[] = [];
  for (const a of authorData) {
    const userId = createdUsers[a.email];
    const existing = await db.query.authors.findFirst({
      where: eq(schema.authors.slug, a.slug),
    });

    if (existing) {
      authorIds.push(existing.id);
    } else {
      const [created] = await db
        .insert(schema.authors)
        .values({
          userId,
          displayName: a.displayName,
          slug: a.slug,
          bio: a.bio,
          avatarUrl: a.avatarUrl,
          websiteUrl: a.websiteUrl,
          twitterUrl: a.twitterUrl,
          linkedinUrl: a.linkedinUrl,
          githubUrl: a.githubUrl,
        })
        .returning();
      authorIds.push(created.id);
    }
  }

  // 4. Seed Categories (8 categories)
  console.log("Creating categories...");
  const categoriesList = [
    { name: "Engineering & Architecture", slug: "engineering", description: "Deep dives into system design, backend scalability, and database optimization.", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800" },
    { name: "Frontend & Design", slug: "frontend-design", description: "Modern styling, React architectures, UI animations, and accessible experiences.", image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800" },
    { name: "AI & Machine Learning", slug: "artificial-intelligence", description: "Agentic AI workflows, LLM applications, embeddings, and prompt engineering.", image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800" },
    { name: "Next.js & React", slug: "nextjs-react", description: "Server components, App Router patterns, streaming, and modern React 19 paradigms.", image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800" },
    { name: "Cloud & DevOps", slug: "cloud-devops", description: "CI/CD pipelines, Docker containerization, edge computing, and Kubernetes deployments.", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800" },
    { name: "Headless CMS & Content", slug: "headless-cms", description: "Content modeling, structured data architectures, and composable publishing.", image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800" },
    { name: "Security & Performance", slug: "security-performance", description: "Web vitals optimization, CSRF/XSS prevention, OAuth protocols, and data protection.", image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800" },
    { name: "Product & Strategy", slug: "product-strategy", description: "Building scalable digital products, SaaS monetization, and developer experience.", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800" },
  ];

  const categoryIds: string[] = [];
  for (const c of categoriesList) {
    const existing = await db.query.categories.findFirst({
      where: eq(schema.categories.slug, c.slug),
    });
    if (existing) {
      categoryIds.push(existing.id);
    } else {
      const [created] = await db
        .insert(schema.categories)
        .values({
          name: c.name,
          slug: c.slug,
          description: c.description,
          image: c.image,
          seoTitle: `${c.name} Articles & Guides`,
          seoDescription: c.description,
        })
        .returning();
      categoryIds.push(created.id);
    }
  }

  // 5. Seed Tags (25 tags)
  console.log("Creating tags...");
  const tagsList = [
    "TypeScript", "Next.js", "React 19", "PostgreSQL", "Drizzle ORM",
    "Tailwind CSS", "Architecture", "Performance", "Full-Stack", "Auth.js",
    "REST API", "OpenAPI", "Docker", "DevOps", "Edge Computing",
    "Microservices", "Tiptap", "Headless CMS", "SEO", "Accessibility",
    "Security", "Server Actions", "LLMs", "AI Agents", "Cloudflare"
  ];

  const tagIds: string[] = [];
  for (const t of tagsList) {
    const slug = slugify(t);
    const existing = await db.query.tags.findFirst({
      where: eq(schema.tags.slug, slug),
    });
    if (existing) {
      tagIds.push(existing.id);
    } else {
      const [created] = await db
        .insert(schema.tags)
        .values({
          name: t,
          slug,
          description: `Articles and guides tagged with #${t}`,
        })
        .returning();
      tagIds.push(created.id);
    }
  }

  // 6. Seed Media Assets (100+ assets)
  console.log("Creating media assets...");
  const unsplashCurated = [
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200",
    "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200",
    "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200",
    "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200",
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200",
    "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200",
    "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200",
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200",
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200",
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200",
    "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200",
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200",
    "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=1200",
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200",
    "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=1200",
    "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200",
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200",
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200",
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200",
  ];

  const mediaIds: string[] = [];
  for (let i = 0; i < 105; i++) {
    const url = unsplashCurated[i % unsplashCurated.length] + `&sig=${i}`;
    const [record] = await db
      .insert(schema.media)
      .values({
        fileName: `asset-contentflow-${i + 1}.webp`,
        fileUrl: url,
        fileType: "image",
        mimeType: "image/webp",
        fileSize: 124000 + (i * 4500),
        width: 1200,
        height: 675,
        altText: `ContentFlow editorial asset ${i + 1}`,
        caption: `High-resolution editorial media asset #${i + 1}`,
        provider: "local",
      })
      .returning();
    mediaIds.push(record.id);
  }

  // 7. Seed 40 Original High-Quality Posts
  console.log("Creating 40 original posts...");
  const postTitles = [
    "Architecting a High-Performance Headless CMS with Next.js 16 and PostgreSQL",
    "The Evolution of React 19: Server Actions, Transitions, and Modern Compiler Internals",
    "Zero-Overhead Database Queries with Drizzle ORM and Connection Pooling",
    "Building Resilient Role-Based Access Control in Next.js Server Components",
    "Crafting a Flawless Rich-Text Editor with Tiptap, Extensions, and Realtime Auto-Save",
    "Edge-First Content Delivery: Caching, Invalidation, and Dynamic Revalidation",
    "Automating SEO: Dynamic Sitemaps, RSS Feeds, and Open Graph Image Generation",
    "Scaling PostgreSQL Full-Text Search: GIN Indexes, Ranking, and Sub-Millisecond Search",
    "From Monolith to Headless: The Modern Publisher's Architecture Playbook",
    "Designing Accessible Design Systems: Color Contrast, Focus Management, and ARIA States",
    "Server-Side Scheduled Publishing: Building Reliable Cron Triggers in Node.js",
    "Securing Web Applications Against Modern Threats: CSRF, XSS, and Rate Limiting",
    "Micro-Frontends vs Composable Architecture: Choosing the Right Publishing Stack",
    "Mastering TypeScript 5: Template Literal Types, Const Type Parameters, and Satisfies",
    "Deploying Next.js Applications with Docker, Multi-Stage Builds, and GitHub Actions",
    "Building Interactive Data Dashboards with Recharts and Server-Driven Analytics",
    "Newsletter Growth Architecture: Double Opt-in, Tokenized Unsubscribe, and Email Delivery",
    "The Complete Guide to Core Web Vitals: LCP, INP, and CLS Optimization",
    "Decoupled Content Modeling: Best Practices for Schema Design in Enterprise CMS",
    "Real-Time Collaborative Editing: Operational Transformation vs CRDTs in the Browser",
    "Optimizing Media Delivery: Responsive Images, AVIF, WebP, and Lazy Loading",
    "Understanding PostgreSQL Indexing Strategies: B-Tree, BRIN, GIN, and Partial Indexes",
    "Modern Authentication Patterns: Passkeys, WebAuthn, OAuth 2.0, and JWT Security",
    "Building Type-Safe REST APIs with Zod Validation and OpenAPI Documentation",
    "The Power of CSS Grid and Flexbox: Building Fluid Editorial Magazine Layouts",
    "State Management in React 19: Signals, Context, and Server-Synced State",
    "Event-Driven Microservices: Building Webhook Pipelines with Idempotency Guarantees",
    "Audit Logging and Compliance in Enterprise Publishing Systems",
    "How to Build a Spam-Proof Comment System with Heuristic Analysis and Moderation",
    "Benchmarking Next.js App Router vs Pages Router on Cold Starts and Memory Usage",
    "Building Multi-Tenant SaaS with PostgreSQL Row-Level Security and Drizzle ORM",
    "Clean Architecture in Full-Stack TypeScript: Repositories, Services, and Controllers",
    "Integrating Autonomous AI Agents into Editorial Workflows and Content Operations",
    "The Future of Web Typography: Variable Fonts, Optical Sizing, and Performance",
    "Database Migration Strategies with Zero Downtime in Continuous Deployment",
    "Deep Dive into HTTP/3 and QUIC: What Full-Stack Engineers Need to Know",
    "Mastering Git Workflows: Trunk-Based Development, Conventional Commits, and Semantic Releases",
    "Building High-Conversion Landing Pages with Micro-Interactions and Glassmorphism",
    "Privacy-Conscious Web Analytics: Tracking Page Views Without Fingerprinting",
    "Building Portfolio-Grade Full-Stack Applications: A Master Checklist for Engineers"
  ];

  const createdPostIds: string[] = [];
  for (let i = 0; i < postTitles.length; i++) {
    const title = postTitles[i];
    const slug = slugify(title);
    const authorId = authorIds[i % authorIds.length];
    const categoryId = categoryIds[i % categoryIds.length];
    const featuredImageId = mediaIds[i % mediaIds.length];
    const ogImageId = mediaIds[(i + 5) % mediaIds.length];

    const isPublished = i < 34; // 34 published, 3 draft, 2 scheduled, 1 in review
    const status = isPublished
      ? "PUBLISHED"
      : i === 34 || i === 35
      ? "DRAFT"
      : i === 36 || i === 37
      ? "SCHEDULED"
      : i === 38
      ? "IN_REVIEW"
      : "ARCHIVED";

    const daysAgo = 40 - i;
    const publishedAtDate = new Date();
    publishedAtDate.setDate(publishedAtDate.getDate() - daysAgo);

    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + 3);

    const articleHtml = `
      <p class="lead">In this comprehensive guide, we explore the modern architectural patterns, practical techniques, and engineering decisions behind building scalable, reliable, and high-performance applications.</p>
      <h2>The Core Architectural Vision</h2>
      <p>Modern publishing workflows demand decoupling presentation layers from content authoring engines. By leveraging a headless paradigm, editorial teams gain the freedom to structure data semantically while engineering teams deploy high-speed frontends tailored for sub-second page loads.</p>
      <blockquote>"Architecture is the decisions that you wish you could get right early in a project." — Ralph Johnson</blockquote>
      <h2>Key Technical Principles</h2>
      <p>When architecting a production system, three foundational pillars must be addressed:</p>
      <ul>
        <li><strong>Strict Type Safety:</strong> Unified contracts across database models, API responses, and frontend view layers.</li>
        <li><strong>Server-First Execution:</strong> Offloading computation from client bundles to edge and server nodes.</li>
        <li><strong>Defensive Validation:</strong> Rejecting malformed payloads before they reach downstream business logic.</li>
      </ul>
      <h2>Implementation Details and Code Samples</h2>
      <p>Here is an illustrative implementation showcasing type-safe query formulation and transaction handling:</p>
      <pre><code>// Type-safe service query with Drizzle ORM
export async function getPublishedArticles(limit: number = 10) {
  return await db.query.posts.findMany({
    where: eq(posts.status, "PUBLISHED"),
    orderBy: [desc(posts.publishedAt)],
    limit,
    with: {
      author: true,
      category: true,
      featuredImage: true,
    },
  });
}</code></pre>
      <h2>Performance Benchmarks and Real-World Results</h2>
      <p>Across our synthetic workloads and live production monitoring, implementing streaming server components coupled with aggressive tag-based revalidation resulted in a <strong>68% reduction in Time to First Byte (TTFB)</strong> and consistent <strong>100/100 Lighthouse performance scores</strong>.</p>
      <h2>Conclusion</h2>
      <p>By unifying modular service design, database indexing strategies, and automated content workflows, modern publishing platforms can achieve uncompromising speed, enterprise-grade security, and an inspiring developer experience.</p>
    `;

    const excerpt = `A deep dive into ${title.toLowerCase()}, examining best practices, production architecture, and performance optimizations.`;
    const readingTime = calculateReadingTime(articleHtml);
    const wordCount = countWords(articleHtml);

    const [createdPost] = await db
      .insert(schema.posts)
      .values({
        title,
        slug,
        excerpt,
        content: articleHtml,
        authorId,
        categoryId,
        featuredImageId,
        ogImageId,
        status,
        publishedAt: status === "PUBLISHED" ? publishedAtDate : null,
        scheduledAt: status === "SCHEDULED" ? scheduledDate : null,
        seoTitle: title,
        seoDescription: excerpt,
        canonicalUrl: `https://contentflow.io/blog/${slug}`,
        readingTime,
        wordCount,
        isFeatured: i < 5,
        viewsCount: 150 + (i * 38),
      })
      .returning();

    createdPostIds.push(createdPost.id);

    // Attach 2-3 tags per post
    const postTag1 = tagIds[i % tagIds.length];
    const postTag2 = tagIds[(i + 3) % tagIds.length];
    const postTag3 = tagIds[(i + 7) % tagIds.length];

    await db.insert(schema.postTags).values([
      { postId: createdPost.id, tagId: postTag1 },
      { postId: createdPost.id, tagId: postTag2 },
      { postId: createdPost.id, tagId: postTag3 },
    ]).onConflictDoNothing();
  }

  // 8. Seed 100 Comments
  console.log("Creating 100 comments...");
  const commentAuthors = [
    { name: "Liam Parker", email: "liam.parker@example.com" },
    { name: "Maya Patel", email: "maya.patel@example.com" },
    { name: "Julian Thorne", email: "julian.thorne@example.com" },
    { name: "Chloe Dupont", email: "chloe.dupont@example.com" },
    { name: "Benjamin Ross", email: "ben.ross@example.com" },
    { name: "Zoe Zimmerman", email: "zoe.z@example.com" },
    { name: "Gabriel Silva", email: "gabriel.silva@example.com" },
    { name: "Hannah Schmidt", email: "hannah.s@example.com" },
  ];

  const commentPhrases = [
    "This is one of the most thorough and well-explained articles on this topic. The code snippets are crystal clear!",
    "Incredible breakdown! The benchmark comparisons really helped solidify why this architectural approach wins.",
    "Bookmarking this for our engineering team. We are currently going through a similar migration.",
    "Great insights on database indexing and connection pooling. How does this perform under high concurrency?",
    "Loved the section on security headers and defensive validation. Very practical advice for production systems.",
    "Very clean architecture. Using Drizzle ORM with Next.js App Router feels like the modern sweet spot.",
    "Excellent explanation of server-side scheduled publishing. The cron trigger approach is so elegant.",
    "The typography and reading experience of this blog is absolutely gorgeous! Great work on the platform.",
  ];

  for (let i = 0; i < 100; i++) {
    const commenter = commentAuthors[i % commentAuthors.length];
    const phrase = commentPhrases[i % commentPhrases.length];
    const postId = createdPostIds[i % createdPostIds.length];

    await db.insert(schema.comments).values({
      postId,
      authorName: commenter.name,
      authorEmail: commenter.email,
      content: `${phrase} (Ref #${i + 1})`,
      status: i % 10 === 0 ? "PENDING" : "APPROVED",
    });
  }

  // 9. Seed Newsletter Subscribers
  console.log("Creating newsletter subscribers...");
  for (let i = 1; i <= 25; i++) {
    await db.insert(schema.newsletterSubscribers).values({
      email: `subscriber${i}@contentflow.io`,
      status: "SUBSCRIBED",
      token: `token_sub_${i}_${Date.now()}`,
    }).onConflictDoNothing();
  }

  // 10. Seed Site Settings
  console.log("Setting default site configuration...");
  await db
    .insert(schema.siteSettings)
    .values({
      id: "default",
      siteName: "ContentFlow",
      siteDescription: "The production-grade headless CMS and publishing platform for modern digital creators.",
      allowComments: true,
      requireCommentModeration: true,
      allowRegistration: true,
      defaultRole: "USER",
      socialLinks: {
        twitter: "https://twitter.com/contentflow",
        github: "https://github.com/contentflow",
        linkedin: "https://linkedin.com/company/contentflow",
      },
    })
    .onConflictDoNothing();

  console.log("✅ Seed completed successfully!");
  console.log("✨ Seed summary: 5 Authors, 8 Categories, 25 Tags, 40 Original Posts, 100 Comments, 105 Media Assets.");
  await pool.end();
}

main().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
