import {
  pgTable,
  text,
  timestamp,
  varchar,
  integer,
  boolean,
  uuid,
  primaryKey,
  jsonb,
  index,
  uniqueIndex,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// -------------------------------------------------------------
// Enums
// -------------------------------------------------------------
export const postStatusEnum = pgEnum("post_status", [
  "DRAFT",
  "IN_REVIEW",
  "SCHEDULED",
  "PUBLISHED",
  "ARCHIVED",
]);

export const commentStatusEnum = pgEnum("comment_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "SPAM",
]);

export const subscriberStatusEnum = pgEnum("subscriber_status", [
  "SUBSCRIBED",
  "UNSUBSCRIBED",
]);

// -------------------------------------------------------------
// Roles
// -------------------------------------------------------------
export const roles = pgTable("roles", {
  id: varchar("id", { length: 50 }).primaryKey(), // ADMIN, EDITOR, AUTHOR, USER
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// -------------------------------------------------------------
// Users
// -------------------------------------------------------------
export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }),
    email: varchar("email", { length: 255 }).notNull().unique(),
    emailVerified: timestamp("email_verified", { withTimezone: true }),
    passwordHash: text("password_hash"),
    image: text("image"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("users_email_idx").on(table.email),
  ]
);

// -------------------------------------------------------------
// User Roles (Many-to-Many)
// -------------------------------------------------------------
export const userRoles = pgTable(
  "user_roles",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    roleId: varchar("role_id", { length: 50 })
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    assignedAt: timestamp("assigned_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.roleId] }),
  ]
);

// -------------------------------------------------------------
// NextAuth / Auth.js Tables
// -------------------------------------------------------------
export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 255 }).notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("provider_account_id", { length: 255 }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (table) => [
    primaryKey({ columns: [table.provider, table.providerAccountId] }),
    index("accounts_user_id_idx").on(table.userId),
  ]
);

export const sessions = pgTable(
  "sessions",
  {
    sessionToken: varchar("session_token", { length: 255 }).primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { withTimezone: true }).notNull(),
  },
  (table) => [
    index("sessions_user_id_idx").on(table.userId),
  ]
);

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", { withTimezone: true }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.identifier, table.token] }),
  ]
);

export const passwordResetTokens = pgTable(
  "password_reset_tokens",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("reset_tokens_email_idx").on(table.email),
    uniqueIndex("reset_tokens_token_idx").on(table.token),
  ]
);

// -------------------------------------------------------------
// Authors
// -------------------------------------------------------------
export const authors = pgTable(
  "authors",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "set null" }),
    displayName: varchar("display_name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    bio: text("bio"),
    avatarUrl: text("avatar_url"),
    websiteUrl: text("website_url"),
    twitterUrl: text("twitter_url"),
    linkedinUrl: text("linkedin_url"),
    githubUrl: text("github_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("authors_slug_idx").on(table.slug),
    index("authors_user_id_idx").on(table.userId),
  ]
);

// -------------------------------------------------------------
// Categories
// -------------------------------------------------------------
export const categories = pgTable(
  "categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: text("description"),
    image: text("image"),
    seoTitle: varchar("seo_title", { length: 255 }),
    seoDescription: text("seo_description"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("categories_slug_idx").on(table.slug),
  ]
);

// -------------------------------------------------------------
// Tags
// -------------------------------------------------------------
export const tags = pgTable(
  "tags",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("tags_slug_idx").on(table.slug),
  ]
);

// -------------------------------------------------------------
// Media Library
// -------------------------------------------------------------
export const media = pgTable(
  "media",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    fileName: varchar("file_name", { length: 255 }).notNull(),
    fileUrl: text("file_url").notNull(),
    fileType: varchar("file_type", { length: 50 }).notNull(), // 'image', 'video', 'document'
    mimeType: varchar("mime_type", { length: 100 }).notNull(),
    fileSize: integer("file_size").notNull(), // bytes
    width: integer("width"),
    height: integer("height"),
    altText: varchar("alt_text", { length: 255 }),
    caption: text("caption"),
    uploaderId: uuid("uploader_id").references(() => users.id, { onDelete: "set null" }),
    provider: varchar("provider", { length: 50 }).default("local").notNull(), // 'local', 'cloudinary', 's3'
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("media_uploader_idx").on(table.uploaderId),
    index("media_created_at_idx").on(table.createdAt),
  ]
);

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
    content: text("content").notNull().default(""), // Stored as rich HTML / sanitized markdown
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
// Comments
// -------------------------------------------------------------
export const comments = pgTable(
  "comments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    authorName: varchar("author_name", { length: 255 }).notNull(),
    authorEmail: varchar("author_email", { length: 255 }).notNull(),
    content: text("content").notNull(),
    status: commentStatusEnum("status").default("PENDING").notNull(),
    parentId: uuid("parent_id"), // Self-referencing for threaded comments
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("comments_post_id_idx").on(table.postId),
    index("comments_user_id_idx").on(table.userId),
    index("comments_status_idx").on(table.status),
    index("comments_created_at_idx").on(table.createdAt),
  ]
);

// -------------------------------------------------------------
// Newsletter Subscribers
// -------------------------------------------------------------
export const newsletterSubscribers = pgTable(
  "newsletter_subscribers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    status: subscriberStatusEnum("status").default("SUBSCRIBED").notNull(),
    token: varchar("token", { length: 255 }).notNull().unique(), // For one-click unsubscribe
    subscribedAt: timestamp("subscribed_at", { withTimezone: true }).defaultNow().notNull(),
    unsubscribedAt: timestamp("unsubscribed_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("subscribers_email_idx").on(table.email),
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

// -------------------------------------------------------------
// Audit Logs
// -------------------------------------------------------------
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    action: varchar("action", { length: 100 }).notNull(), // 'POST_CREATE', 'POST_PUBLISH', etc.
    entity: varchar("entity", { length: 100 }).notNull(), // 'post', 'category', 'user'
    entityId: varchar("entity_id", { length: 255 }),
    details: jsonb("details"),
    ipAddress: varchar("ip_address", { length: 100 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("audit_logs_user_id_idx").on(table.userId),
    index("audit_logs_entity_idx").on(table.entity),
    index("audit_logs_created_at_idx").on(table.createdAt),
  ]
);

// -------------------------------------------------------------
// Site Settings
// -------------------------------------------------------------
export const siteSettings = pgTable("site_settings", {
  id: varchar("id", { length: 50 }).primaryKey().default("default"),
  siteName: varchar("site_name", { length: 255 }).default("ContentFlow").notNull(),
  siteDescription: text("site_description").default(
    "A next-generation publishing platform and headless CMS."
  ).notNull(),
  logoUrl: text("logo_url"),
  faviconUrl: text("favicon_url"),
  socialLinks: jsonb("social_links").default({
    twitter: "https://twitter.com",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
  }),
  allowComments: boolean("allow_comments").default(true).notNull(),
  requireCommentModeration: boolean("require_comment_moderation").default(true).notNull(),
  allowRegistration: boolean("allow_registration").default(true).notNull(),
  defaultRole: varchar("default_role", { length: 50 }).default("USER").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// -------------------------------------------------------------
// Drizzle Relations
// -------------------------------------------------------------
export const usersRelations = relations(users, ({ many, one }) => ({
  userRoles: many(userRoles),
  author: one(authors, {
    fields: [users.id],
    references: [authors.userId],
  }),
  uploadedMedia: many(media),
  comments: many(comments),
  auditLogs: many(auditLogs),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  userRoles: many(userRoles),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id],
  }),
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id],
  }),
}));

export const authorsRelations = relations(authors, ({ one, many }) => ({
  user: one(users, {
    fields: [authors.userId],
    references: [users.id],
  }),
  posts: many(posts),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  posts: many(posts),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  postTags: many(postTags),
}));

export const mediaRelations = relations(media, ({ one, many }) => ({
  uploader: one(users, {
    fields: [media.uploaderId],
    references: [users.id],
  }),
  featuredPosts: many(posts, { relationName: "featuredImage" }),
  ogPosts: many(posts, { relationName: "ogImage" }),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(authors, {
    fields: [posts.authorId],
    references: [authors.id],
  }),
  category: one(categories, {
    fields: [posts.categoryId],
    references: [categories.id],
  }),
  featuredImage: one(media, {
    fields: [posts.featuredImageId],
    references: [media.id],
    relationName: "featuredImage",
  }),
  ogImage: one(media, {
    fields: [posts.ogImageId],
    references: [media.id],
    relationName: "ogImage",
  }),
  postTags: many(postTags),
  comments: many(comments),
  views: many(postViews),
}));

export const postTagsRelations = relations(postTags, ({ one }) => ({
  post: one(posts, {
    fields: [postTags.postId],
    references: [posts.id],
  }),
  tag: one(tags, {
    fields: [postTags.tagId],
    references: [tags.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
    relationName: "commentReplies",
  }),
  replies: many(comments, { relationName: "commentReplies" }),
}));
