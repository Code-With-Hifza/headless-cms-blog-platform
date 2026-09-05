import { NextResponse } from "next/server";

export async function GET() {
  const openApiSpec = {
    openapi: "3.0.0",
    info: {
      title: "ContentFlow Headless CMS & Publishing API",
      version: "1.0.0",
      description: "Complete REST API for ContentFlow Headless CMS, Posts, Media, Categories, Tags, Authors, Comments, and Search.",
    },
    servers: [
      {
        url: "/api/v1",
        description: "Current Server",
      },
    ],
    paths: {
      "/posts": {
        get: {
          summary: "List all posts",
          parameters: [
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
            { name: "search", in: "query", schema: { type: "string" } },
            { name: "category", in: "query", schema: { type: "string" } },
            { name: "tag", in: "query", schema: { type: "string" } },
            { name: "status", in: "query", schema: { type: "string", enum: ["DRAFT", "IN_REVIEW", "SCHEDULED", "PUBLISHED", "ARCHIVED"] } },
            { name: "sort", in: "query", schema: { type: "string", enum: ["latest", "oldest", "popular", "title"] } },
          ],
          responses: {
            "200": { description: "Paginated list of posts" },
          },
        },
        post: {
          summary: "Create a new post",
          security: [{ BearerAuth: [] }],
          responses: {
            "201": { description: "Post created successfully" },
            "401": { description: "Unauthorized" },
            "403": { description: "Forbidden" },
          },
        },
      },
      "/posts/{id}": {
        get: { summary: "Get post by ID" },
        patch: { summary: "Update post by ID" },
        delete: { summary: "Delete post by ID" },
      },
      "/posts/{id}/publish": {
        post: { summary: "Publish a post" },
      },
      "/posts/{id}/archive": {
        post: { summary: "Archive a post" },
      },
      "/categories": {
        get: { summary: "List categories" },
        post: { summary: "Create category" },
      },
      "/tags": {
        get: { summary: "List tags" },
        post: { summary: "Create tag" },
      },
      "/authors": {
        get: { summary: "List authors" },
        post: { summary: "Create author" },
      },
      "/media": {
        get: { summary: "List media assets" },
        post: { summary: "Upload media file (multipart/form-data)" },
      },
      "/comments": {
        get: { summary: "List comments" },
        post: { summary: "Post a comment" },
      },
      "/search": {
        get: {
          summary: "Full-text search across posts, categories, tags, authors",
          parameters: [{ name: "q", in: "query", required: true, schema: { type: "string" } }],
        },
      },
      "/newsletter/subscribe": {
        post: { summary: "Subscribe to newsletter" },
      },
      "/analytics": {
        get: { summary: "Get dashboard analytics overview" },
      },
    },
  };

  return NextResponse.json(openApiSpec);
}
