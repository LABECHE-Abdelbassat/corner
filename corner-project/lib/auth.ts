// lib/auth.ts

import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import prisma from "./prisma";
import {
  generateToken,
  verifyToken,
  TOKEN_NAME,
  TokenPayload,
} from "./auth-edge";

export { generateToken, verifyToken, TOKEN_NAME };
export type { TokenPayload };

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();

  cookieStore.set({
    name: TOKEN_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  console.log("🍪 Cookie set successfully");
}

export async function removeAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_NAME);
}

export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_NAME);
  return token?.value || null;
}

export async function getCurrentUser() {
  const token = await getAuthToken();

  if (!token) {
    console.log("❌ No token found in cookie");
    return null;
  }

  console.log("🎫 Token found, verifying...");
  const payload = await verifyToken(token); // ← NOW ASYNC

  if (!payload) {
    console.log("❌ Token verification failed");
    return null;
  }

  console.log("✅ Token valid, fetching user from DB.. .");

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: {
      restaurant: true,
      managedWilaya: true,
    },
  });

  if (!user || user.status !== "ACTIVE") {
    console.log("❌ User not found or inactive");
    return null;
  }

  console.log("✅ User authenticated:", user.username);
  return user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function requireRole(
  allowedRoles: ("SUPER_ADMIN" | "MANAGER" | "OWNER")[]
) {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    throw new Error("Forbidden");
  }
  return user;
}

export async function requireSuperAdmin() {
  return requireRole(["SUPER_ADMIN"]);
}

export async function requireManager() {
  return requireRole(["SUPER_ADMIN", "MANAGER"]);
}

export async function requireOwner() {
  return requireRole(["SUPER_ADMIN", "OWNER"]);
}
