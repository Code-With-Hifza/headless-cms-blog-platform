# ContentFlow — Production-Grade Headless CMS & Digital Publishing Platform

ContentFlow is a portfolio-grade Headless Content Management System and Digital Publishing Engine built with Next.js 16 App Router, React 19, TypeScript, PostgreSQL, Drizzle ORM, Tiptap, Auth.js, and Tailwind CSS.

---

## 🚀 Key Features

- **Decoupled Headless Architecture**: Modern decoupled content management system with RESTful API v1 and OpenAPI v3 integration.
- **Rich-Text Studio**: Powered by Tiptap with formatting, tables, code syntax highlighting, YouTube embeds, image uploads, word counting, and reading time estimation.
- **Debounced Auto-Save**: Real-time background auto-saving with user-facing status indicators.
- **Editorial State Machine**: Strict role-based transition pipeline (`DRAFT` → `IN_REVIEW` → `SCHEDULED` → `PUBLISHED` → `ARCHIVED`).
- **Server-Side Scheduled Publishing**: Autonomous cron-based worker to publish scheduled articles on time.
- **Granular RBAC**: Role-based access control with `ADMIN`, `EDITOR`, `AUTHOR`, and `USER` roles enforced across Server Actions and REST API endpoints.
- **Full-Text PostgreSQL Search**: Multi-field querying across posts, categories, tags, and author profiles.
- **Automated SEO & Structured Data**: Dynamic Open Graph metadata, canonical URLs, XML sitemap, `robots.txt`, RSS 2.0 feed, and Google JSON-LD schema generation.
- **Interactive Comment System**: Threaded comments with an editorial moderation workflow (`PENDING`, `APPROVED`, `REJECTED`, `SPAM`).
- **Newsletter Engine**: Double opt-in subscribers management with tokenized 1-click unsubscribe links and Resend email integration.
- **Privacy-Conscious Analytics**: Post view tracking without invasive fingerprinting, complete with 14-day activity trends and category breakdown graphs.
- **Containerized & Tested**: Multi-stage Dockerfile, Docker Compose, GitHub Actions CI/CD, and 100% passing Vitest test suites.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router), React 19 |
| **Language** | TypeScript 5.7+ |
| **Database** | PostgreSQL (Neon serverless / local Postgres) |
| **ORM** | Drizzle ORM & Drizzle Kit |
| **Editor** | Tiptap (Headings, Code, YouTube, Tables, Underline) |
| **Auth** | NextAuth / Auth.js with Bcrypt password hashing & RBAC |
| **Styling** | Tailwind CSS & Radix UI Primitives |
| **Email** | Resend API client abstraction |
| **Testing** | Vitest & React Testing Library |
| **Containerization** | Docker & Docker Compose |

---

## ⚡ Quick Start

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/contentflow.git
cd contentflow
npm install --legacy-peer-deps
```

### 2. Environment Variables
Copy `.env.example` to `.env` and configure your database connection string:
```bash
cp .env.example .env
```

### 3. Synchronize Schema & Seed Demo Data
```bash
# Push schema migrations to Neon / PostgreSQL
npx tsx scripts/migrate.ts

# Populate database with 5 authors, 8 categories, 25 tags, 40 original posts, 100 comments, and 105 media assets
npx tsx scripts/seed.ts
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) for the public publication, and [http://localhost:3000/admin](http://localhost:3000/admin) for the CMS Studio.

---

## 👥 Demo Credentials

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Admin** | `admin@contentflow.io` | `Password123!` | Full system and content access |
| **Editor** | `editor@contentflow.io` | `Password123!` | Edit, moderate & publish all content |
| **Author** | `author@contentflow.io` | `Password123!` | Create & manage own articles |
| **User** | `user@contentflow.io` | `Password123!` | Read & comment on articles |

---

## 📡 REST API v1 Overview

Explore the OpenAPI specification live at `/api/v1/openapi`.

- `GET /api/v1/posts` — Query published articles with pagination, category/tag filters, search, and sorting.
- `POST /api/v1/posts` — Create new publication (Authenticated).
- `GET /api/v1/posts/:id` — Retrieve post by ID.
- `PATCH /api/v1/posts/:id` — Update post (Authorized).
- `DELETE /api/v1/posts/:id` — Delete post (Authorized).
- `POST /api/v1/posts/:id/publish` — Publish article immediately.
- `POST /api/v1/posts/:id/autosave` — Debounced auto-save endpoint.
- `GET /api/v1/categories` — List all categories with article counts.
- `GET /api/v1/tags` — List all tags.
- `GET /api/v1/search?q=nextjs` — Full-text multi-entity search.
- `POST /api/v1/newsletter/subscribe` — Subscribe reader to newsletter.
- `GET /api/cron/schedule` — Server-side scheduled publishing trigger.

---

## 🧪 Testing

Run automated unit and integration tests:
```bash
npm test
```

---

## 🐳 Docker Deployment

To launch the complete containerized stack (Next.js app, PostgreSQL, Redis):
```bash
docker compose up -d
```

---

## 📄 Documentation

- [Architecture Design](docs/architecture.md)
- [Database Schema & Migrations](docs/database.md)
- [REST API Reference](docs/api.md)
- [Authentication & RBAC](docs/authentication.md)
- [Security & Compliance](docs/security.md)
- [Production Deployment](docs/deployment.md)

---

## 🛡 License
MIT License. Built with modern engineering best practices for high-performance publishing platforms.
