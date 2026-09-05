import { NextResponse } from "next/server";
import { db, sql } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { slugify, calculateReadingTime, countWords } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Step 1: Run DDL queries to create all tables and enums if they do not exist
    await sql(`
      DO $$ BEGIN
        CREATE TYPE post_status AS ENUM ('DRAFT', 'IN_REVIEW', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await sql(`
      DO $$ BEGIN
        CREATE TYPE comment_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SPAM');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await sql(`
      DO $$ BEGIN
        CREATE TYPE subscriber_status AS ENUM ('SUBSCRIBED', 'UNSUBSCRIBED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await sql(`
      CREATE TABLE IF NOT EXISTS roles (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
    `);

    await sql(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255),
        email VARCHAR(255) NOT NULL UNIQUE,
        email_verified TIMESTAMPTZ,
        password_hash TEXT,
        image TEXT,
        is_active BOOLEAN DEFAULT TRUE NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
    `);

    await sql(`
      CREATE TABLE IF NOT EXISTS user_roles (
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role_id VARCHAR(50) NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
        assigned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        PRIMARY KEY (user_id, role_id)
      );
    `);

    await sql(`
      CREATE TABLE IF NOT EXISTS accounts (
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(255) NOT NULL,
        provider VARCHAR(255) NOT NULL,
        provider_account_id VARCHAR(255) NOT NULL,
        refresh_token TEXT,
        access_token TEXT,
        expires_at INT,
        token_type VARCHAR(255),
        scope VARCHAR(255),
        id_token TEXT,
        session_state VARCHAR(255),
        PRIMARY KEY (provider, provider_account_id)
      );
    `);

    await sql(`
      CREATE TABLE IF NOT EXISTS sessions (
        session_token VARCHAR(255) PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires TIMESTAMPTZ NOT NULL
      );
    `);

    await sql(`
      CREATE TABLE IF NOT EXISTS verification_tokens (
        identifier VARCHAR(255) NOT NULL,
        token VARCHAR(255) NOT NULL,
        expires TIMESTAMPTZ NOT NULL,
        PRIMARY KEY (identifier, token)
      );
    `);

    await sql(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL,
        token VARCHAR(255) NOT NULL UNIQUE,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
    `);

    await sql(`
      CREATE TABLE IF NOT EXISTS authors (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        display_name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        bio TEXT,
        avatar_url TEXT,
        website_url TEXT,
        twitter_url TEXT,
        linkedin_url TEXT,
        github_url TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
    `);

    await sql(`
      CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        image TEXT,
        seo_title VARCHAR(255),
        seo_description TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
    `);

    await sql(`
      CREATE TABLE IF NOT EXISTS tags (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
    `);

    await sql(`
      CREATE TABLE IF NOT EXISTS media (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        file_name VARCHAR(255) NOT NULL,
        file_url TEXT NOT NULL,
        file_type VARCHAR(50) NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        file_size INT NOT NULL,
        width INT,
        height INT,
        alt_text VARCHAR(255),
        caption TEXT,
        uploader_id UUID REFERENCES users(id) ON DELETE SET NULL,
        provider VARCHAR(50) DEFAULT 'local' NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
    `);

    await sql(`
      CREATE TABLE IF NOT EXISTS posts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(500) NOT NULL,
        slug VARCHAR(500) NOT NULL UNIQUE,
        excerpt TEXT,
        content TEXT DEFAULT '' NOT NULL,
        featured_image_id UUID REFERENCES media(id) ON DELETE SET NULL,
        author_id UUID NOT NULL REFERENCES authors(id) ON DELETE RESTRICT,
        category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
        status post_status DEFAULT 'DRAFT' NOT NULL,
        published_at TIMESTAMPTZ,
        scheduled_at TIMESTAMPTZ,
        seo_title VARCHAR(255),
        seo_description TEXT,
        canonical_url TEXT,
        og_image_id UUID REFERENCES media(id) ON DELETE SET NULL,
        reading_time INT DEFAULT 1 NOT NULL,
        word_count INT DEFAULT 0 NOT NULL,
        is_featured BOOLEAN DEFAULT FALSE NOT NULL,
        views_count INT DEFAULT 0 NOT NULL,
        preview_token VARCHAR(100),
        preview_expires_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
    `);

    await sql(`
      CREATE TABLE IF NOT EXISTS post_tags (
        post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
        PRIMARY KEY (post_id, tag_id)
      );
    `);

    await sql(`
      CREATE TABLE IF NOT EXISTS post_views (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        ip_hash VARCHAR(64),
        user_agent TEXT,
        referer TEXT,
        viewed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
    `);

    await sql(`
      CREATE TABLE IF NOT EXISTS comments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        author_name VARCHAR(255) NOT NULL,
        author_email VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        status comment_status DEFAULT 'PENDING' NOT NULL,
        parent_id UUID,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
    `);

    await sql(`
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL UNIQUE,
        status subscriber_status DEFAULT 'SUBSCRIBED' NOT NULL,
        token VARCHAR(255) NOT NULL UNIQUE,
        subscribed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        unsubscribed_at TIMESTAMPTZ
      );
    `);

    await sql(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id VARCHAR(50) PRIMARY KEY DEFAULT 'default',
        site_name VARCHAR(255) DEFAULT 'ContentFlow' NOT NULL,
        site_description TEXT DEFAULT 'A next-generation publishing platform and headless CMS.' NOT NULL,
        logo_url TEXT,
        favicon_url TEXT,
        social_links JSONB DEFAULT '{"twitter":"https://twitter.com","github":"https://github.com","linkedin":"https://linkedin.com"}'::jsonb,
        allow_comments BOOLEAN DEFAULT TRUE NOT NULL,
        require_comment_moderation BOOLEAN DEFAULT TRUE NOT NULL,
        allow_registration BOOLEAN DEFAULT TRUE NOT NULL,
        default_role VARCHAR(50) DEFAULT 'USER' NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
    `);

    await sql(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(100) NOT NULL,
        entity VARCHAR(100) NOT NULL,
        entity_id VARCHAR(255),
        details JSONB,
        ip_address VARCHAR(100),
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
    `);

    // Step 2: Seed Roles
    const roleData = [
      { id: "ADMIN", name: "Administrator", description: "Full system and content access" },
      { id: "EDITOR", name: "Editor", description: "Can edit, moderate and publish all content" },
      { id: "AUTHOR", name: "Author", description: "Can write and manage own articles" },
      { id: "USER", name: "User", description: "Standard registered user with commenting access" },
    ];

    for (const r of roleData) {
      await db.insert(schema.roles).values(r).onConflictDoNothing();
    }

    // Step 3: Seed Users
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
        }).onConflictDoNothing();
      }

      createdUsers[u.email] = userId;
    }

    // Step 4: Seed Authors
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

    // Step 5: Seed Categories
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

    // Step 6: Seed Tags
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

    // Step 7: Seed Media Assets
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
    ];

    const mediaIds: string[] = [];
    const existingMedia = await db.select({ id: schema.media.id }).from(schema.media).limit(10);
    if (existingMedia.length > 0) {
      existingMedia.forEach((m) => mediaIds.push(m.id));
    } else {
      for (let i = 0; i < 20; i++) {
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
    }

    // Step 8: Seed Posts
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
      
      const existing = await db.query.posts.findFirst({
        where: eq(schema.posts.slug, slug),
      });

      if (existing) {
        createdPostIds.push(existing.id);
        continue;
      }

      const authorId = authorIds[i % authorIds.length];
      const categoryId = categoryIds[i % categoryIds.length];
      const featuredImageId = mediaIds[i % mediaIds.length];
      const ogImageId = mediaIds[(i + 5) % mediaIds.length];

      const isPublished = i < 35;
      const status = isPublished ? "PUBLISHED" : "DRAFT";

      const daysAgo = 40 - i;
      const publishedAtDate = new Date();
      publishedAtDate.setDate(publishedAtDate.getDate() - daysAgo);

      const articleHtml = `
        <p class="lead">In this comprehensive guide, we explore modern architectural patterns, practical techniques, and engineering decisions behind building scalable, reliable, and high-performance applications.</p>
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

      const postTag1 = tagIds[i % tagIds.length];
      const postTag2 = tagIds[(i + 3) % tagIds.length];

      if (postTag1) {
        await db.insert(schema.postTags).values({ postId: createdPost.id, tagId: postTag1 }).onConflictDoNothing();
      }
      if (postTag2) {
        await db.insert(schema.postTags).values({ postId: createdPost.id, tagId: postTag2 }).onConflictDoNothing();
      }
    }

    // Step 9: Seed Site Settings
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

    return NextResponse.json({
      success: true,
      message: "Database tables created and seeded successfully!",
      stats: {
        categories: categoryIds.length,
        authors: authorIds.length,
        tags: tagIds.length,
        posts: createdPostIds.length,
      },
    });
  } catch (error: any) {
    console.error("Seed API Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Failed to seed database",
        stack: error.stack
      },
      { status: 200 }
    );
  }
}
