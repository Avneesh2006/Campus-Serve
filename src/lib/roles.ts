export type UserRole = "STUDENT" | "SUB_ADMIN" | "ADMIN" | "SUPER_ADMIN";

/** Rank order, low to high. Higher rank = more permissions. */
const ROLE_RANK: Record<UserRole, number> = {
  STUDENT: 0,
  SUB_ADMIN: 1,
  ADMIN: 2,
  SUPER_ADMIN: 3,
};

function rankOf(role?: string | null): number {
  return ROLE_RANK[(role as UserRole) ?? "STUDENT"] ?? 0;
}

/** True if `role` has at least the permissions of `minimum`. */
export function hasRoleAtLeast(role: string | null | undefined, minimum: UserRole): boolean {
  return rankOf(role) >= ROLE_RANK[minimum];
}

/** True for SUB_ADMIN, ADMIN, and SUPER_ADMIN — i.e. anyone with Admin Panel access. */
export function isAdminOrAbove(role?: string | null): boolean {
  return hasRoleAtLeast(role, "SUB_ADMIN");
}

/**
 * Permission matrix for admin-panel user-management actions.
 * - SUPER_ADMIN: can create/remove/promote/demote Admins, and create/remove Sub Admins.
 * - ADMIN: can create/remove Sub Admins only.
 * - SUB_ADMIN / STUDENT: no user-management permissions.
 */
export function canManageRole(actorRole: string | null | undefined, targetRole: UserRole): boolean {
  if (actorRole === "SUPER_ADMIN") {
    // Super Admin can manage everyone except other Super Admins.
    return targetRole !== "SUPER_ADMIN";
  }
  if (actorRole === "ADMIN") {
    // Admin can only manage Sub Admins.
    return targetRole === "SUB_ADMIN";
  }
  return false;
}

/** Roles an actor is allowed to assign to someone else. */
export function assignableRoles(actorRole: string | null | undefined): UserRole[] {
  if (actorRole === "SUPER_ADMIN") return ["STUDENT", "SUB_ADMIN", "ADMIN"];
  if (actorRole === "ADMIN") return ["STUDENT", "SUB_ADMIN"];
  return [];
}
