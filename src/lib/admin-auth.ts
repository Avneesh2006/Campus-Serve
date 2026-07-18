import { auth } from "@/lib/auth";
import { isAdminOrAbove } from "@/lib/roles";

/**
 * Verifies the current session belongs to a SUB_ADMIN, ADMIN, or SUPER_ADMIN
 * user. Returns the session on success, or null if unauthenticated/
 * unauthorized — callers decide the appropriate response (redirect for
 * pages, 401/403 for APIs).
 */
export async function requireAdminSession() {
  const session = await auth();
  if (!session?.user?.id || !isAdminOrAbove(session.user.role)) {
    return null;
  }
  return session;
}
