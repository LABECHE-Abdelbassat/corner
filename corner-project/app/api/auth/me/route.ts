// src/app/api/auth/me/route.ts

import { getCurrentUser } from "@/lib/auth";
import {
  successResponse,
  unauthorizedResponse,
  errorResponse,
} from "@/lib/api-response";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return unauthorizedResponse();
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return successResponse({
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Get current user error:", error);
    return errorResponse("Internal server error", 500);
  }
}
