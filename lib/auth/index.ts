import { auth } from "./auth";
import { headers } from "next/headers";
import type { Role } from "@/lib/permissions";

export { handlers, auth, signIn, signOut } from "./auth";

/**
 * Helper to get current authenticated user on server with their roles
 */
export async function getCurrentUser() {
  try {
    const session = await auth();
    return session?.user || null;
  } catch (err) {
    return null;
  }
}

/**
 * Require authentication or throw unauthorized error
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user || !user.id) {
    throw new Error("Unauthorized: You must be logged in");
  }
  return user;
}

/**
 * Require specific role(s)
 */
export async function requireRoles(allowedRoles: Role[]) {
  const user = await requireAuth();
  const userRoles = (user.roles as Role[]) || [];
  const hasRequiredRole = userRoles.some((r) => allowedRoles.includes(r));
  if (!hasRequiredRole) {
    throw new Error(`Forbidden: Requires one of [${allowedRoles.join(", ")}] roles`);
  }
  return user;
}
