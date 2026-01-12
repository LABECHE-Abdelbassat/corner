// lib/auth-edge.ts

import { SignJWT, jwtVerify } from "jose";
import { JWT_SECRET, TOKEN_NAME } from "./config";

export interface TokenPayload {
  userId: string;
  username: string;
  role: "SUPER_ADMIN" | "MANAGER" | "OWNER";
  restaurantId?: string;
  wilayaId?: string;
}

// Convert string secret to Uint8Array for jose
const secretKey = new TextEncoder().encode(JWT_SECRET);

export async function generateToken(payload: TokenPayload): Promise<string> {
  console.log("🔐 Generating token with jose...");

  const token = await new SignJWT(payload as any)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);

  console.log("✅ Token generated");
  return token;
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    console.log("🔍 Verifying token with jose...");

    const { payload } = await jwtVerify(token, secretKey);

    console.log("✅ Token verified for user:", payload.username);
    return payload as unknown as TokenPayload;
  } catch (error: any) {
    console.error("❌ Token verification failed:", error.message);
    return null;
  }
}

// Re-export
export { JWT_SECRET, TOKEN_NAME };
