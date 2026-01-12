// src/middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken, TOKEN_NAME } from "./libddd/auth-edge"; // ✅ Import from auth-edge

// Paths that require authentication
const protectedPaths = ["/restaurant-admin", "/admin"];

// Public paths that should redirect if authenticated
const authPaths = ["/login", "/admin/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(TOKEN_NAME)?.value;

  // Check if path is protected
  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path));

  // Verify token (NO PRISMA - just JWT verification)
  const user = token ? verifyToken(token) : null;

  // Redirect to login if accessing protected path without auth
  if (isProtectedPath && !user) {
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect to dashboard if accessing auth pages while authenticated
  if (isAuthPath && user) {
    if (user.role === "SUPER_ADMIN" || user.role === "MANAGER") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    if (user.role === "OWNER") {
      return NextResponse.redirect(
        new URL("/restaurant-admin/dashboard", request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/restaurant-admin/:path*",
    "/login",
    "/admin/login",
  ],
};
