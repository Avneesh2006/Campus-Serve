import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdminOrAbove } from "@/lib/roles";

const authRoutes = ["/login", "/register", "/forgot-password"];
const protectedPrefixes = ["/dashboard"];
const adminPrefixes = ["/dashboard/admin"];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isAuthRoute = authRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );
  const isProtectedRoute = protectedPrefixes.some((prefix) =>
    nextUrl.pathname.startsWith(prefix)
  );
  const isAdminRoute = adminPrefixes.some((prefix) =>
    nextUrl.pathname.startsWith(prefix)
  );

  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute && isLoggedIn && !isAdminOrAbove(req.auth?.user?.role)) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
