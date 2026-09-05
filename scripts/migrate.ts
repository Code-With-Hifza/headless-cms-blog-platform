import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

import { Pool } from "@neondatabase/serverless";

async function main() {
  console.log("Connecting to Neon database...");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  const statements = [
    // Create enums
    `DO $$ BEGIN
      CREATE TYPE "post_status" AS ENUM('DRAFT', 'IN_REVIEW', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`,

    `DO $$ BEGIN
      CREATE TYPE "comment_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'SPAM');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`,

    `DO $$ BEGIN
      CREATE TYPE "subscriber_status" AS ENUM('SUBSCRIBED', 'UNSUBSCRIBED');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`,

    // Create tables
    `CREATE TABLE IF NOT EXISTS "roles" (
      "id" varchar(50) PRIMARY KEY NOT NULL,
      "name" varchar(100) NOT NULL,
      "description" text,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL
    );`,

    `CREATE TABLE IF NOT EXISTS "users" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "name" varchar(255),
      "email" varchar(255) NOT NULL UNIQUE,
      "email_verified" timestamp with time zone,
      "password_hash" text,
      "image" text,
      "is_active" boolean DEFAULT true NOT NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL
    );`,

    `CREATE TABLE IF NOT EXISTS "user_roles" (
      "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
      "role_id" varchar(50) NOT NULL REFERENCES "roles"("id") ON DELETE cascade,
      "assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
      PRIMARY KEY("user_id","role_id")
    );`,

    `CREATE TABLE IF NOT EXISTS "accounts" (
      "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
      "type" varchar(255) NOT NULL,
      "provider" varchar(255) NOT NULL,
      "provider_account_id" varchar(255) NOT NULL,
      "refresh_token" text,
      "access_token" text,
      "expires_at" integer,
      "token_type" varchar(255),
      "scope" varchar(255),
      "id_token" text,
      "session_state" varchar(255),
      PRIMARY KEY("provider","provider_account_id")
    );`,

    `CREATE TABLE IF NOT EXISTS "sessions" (
      "session_token" varchar(255) PRIMARY KEY NOT NULL,
      "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
      "expires" timestamp with time zone NOT NULL
    );`,

    `CREATE TABLE IF NOT EXISTS "verification_tokens" (
      "identifier" varchar(255) NOT NULL,
      "token" varchar(255) NOT NULL,
      "expires" timestamp with time zone NOT NULL,
      PRIMARY KEY("identifier","token")
    );`,

    `CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "email" varchar(255) NOT NULL,
      "token" varchar(255) NOT NULL UNIQUE,
      "expires_at" timestamp with time zone NOT NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL
    );`,

    `CREATE TABLE IF NOT EXISTS "authors" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "user_id" uuid REFERENCES "users"("id") ON DELETE set null,
      "display_name" varchar(255) NOT NULL,
      "slug" varchar(255) NOT NULL UNIQUE,
      "bio" text,
      "avatar_url" text,
      "website_url" text,
      "twitter_url" text,
      "linkedin_url" text,
      "github_url" text,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL
    );`,

    `CREATE TABLE IF NOT EXISTS "categories" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "name" varchar(255) NOT NULL,
      "slug" varchar(255) NOT NULL UNIQUE,
      "description" text,
      "image" text,
      "seo_title" varchar(255),
      "seo_description" text,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL
    );`,

    `CREATE TABLE IF NOT EXISTS "tags" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "name" varchar(255) NOT NULL,
      "slug" varchar(255) NOT NULL UNIQUE,
      "description" text,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL
    );`,

    `CREATE TABLE IF NOT EXISTS "media" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "file_name" varchar(255) NOT NULL,
      "file_url" text NOT NULL,
      "file_type" varchar(50) NOT NULL,
      "mime_type" varchar(100) NOT NULL,
      "file_size" integer NOT NULL,
      "width" integer,
      "height" integer,
      "alt_text" varchar(255),
      "caption" text,
      "uploader_id" uuid REFERENCES "users"("id") ON DELETE set null,
      "provider" varchar(50) DEFAULT 'local' NOT NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL
    );`,

    `CREATE TABLE IF NOT EXISTS "posts" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "title" varchar(500) NOT NULL,
      "slug" varchar(500) NOT NULL UNIQUE,
      "excerpt" text,
      "content" text DEFAULT '' NOT NULL,
      "featured_image_id" uuid REFERENCES "media"("id") ON DELETE set null,
      "author_id" uuid NOT NULL REFERENCES "authors"("id") ON DELETE restrict,
      "category_id" uuid REFERENCES "categories"("id") ON DELETE set null,
      "status" "post_status" DEFAULT 'DRAFT' NOT NULL,
      "published_at" timestamp with time zone,
      "scheduled_at" timestamp with time zone,
      "seo_title" varchar(255),
      "seo_description" text,
      "canonical_url" text,
      "og_image_id" uuid REFERENCES "media"("id") ON DELETE set null,
      "reading_time" integer DEFAULT 1 NOT NULL,
      "word_count" integer DEFAULT 0 NOT NULL,
      "is_featured" boolean DEFAULT false NOT NULL,
      "views_count" integer DEFAULT 0 NOT NULL,
      "preview_token" varchar(100),
      "preview_expires_at" timestamp with time zone,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL
    );`,

    `CREATE TABLE IF NOT EXISTS "post_tags" (
      "post_id" uuid NOT NULL REFERENCES "posts"("id") ON DELETE cascade,
      "tag_id" uuid NOT NULL REFERENCES "tags"("id") ON DELETE cascade,
      PRIMARY KEY("post_id","tag_id")
    );`,

    `CREATE TABLE IF NOT EXISTS "comments" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "post_id" uuid NOT NULL REFERENCES "posts"("id") ON DELETE cascade,
      "user_id" uuid REFERENCES "users"("id") ON DELETE set null,
      "author_name" varchar(255) NOT NULL,
      "author_email" varchar(255) NOT NULL,
      "content" text NOT NULL,
      "status" "comment_status" DEFAULT 'PENDING' NOT NULL,
      "parent_id" uuid,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL
    );`,

    `CREATE TABLE IF NOT EXISTS "newsletter_subscribers" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "email" varchar(255) NOT NULL UNIQUE,
      "status" "subscriber_status" DEFAULT 'SUBSCRIBED' NOT NULL,
      "token" varchar(255) NOT NULL UNIQUE,
      "subscribed_at" timestamp with time zone DEFAULT now() NOT NULL,
      "unsubscribed_at" timestamp with time zone
    );`,

    `CREATE TABLE IF NOT EXISTS "post_views" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "post_id" uuid NOT NULL REFERENCES "posts"("id") ON DELETE cascade,
      "ip_hash" varchar(64),
      "user_agent" text,
      "referer" text,
      "viewed_at" timestamp with time zone DEFAULT now() NOT NULL
    );`,

    `CREATE TABLE IF NOT EXISTS "audit_logs" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "user_id" uuid REFERENCES "users"("id") ON DELETE set null,
      "action" varchar(100) NOT NULL,
      "entity" varchar(100) NOT NULL,
      "entity_id" varchar(255),
      "details" jsonb,
      "ip_address" varchar(100),
      "created_at" timestamp with time zone DEFAULT now() NOT NULL
    );`,

    `CREATE TABLE IF NOT EXISTS "site_settings" (
      "id" varchar(50) PRIMARY KEY DEFAULT 'default' NOT NULL,
      "site_name" varchar(255) DEFAULT 'ContentFlow' NOT NULL,
      "site_description" text DEFAULT 'A next-generation publishing platform and headless CMS.' NOT NULL,
      "logo_url" text,
      "favicon_url" text,
      "social_links" jsonb DEFAULT '{"twitter":"https://twitter.com","github":"https://github.com","linkedin":"https://linkedin.com"}'::jsonb,
      "allow_comments" boolean DEFAULT true NOT NULL,
      "require_comment_moderation" boolean DEFAULT true NOT NULL,
      "allow_registration" boolean DEFAULT true NOT NULL,
      "default_role" varchar(50) DEFAULT 'USER' NOT NULL,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL
    );`,

    // Create indexes
    `CREATE INDEX IF NOT EXISTS "posts_status_idx" ON "posts" ("status");`,
    `CREATE INDEX IF NOT EXISTS "posts_author_id_idx" ON "posts" ("author_id");`,
    `CREATE INDEX IF NOT EXISTS "posts_category_id_idx" ON "posts" ("category_id");`,
    `CREATE INDEX IF NOT EXISTS "posts_published_at_idx" ON "posts" ("published_at");`,
    `CREATE INDEX IF NOT EXISTS "posts_is_featured_idx" ON "posts" ("is_featured");`,
    `CREATE INDEX IF NOT EXISTS "comments_post_id_idx" ON "comments" ("post_id");`,
    `CREATE INDEX IF NOT EXISTS "comments_status_idx" ON "comments" ("status");`,
    `CREATE INDEX IF NOT EXISTS "post_views_post_id_idx" ON "post_views" ("post_id");`,
    `CREATE INDEX IF NOT EXISTS "post_views_viewed_at_idx" ON "post_views" ("viewed_at");`,
    `CREATE INDEX IF NOT EXISTS "audit_logs_user_id_idx" ON "audit_logs" ("user_id");`,
  ];

  for (const sql of statements) {
    await pool.query(sql);
  }

  console.log("Database schema successfully synchronized!");
  await pool.end();
}

main().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
