// src/middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken, TOKEN_NAME } from "./lib/auth-edge";

const protectedPaths = ["/restaurant-admin", "/admin/analytics"];
const authPaths = ["/login", "/admin/login"];

export async function middleware(request: NextRequest) {
  // ← NOW ASYNC
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(TOKEN_NAME)?.value;

  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path));

  const user = token ? await verifyToken(token) : null; // ← NOW ASYNC

  if (isProtectedPath && !user) {
    console.log("❌ Middleware - Redirecting to login");
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

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

  console.log("✅ Middleware - Allowing access");
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
    "/api/:path*",
  ],
};
