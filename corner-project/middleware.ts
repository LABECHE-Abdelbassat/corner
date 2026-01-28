import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken, TOKEN_NAME } from "./lib/auth-edge";

const intlMiddleware = createIntlMiddleware(routing);

const LOCALES = routing.locales;

function getLocaleFromPath(pathname: string) {
  const seg = pathname.split("/")[1];
  return LOCALES.includes(seg as any) ? seg : null;
}

function stripLocale(pathname: string) {
  const locale = getLocaleFromPath(pathname);
  if (!locale) return pathname;
  const rest = pathname.slice(locale.length + 1); // remove "/en"
  return rest.length ? rest : "/";
}

const protectedPaths = ["/restaurant-admin", "/admin/analytics"];
const authPaths = ["/login", "/admin/login"];

export async function middleware(request: NextRequest) {
  // 1) Let next-intl add/validate locale (redirects "/" -> "/en", etc.)
  const intlResponse = intlMiddleware(request);

  // If next-intl is redirecting, return immediately
  if (intlResponse.headers.get("Location")) {
    return intlResponse;
  }

  // 2) Auth logic, but make it locale-aware
  const pathname = request.nextUrl.pathname;
  const locale = getLocaleFromPath(pathname) ?? routing.defaultLocale;
  const pathnameNoLocale = stripLocale(pathname);

  const isProtected = protectedPaths.some((p) =>
    pathnameNoLocale.startsWith(p)
  );
  const isAuth = authPaths.some((p) => pathnameNoLocale.startsWith(p));

  const token = request.cookies.get(TOKEN_NAME)?.value;
  const user = token ? await verifyToken(token) : null;

  if (isProtected && !user) {
    const target = pathnameNoLocale.startsWith("/admin")
      ? "/admin/login"
      : "/login";
    return NextResponse.redirect(new URL(`/${locale}${target}`, request.url));
  }

  if (isAuth && user) {
    let target = "/";
    if (user.role === "SUPER_ADMIN" || user.role === "MANAGER")
      target = "/admin/dashboard";
    else if (user.role === "OWNER") target = "/restaurant-admin/dashboard";
    return NextResponse.redirect(new URL(`/${locale}${target}`, request.url));
  }

  return intlResponse;
}

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
