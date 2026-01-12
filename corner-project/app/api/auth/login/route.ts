// src/app/api/auth/login/route.ts

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword, generateToken, setAuthCookie } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
} from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten().fieldErrors);
    }

    const { username, password } = validation.data;
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        restaurant: true,
        managedWilaya: true,
      },
    });

    if (!user) {
      return errorResponse("Invalid username or password", 401);
    }

    if (user.status !== "ACTIVE") {
      return errorResponse("Account is inactive", 403);
    }

    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return errorResponse("Invalid username or password", 401);
    }

    // ✅ NOW ASYNC
    const token = await generateToken({
      userId: user.id,
      username: user.username,
      role: user.role,
      restaurantId: user.restaurantId || undefined,
      wilayaId: user.wilayaId || undefined,
    });

    console.log("🔑 Token generated");

    await setAuthCookie(token);

    const { password: _, ...userWithoutPassword } = user;

    return successResponse({
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    return errorResponse("Internal server error", 500);
  }
}
