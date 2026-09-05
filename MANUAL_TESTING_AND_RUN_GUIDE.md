# 🚀 ContentFlow — Complete Manual Testing & Terminal Run Guide

Welcome to **ContentFlow** — a production-grade, full-stack Headless CMS and Publishing Platform built with Next.js 16, TypeScript, PostgreSQL (Neon), Drizzle ORM, Tiptap, Auth.js, and Tailwind CSS.

This document provides step-by-step instructions to run the application in your terminal and perform a full end-to-end manual QA test of all features.

---

## ⚡ 1. How to Run the Project in Terminal (Windows PowerShell)

Open PowerShell in the project root directory (`a:\headless-cms-blog-platform`):

### Option 1: Using the 1-Click Script (Easiest)
In your PowerShell terminal, simply run:
```powershell
.\dev.bat
```

### Option 2: Running via PowerShell
Because Node.js is located in `B:\Setup Install`, set the PATH first in your terminal session:
```powershell
$env:Path = "B:\Setup Install;" + $env:Path; npm run dev
```

### Option 3: Permanently add Node to your Windows User PATH (One-Time Setup)
Run this command once in PowerShell so `npm` and `node` work everywhere forever:
```powershell
[Environment]::SetEnvironmentVariable("Path", [Environment]::GetEnvironmentVariable("Path", "User") + ";B:\Setup Install", "User")
```
> 🌐 The application will be accessible at: **[http://localhost:3000](http://localhost:3000)**

---

### B. Other Essential Terminal Commands

| Task | PowerShell Command |
| :--- | :--- |
| **Run Unit & Integration Tests** | `$env:Path = "B:\Setup Install;" + $env:Path; npm test` |
| **Typecheck TypeScript** | `$env:Path = "B:\Setup Install;" + $env:Path; npx tsc --noEmit` |
| **Create Production Build** | `$env:Path = "B:\Setup Install;" + $env:Path; npm run build` |
| **Start Production Server** | `$env:Path = "B:\Setup Install;" + $env:Path; npm start` |
| **Re-run Database Migrations** | `$env:Path = "B:\Setup Install;" + $env:Path; npm run db:migrate` |
| **Re-seed Database (40 Posts, 100 Comments, etc.)** | `$env:Path = "B:\Setup Install;" + $env:Path; npm run db:seed` |

---

## 🔐 2. Pre-Configured Demo Accounts & Credentials

The database has been seeded with pre-configured accounts for all RBAC roles. You can log in at **[http://localhost:3000/login](http://localhost:3000/login)** or click the quick demo role buttons on the login page:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **👑 ADMIN** | `admin@contentflow.io` | `Password123!` | Full access to Dashboard, Posts, Categories, Tags, Media, Comments, Authors, Settings, Analytics |
| **✍️ EDITOR** | `editor@contentflow.io` | `Password123!` | Can edit/publish all posts, manage media, moderate comments, manage taxonomy |
| **📝 AUTHOR** | `author@contentflow.io` | `Password123!` | Can create and edit own draft articles, upload media |
| **👤 USER** | `user@contentflow.io` | `Password123!` | Public reader account, can submit comments and manage profile |

---

## 🧪 3. Complete Step-by-Step Manual Testing Checklist

Follow these 6 testing phases to verify every component of the application:

---

### 🌟 Phase 1: Public Blog & Reader Experience

1. **Homepage Discovery** (`http://localhost:3000`):
   - [ ] Verify the **Hero Spotlight Article** loads with high-resolution image, author badge, reading time, and category pill.
   - [ ] Check the **Trending Articles Grid** (3 prominent cards).
   - [ ] Scroll through the **Latest Publications Feed** with pagination and dynamic tags.
   - [ ] Test the **Featured Authors Section** showcasing team profiles.
   - [ ] Test the **Newsletter Subscription Box** in the footer by entering an email (e.g. `test@example.com`) and verifying the success feedback toast.

2. **Blog Index & Filtering** (`http://localhost:3000/blog`):
   - [ ] Click through different category pills (e.g., *Frontend Engineering*, *Distributed Systems*, *Cloud Infrastructure*).
   - [ ] Test sorting dropdown (*Latest*, *Most Popular*).
   - [ ] Test pagination controls at the bottom of the article grid.

3. **Single Article Page** (`http://localhost:3000/blog/[slug]`):
   - [ ] Click any article card to open its detail page.
   - [ ] Verify the sticky **Table of Contents (TOC)** on the left or top generates headings dynamically from the content.
   - [ ] Verify the estimated **Reading Time** and formatted **Publication Date**.
   - [ ] Verify rich formatting: Code blocks, blockquotes, images, lists, and callout sections.
   - [ ] Test **Social Sharing Buttons** (Twitter/X, LinkedIn, Copy Link).
   - [ ] Verify the **Author Card** with bio and link to author archive.
   - [ ] Verify the **Related Posts Carousel** at the bottom.

4. **Interactive Discussion / Comments**:
   - [ ] Scroll to the Comments section on an article.
   - [ ] Enter a name, email, and comment message.
   - [ ] Submit the comment and verify it appears with a `PENDING` moderation badge or appears immediately depending on site settings.

5. **Instant Search** (`http://localhost:3000/search`):
   - [ ] Click the search icon in the top navigation or navigate to `/search`.
   - [ ] Type a keyword like `Next.js`, `Docker`, or `PostgreSQL`.
   - [ ] Verify matching articles, authors, and categories are returned instantly.

6. **Static Pages**:
   - [ ] Visit **About Us** (`/about`).
   - [ ] Visit **Contact Page** (`/contact`) and submit the contact form.
   - [ ] Visit **Privacy Policy** (`/privacy`) and **Terms of Service** (`/terms`).

---

### 🛠️ Phase 2: CMS Admin Studio Experience

1. **Admin Authentication & Dashboard** (`http://localhost:3000/login` → `/admin`):
   - [ ] Log in as `admin@contentflow.io` (Password: `Password123!`).
   - [ ] Verify the **Analytics Overview**: Total Posts, Published Articles, Total Views, Comments Count.
   - [ ] Verify the **Recent Articles Table** with status badges (`PUBLISHED`, `DRAFT`, `SCHEDULED`).
   - [ ] Verify the **Quick Action Buttons** (New Post, Media Upload, Moderation).

2. **Creating a New Article with Tiptap** (`http://localhost:3000/admin/posts/create`):
   - [ ] Navigate to **Posts → Create Post**.
   - [ ] Enter a title (e.g., `Building Scalable APIs with TypeScript and Drizzle`).
   - [ ] Notice the **automatic slug generation** from the title.
   - [ ] Use the **Tiptap WYSIWYG Editor**:
     - Format headings (H1, H2, H3).
     - Add bold, italic, and underline text.
     - Add a code block with syntax highlighting.
     - Insert a table or blockquote.
     - Insert an image.
   - [ ] Note the real-time **Word Count** and estimated **Reading Time** counter.
   - [ ] Select an **Author**, **Category**, and attach **Tags**.
   - [ ] Click **Save as Draft** or **Publish Article**.

3. **Article Editing & Live Preview** (`http://localhost:3000/admin/posts/[id]/edit`):
   - [ ] Edit an existing post.
   - [ ] Test the **Debounced Auto-Save** (type text and watch the auto-save indicator).
   - [ ] Click **Open Draft Preview** to verify unpublished changes in preview mode.
   - [ ] Change post status between `DRAFT`, `IN_REVIEW`, `SCHEDULED`, and `PUBLISHED`.

4. **Media Assets Library** (`http://localhost:3000/admin/media`):
   - [ ] Navigate to **Media Library**.
   - [ ] Upload an image file from your computer using the **Upload Asset** button.
   - [ ] Verify the uploaded image appears in the grid with file size and dimension metadata.
   - [ ] Click the **Copy URL** button to copy its asset URL to your clipboard.
   - [ ] Test media search filter and asset deletion.

5. **Taxonomy Management**:
   - [ ] **Categories** (`/admin/categories`): Create a new category, verify auto-slug, and check the post counter.
   - [ ] **Tags** (`/admin/tags`): Create tags, see the tag cloud with usage counts, and delete unused tags.

6. **Authors & Contributors** (`http://localhost:3000/admin/authors`):
   - [ ] View list of writers and contributors.
   - [ ] Create or update an author profile with bio, avatar URL, and Twitter/GitHub links.

7. **Comments Moderation Queue** (`http://localhost:3000/admin/comments`):
   - [ ] Filter comments by tabs: `ALL`, `PENDING`, `APPROVED`, `REJECTED`, `SPAM`.
   - [ ] Click **Approve** on a pending comment and verify it reflects on the public post.
   - [ ] Test **Reject**, **Mark Spam**, and **Delete Permanently**.

8. **Global Site Settings** (`http://localhost:3000/admin/settings`):
   - [ ] Update the Site Title or Description.
   - [ ] Toggle **Enable Reader Comments** or **Require Comment Moderation**.
   - [ ] Save changes and verify settings persist.

---

### 🌐 Phase 3: REST API & Headless Consumption Testing

Test the REST endpoints directly in your browser or with tools like `curl` / Postman:

| Endpoint | Method | Expected Output |
| :--- | :--- | :--- |
| `http://localhost:3000/api/v1/posts` | `GET` | Paginated JSON list of published articles with author, category, tags |
| `http://localhost:3000/api/v1/categories` | `GET` | List of categories with article counts |
| `http://localhost:3000/api/v1/tags` | `GET` | List of tags with article counts |
| `http://localhost:3000/api/v1/authors` | `GET` | List of registered authors and bios |
| `http://localhost:3000/api/v1/search?q=nextjs` | `GET` | Search results for query `nextjs` |
| `http://localhost:3000/api/v1/openapi` | `GET` | Complete **OpenAPI v3.0 JSON specification** |
| `http://localhost:3000/api/cron/schedule` | `GET` | Automated publishing check for scheduled posts |

---

### 🔍 Phase 4: SEO, RSS & Sitemap Verification

- [ ] **XML Sitemap**: Open `http://localhost:3000/sitemap.xml` — verify XML format with all posts, categories, tags, and authors with `<lastmod>` and `<priority>`.
- [ ] **RSS 2.0 Feed**: Open `http://localhost:3000/rss.xml` — verify valid RSS channel with `<item>` elements for recent articles.
- [ ] **Robots.txt**: Open `http://localhost:3000/robots.txt` — verify `Disallow: /admin` and `Sitemap: .../sitemap.xml`.
- [ ] **OpenGraph / JSON-LD**: Inspect page source on any blog article and verify `<script type="application/ld+json">` contains `BlogPosting` and `BreadcrumbList`.

---

### 🐳 Phase 5: Docker Containerization Testing

If Docker Desktop is installed:
```powershell
# Build and run entire multi-container stack (App + PostgreSQL + Redis):
docker-compose up --build
```

---

## 📋 Summary of Verified Platform Status

- **Database**: 18 Relational tables synced on Neon PostgreSQL.
- **Seeded Data**: 5 Authors, 8 Categories, 25 Tags, 40 Original technical articles, 100 Comments, 105 Media assets.
- **Test Suite**: Vitest 15/15 tests passing.
- **Production Build**: 30/30 Next.js routes compiled and prerendered with 0 errors.
