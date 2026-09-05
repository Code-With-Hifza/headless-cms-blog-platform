import {
  pgTable,
  text,
  timestamp,
  varchar,
  uuid,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { users } from "./users";

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

