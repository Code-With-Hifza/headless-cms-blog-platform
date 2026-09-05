export type Role = "ADMIN" | "EDITOR" | "AUTHOR" | "USER";

export type Permission =
  | "post:create"
  | "post:update"
  | "post:update:any"
  | "post:delete"
  | "post:delete:any"
  | "post:publish"
  | "post:archive"
  | "category:create"
  | "category:update"
  | "category:delete"
  | "tag:create"
  | "tag:update"
  | "tag:delete"
  | "author:create"
  | "author:update"
  | "author:delete"
  | "media:upload"
  | "media:delete"
  | "comment:create"
  | "comment:moderate"
  | "comment:delete:own"
  | "user:read"
  | "user:update"
  | "user:delete"
  | "settings:manage"
  | "analytics:read";

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: [
    "post:create",
    "post:update",
    "post:update:any",
    "post:delete",
    "post:delete:any",
    "post:publish",
    "post:archive",
    "category:create",
    "category:update",
    "category:delete",
    "tag:create",
    "tag:update",
    "tag:delete",
    "author:create",
    "author:update",
    "author:delete",
    "media:upload",
    "media:delete",
    "comment:create",
    "comment:moderate",
    "comment:delete:own",
    "user:read",
    "user:update",
    "user:delete",
    "settings:manage",
    "analytics:read",
  ],
  EDITOR: [
    "post:create",
    "post:update",
    "post:update:any",
    "post:delete",
    "post:delete:any",
    "post:publish",
    "post:archive",
    "category:create",
    "category:update",
    "category:delete",
    "tag:create",
    "tag:update",
    "tag:delete",
    "author:create",
    "author:update",
    "media:upload",
    "media:delete",
    "comment:create",
    "comment:moderate",
    "comment:delete:own",
    "analytics:read",
  ],
  AUTHOR: [
    "post:create",
    "post:update",
    "post:delete",
    "media:upload",
    "comment:create",
    "comment:delete:own",
    "analytics:read",
  ],
  USER: [
    "comment:create",
    "comment:delete:own",
  ],
};

/**
 * Check if given roles have a specific permission
 */
export function hasPermission(userRoles: Role[] | undefined | null, permission: Permission): boolean {
  if (!userRoles || userRoles.length === 0) return false;
  return userRoles.some((role) => ROLE_PERMISSIONS[role]?.includes(permission));
}

/**
 * Check if user can modify a specific post (based on ownership or editor/admin permissions)
 */
export function canModifyPost(
  userRoles: Role[],
  userId: string,
  postAuthorUserId: string | null | undefined
): boolean {
  if (userRoles.includes("ADMIN") || userRoles.includes("EDITOR")) {
    return true;
  }
  if (userRoles.includes("AUTHOR") && postAuthorUserId === userId) {
    return true;
  }
  return false;
}
