import { pgEnum } from "drizzle-orm/pg-core";

// -------------------------------------------------------------
// Core Domain Enums
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
