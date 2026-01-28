// src/app/api/admin/users/[id]/reset-password/route.ts

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireSuperAdmin, hashPassword } from "@/lib/auth";
import { resetPasswordSchema } from "@/lib/validators";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  validationErrorResponse,
} from "@/lib/api-response";

// POST /api/admin/users/[id]/reset-password - Reset user password
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is super admin
    const currentUser = await requireSuperAdmin();

    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validation = resetPasswordSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten().fieldErrors);
    }

    const { newPassword } = validation.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return notFoundResponse("User not found");
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        type: "PASSWORD_RESET",
        description: `Password reset for user ${user.username}`,
        userId: currentUser.id,
        metadata: {
          targetUserId: user.id,
          targetUsername: user.username,
        },
      },
    });

    return successResponse({
      message: "Password reset successfully",
      user: {
        id: user.id,
        username: user.username,
      },
    });
  } catch (error: any) {
    console.error("❌ Reset password error:", error);

    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return errorResponse(error.message, 403);
    }

    return errorResponse("Internal server error", 500);
  }
}
