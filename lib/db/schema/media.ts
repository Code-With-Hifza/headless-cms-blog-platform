import {
  pgTable,
  text,
  timestamp,
  varchar,
  integer,
  uuid,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users";

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

