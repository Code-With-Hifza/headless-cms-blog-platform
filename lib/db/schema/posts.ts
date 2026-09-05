import {
  pgTable,
  text,
  timestamp,
  varchar,
  integer,
  boolean,
  uuid,
  primaryKey,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { postStatusEnum } from "./enums";
import { authors } from "./authors";
import { categories, tags } from "./taxonomy";
import { media } from "./media";

// -------------------------------------------------------------
// Posts
// -------------------------------------------------------------
export const posts = pgTable(
  "posts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 500 }).notNull(),
    slug: varchar("slug", { length: 500 }).notNull().unique(),
    excerpt: text("excerpt"),
    content: text("content").notNull().default(""), // Rich HTML / sanitized markdown
    featuredImageId: uuid("featured_image_id").references(() => media.id, { onDelete: "set null" }),
    authorId: uuid("author_id").notNull().references(() => authors.id, { onDelete: "restrict" }),
    categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
    status: postStatusEnum("status").default("DRAFT").notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
    seoTitle: varchar("seo_title", { length: 255 }),
    seoDescription: text("seo_description"),
    canonicalUrl: text("canonical_url"),
    ogImageId: uuid("og_image_id").references(() => media.id, { onDelete: "set null" }),
    readingTime: integer("reading_time").default(1).notNull(), // Minutes
    wordCount: integer("word_count").default(0).notNull(),
    isFeatured: boolean("is_featured").default(false).notNull(),
    viewsCount: integer("views_count").default(0).notNull(),
    previewToken: varchar("preview_token", { length: 100 }),
    previewExpiresAt: timestamp("preview_expires_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("posts_slug_idx").on(table.slug),
    index("posts_status_idx").on(table.status),
    index("posts_author_id_idx").on(table.authorId),
    index("posts_category_id_idx").on(table.categoryId),
    index("posts_published_at_idx").on(table.publishedAt),
    index("posts_is_featured_idx").on(table.isFeatured),
    index("posts_created_at_idx").on(table.createdAt),
  ]
);

// -------------------------------------------------------------
// Post Tags (Many-to-Many)
// -------------------------------------------------------------
export const postTags = pgTable(
  "post_tags",
  {
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.postId, table.tagId] }),
    index("post_tags_post_id_idx").on(table.postId),
    index("post_tags_tag_id_idx").on(table.tagId),
  ]
);

// -------------------------------------------------------------
// Post Views & Analytics
// -------------------------------------------------------------
export const postViews = pgTable(
  "post_views",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    ipHash: varchar("ip_hash", { length: 64 }), // Privacy-conscious sha256
    userAgent: text("user_agent"),
    referer: text("referer"),
    viewedAt: timestamp("viewed_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("post_views_post_id_idx").on(table.postId),
    index("post_views_viewed_at_idx").on(table.viewedAt),
  ]
);


