// src/app/api/auth/logout/route.ts

import { removeAuthCookie } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function POST() {
  try {
    await removeAuthCookie();
    return successResponse({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return errorResponse("Internal server error", 500);
  }
}
