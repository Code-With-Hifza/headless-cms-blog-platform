import { describe, it, expect } from "vitest";
import {
  createPostSchema,
  createCategorySchema,
  registerSchema,
  subscribeNewsletterSchema,
} from "@/lib/validation";

describe("Validation Schemas Integration Tests", () => {
  it("validates valid post payload", () => {
    const validPost = {
      title: "Building High-Speed Edge Publishing",
      slug: "building-high-speed-edge-publishing",
      excerpt: "Deep dive into edge platforms.",
      content: "<p>Article text here</p>",
      authorId: "123e4567-e89b-12d3-a456-426614174000",
      status: "DRAFT",
    };

    const result = createPostSchema.safeParse(validPost);
    expect(result.success).toBe(true);
  });

  it("rejects post with invalid slug format", () => {
    const invalidPost = {
      title: "Test",
      slug: "INVALID SLUG WITH SPACES!",
      authorId: "123e4567-e89b-12d3-a456-426614174000",
    };

    const result = createPostSchema.safeParse(invalidPost);
    expect(result.success).toBe(false);
  });

  it("validates newsletter email schema", () => {
    expect(subscribeNewsletterSchema.safeParse({ email: "reader@domain.com" }).success).toBe(true);
    expect(subscribeNewsletterSchema.safeParse({ email: "invalid-email-string" }).success).toBe(false);
  });

  it("validates user registration schema", () => {
    expect(
      registerSchema.safeParse({
        name: "Eleanor Vance",
        email: "eleanor@example.com",
        password: "SuperSecretPassword123!",
      }).success
    ).toBe(true);

    expect(
      registerSchema.safeParse({
        name: "E",
        email: "not-an-email",
        password: "short",
      }).success
    ).toBe(false);
  });
});
