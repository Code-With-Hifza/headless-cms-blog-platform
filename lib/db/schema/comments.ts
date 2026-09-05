import {
  pgTable,
  text,
  timestamp,
  varchar,
  uuid,
  index,
} from "drizzle-orm/pg-core";
import { commentStatusEnum } from "./enums";
import { users } from "./users";
import { posts } from "./posts";

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
    parentId: uuid("parent_id"), // Self-referencing for threaded replies
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

