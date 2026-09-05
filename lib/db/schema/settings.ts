import {
  pgTable,
  text,
  timestamp,
  varchar,
  boolean,
  uuid,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users";

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
