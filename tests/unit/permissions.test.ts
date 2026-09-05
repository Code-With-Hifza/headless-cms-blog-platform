import { describe, it, expect } from "vitest";
import { hasPermission, canModifyPost, ROLE_PERMISSIONS } from "@/lib/permissions";

describe("RBAC Permissions Unit Tests", () => {
  it("verifies ADMIN has all system permissions", () => {
    expect(hasPermission(["ADMIN"], "post:create")).toBe(true);
    expect(hasPermission(["ADMIN"], "post:publish")).toBe(true);
    expect(hasPermission(["ADMIN"], "user:delete")).toBe(true);
    expect(hasPermission(["ADMIN"], "settings:manage")).toBe(true);
  });

  it("verifies EDITOR has publication permissions but not user deletion", () => {
    expect(hasPermission(["EDITOR"], "post:publish")).toBe(true);
    expect(hasPermission(["EDITOR"], "comment:moderate")).toBe(true);
    expect(hasPermission(["EDITOR"], "user:delete")).toBe(false);
  });

  it("verifies AUTHOR can create posts but cannot publish directly without permission", () => {
    expect(hasPermission(["AUTHOR"], "post:create")).toBe(true);
    expect(hasPermission(["AUTHOR"], "post:publish")).toBe(false);
    expect(hasPermission(["AUTHOR"], "settings:manage")).toBe(false);
  });

  it("verifies USER can only create comments", () => {
    expect(hasPermission(["USER"], "comment:create")).toBe(true);
    expect(hasPermission(["USER"], "post:create")).toBe(false);
    expect(hasPermission(["USER"], "comment:moderate")).toBe(false);
  });

  describe("canModifyPost", () => {
    it("allows ADMIN and EDITOR to modify any post", () => {
      expect(canModifyPost(["ADMIN"], "user-1", "user-2")).toBe(true);
      expect(canModifyPost(["EDITOR"], "user-1", "user-2")).toBe(true);
    });

    it("allows AUTHOR to modify only their own post", () => {
      expect(canModifyPost(["AUTHOR"], "user-author", "user-author")).toBe(true);
      expect(canModifyPost(["AUTHOR"], "user-author-1", "user-author-2")).toBe(false);
    });
  });
});
