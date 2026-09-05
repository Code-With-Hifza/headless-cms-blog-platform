import {
  pgTable,
  timestamp,
  varchar,
  uuid,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { subscriberStatusEnum } from "./enums";

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
