import { auth } from "@/lib/auth";

/**
 * Verifies the current session belongs to an ADMIN user. Returns the
 * session on success, or null if unauthenticated/unauthorized — callers
 * decide the appropriate response (redirect for pages, 401/403 for APIs).
 */
export async function requireAdminSession() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return null;
  }
  return session;
}
