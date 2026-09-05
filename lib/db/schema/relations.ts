import { relations } from "drizzle-orm";
import { users, roles, userRoles } from "./users";
import { authors } from "./authors";
import { categories, tags } from "./taxonomy";
import { media } from "./media";
import { posts, postTags, postViews } from "./posts";
import { comments } from "./comments";
import { auditLogs } from "./settings";

// -------------------------------------------------------------
// Users & Roles Relations
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

// -------------------------------------------------------------
// Authors Relations
// -------------------------------------------------------------
export const authorsRelations = relations(authors, ({ one, many }) => ({
  user: one(users, {
    fields: [authors.userId],
    references: [users.id],
  }),
  posts: many(posts),
}));

// -------------------------------------------------------------
// Taxonomy Relations
// -------------------------------------------------------------
export const categoriesRelations = relations(categories, ({ many }) => ({
  posts: many(posts),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  postTags: many(postTags),
}));

// -------------------------------------------------------------
// Media Relations
// -------------------------------------------------------------
export const mediaRelations = relations(media, ({ one, many }) => ({
  uploader: one(users, {
    fields: [media.uploaderId],
    references: [users.id],
  }),
  featuredPosts: many(posts, { relationName: "featuredImage" }),
  ogPosts: many(posts, { relationName: "ogImage" }),
}));

// -------------------------------------------------------------
// Posts Relations
// -------------------------------------------------------------
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

// -------------------------------------------------------------
// Comments Relations
// -------------------------------------------------------------
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
