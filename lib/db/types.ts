import type {
  users,
  roles,
  userRoles,
  accounts,
  sessions,
  verificationTokens,
  passwordResetTokens,
  authors,
  categories,
  tags,
  media,
  posts,
  postTags,
  postViews,
  comments,
  newsletterSubscribers,
  siteSettings,
  auditLogs,
  postStatusEnum,
  commentStatusEnum,
  subscriberStatusEnum,
} from "./schema";

// -------------------------------------------------------------
// Enum Types
// -------------------------------------------------------------
export type PostStatus = (typeof postStatusEnum.enumValues)[number];
export type CommentStatus = (typeof commentStatusEnum.enumValues)[number];
export type SubscriberStatus = (typeof subscriberStatusEnum.enumValues)[number];

// -------------------------------------------------------------
// Core Inferred Model Types (Select & Insert)
// -------------------------------------------------------------

// 1. Users & Auth
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;

export type UserRole = typeof userRoles.$inferSelect;
export type NewUserRole = typeof userRoles.$inferInsert;

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type VerificationToken = typeof verificationTokens.$inferSelect;
export type NewVerificationToken = typeof verificationTokens.$inferInsert;

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type NewPasswordResetToken = typeof passwordResetTokens.$inferInsert;

// 2. Authors
export type Author = typeof authors.$inferSelect;
export type NewAuthor = typeof authors.$inferInsert;

// 3. Taxonomy
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;

// 4. Media
export type Media = typeof media.$inferSelect;
export type NewMedia = typeof media.$inferInsert;

// 5. Posts & Analytics
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;

export type PostTag = typeof postTags.$inferSelect;
export type NewPostTag = typeof postTags.$inferInsert;

export type PostView = typeof postViews.$inferSelect;
export type NewPostView = typeof postViews.$inferInsert;

// 6. Comments
export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;

// 7. Subscribers
export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type NewNewsletterSubscriber = typeof newsletterSubscribers.$inferInsert;

// 8. Settings & Audit
export type SiteSetting = typeof siteSettings.$inferSelect;
export type NewSiteSetting = typeof siteSettings.$inferInsert;

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;

// -------------------------------------------------------------
// Composite & Extended Types (With Relations)
// -------------------------------------------------------------
export type PostWithRelations = Post & {
  author?: Author | null;
  category?: Category | null;
  featuredImage?: Media | null;
  ogImage?: Media | null;
  tags?: Tag[];
  commentsCount?: number;
};

export type CommentWithReplies = Comment & {
  user?: User | null;
  replies?: CommentWithReplies[];
};

export type UserWithRoles = User & {
  roles?: Role[];
  author?: Author | null;
};
