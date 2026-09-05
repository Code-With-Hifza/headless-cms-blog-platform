import { z } from "zod";

// -------------------------------------------------------------
// Auth Schemas
// -------------------------------------------------------------
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const passwordResetRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const passwordResetConfirmSchema = z.object({
  token: z.string().min(1, "Token is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters").max(100),
});

// -------------------------------------------------------------
// Post Schemas
// -------------------------------------------------------------
export const postStatusSchema = z.enum([
  "DRAFT",
  "IN_REVIEW",
  "SCHEDULED",
  "PUBLISHED",
  "ARCHIVED",
]);

export const createPostSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(500),
  slug: z.string().min(2).max(500).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase letters, numbers, and hyphens"),
  excerpt: z.string().max(1000).optional().nullable(),
  content: z.string().default(""),
  featuredImageId: z.string().uuid().optional().nullable(),
  authorId: z.string().uuid("Author is required"),
  categoryId: z.string().uuid().optional().nullable(),
  tagIds: z.array(z.string().uuid()).optional().default([]),
  status: postStatusSchema.default("DRAFT"),
  publishedAt: z.string().datetime().optional().nullable(),
  scheduledAt: z.string().datetime().optional().nullable(),
  seoTitle: z.string().max(255).optional().nullable(),
  seoDescription: z.string().max(500).optional().nullable(),
  canonicalUrl: z.string().url().optional().nullable().or(z.literal("")),
  ogImageId: z.string().uuid().optional().nullable(),
  isFeatured: z.boolean().default(false),
});

export const updatePostSchema = createPostSchema.partial();

export const autoSavePostSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(500).optional(),
  content: z.string().optional(),
  excerpt: z.string().optional().nullable(),
});

// -------------------------------------------------------------
// Category Schemas
// -------------------------------------------------------------
export const createCategorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(255),
  slug: z.string().min(2).max(255).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format"),
  description: z.string().max(1000).optional().nullable(),
  image: z.string().url().optional().nullable().or(z.literal("")),
  seoTitle: z.string().max(255).optional().nullable(),
  seoDescription: z.string().max(500).optional().nullable(),
});

export const updateCategorySchema = createCategorySchema.partial();

// -------------------------------------------------------------
// Tag Schemas
// -------------------------------------------------------------
export const createTagSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(255),
  slug: z.string().min(2).max(255).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format"),
  description: z.string().max(500).optional().nullable(),
});

export const updateTagSchema = createTagSchema.partial();

// -------------------------------------------------------------
// Author Schemas
// -------------------------------------------------------------
export const createAuthorSchema = z.object({
  userId: z.string().uuid().optional().nullable(),
  displayName: z.string().min(2).max(255),
  slug: z.string().min(2).max(255).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  bio: z.string().max(2000).optional().nullable(),
  avatarUrl: z.string().url().optional().nullable().or(z.literal("")),
  websiteUrl: z.string().url().optional().nullable().or(z.literal("")),
  twitterUrl: z.string().url().optional().nullable().or(z.literal("")),
  linkedinUrl: z.string().url().optional().nullable().or(z.literal("")),
  githubUrl: z.string().url().optional().nullable().or(z.literal("")),
});

export const updateAuthorSchema = createAuthorSchema.partial();

// -------------------------------------------------------------
// Comment Schemas
// -------------------------------------------------------------
export const createCommentSchema = z.object({
  postId: z.string().uuid(),
  authorName: z.string().min(2, "Name is required").max(255),
  authorEmail: z.string().email("Valid email required"),
  content: z.string().min(3, "Comment must be at least 3 characters").max(2000),
  parentId: z.string().uuid().optional().nullable(),
});

export const updateCommentStatusSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "SPAM"]),
});

// -------------------------------------------------------------
// Newsletter & Contact Schemas
// -------------------------------------------------------------
export const subscribeNewsletterSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const contactFormSchema = z.object({
  name: z.string().min(2, "Name is required").max(100),
  email: z.string().email("Valid email is required"),
  subject: z.string().min(3, "Subject is required").max(200),
  message: z.string().min(10, "Message must be at least 10 characters").max(3000),
});

// -------------------------------------------------------------
// Query & Pagination Schemas
// -------------------------------------------------------------
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  category: z.string().optional(),
  tag: z.string().optional(),
  author: z.string().optional(),
  status: postStatusSchema.optional(),
  sort: z.enum(["latest", "oldest", "popular", "title"]).default("latest"),
});

export const siteSettingsSchema = z.object({
  siteName: z.string().min(2).max(255),
  siteDescription: z.string().min(5).max(1000),
  logoUrl: z.string().optional().nullable(),
  faviconUrl: z.string().optional().nullable(),
  allowComments: z.boolean().default(true),
  requireCommentModeration: z.boolean().default(true),
  allowRegistration: z.boolean().default(true),
  defaultRole: z.enum(["ADMIN", "EDITOR", "AUTHOR", "USER"]).default("USER"),
});
