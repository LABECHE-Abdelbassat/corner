// src/app/api/admin/users/[id]/route.ts

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireSuperAdmin, getCurrentUser } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
} from "@/lib/api-response";
import { updateUserSchema } from "@/lib/validators";
import { validationErrorResponse } from "@/lib/api-response";

// DELETE /api/admin/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is super admin
    const currentUser = await requireSuperAdmin();

    const { id } = await params;

    // Find user to delete
    const userToDelete = await prisma.user.findUnique({
      where: { id },
      include: {
        restaurant: true,
        managedWilaya: true,
      },
    });

    if (!userToDelete) {
      return notFoundResponse("User not found");
    }

    // Prevent deleting yourself
    if (userToDelete.id === currentUser.id) {
      return errorResponse("You cannot delete your own account", 400);
    }

    // Prevent deleting the last super admin
    if (userToDelete.role === "SUPER_ADMIN") {
      const superAdminCount = await prisma.user.count({
        where: { role: "SUPER_ADMIN", status: "ACTIVE" },
      });

      if (superAdminCount <= 1) {
        return errorResponse("Cannot delete the last super admin", 400);
      }
    }

    // Delete user
    await prisma.user.delete({
      where: { id },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        type: "USER_DELETED",
        description: `User ${userToDelete.username} (${userToDelete.role}) deleted`,
        userId: currentUser.id,
      },
    });

    return successResponse({
      message: "User deleted successfully",
      deletedUser: {
        id: userToDelete.id,
        username: userToDelete.username,
        role: userToDelete.role,
      },
    });
  } catch (error: any) {
    console.error("❌ Delete user error:", error);

    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return errorResponse(error.message, 403);
    }

    return errorResponse("Internal server error", 500);
  }
}

// PUT /api/admin/users/[id] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is super admin
    const currentUser = await requireSuperAdmin();

    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validation = updateUserSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten().fieldErrors);
    }

    const data = validation.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return notFoundResponse("User not found");
    }

    // Check if username is taken (if changing)
    if (data.username && data.username !== user.username) {
      const existingUser = await prisma.user.findUnique({
        where: { username: data.username },
      });

      if (existingUser) {
        return errorResponse("Username already exists", 409);
      }
    }

    // Check if email is taken (if changing)
    if (data.email && data.email !== user.email) {
      const existingEmail = await prisma.user.findFirst({
        where: { email: data.email },
      });

      if (existingEmail) {
        return errorResponse("Email already exists", 409);
      }
    }

    // Validate role changes
    if (data.role) {
      // Prevent changing last super admin
      if (user.role === "SUPER_ADMIN" && data.role !== "SUPER_ADMIN") {
        const superAdminCount = await prisma.user.count({
          where: { role: "SUPER_ADMIN", status: "ACTIVE" },
        });

        if (superAdminCount <= 1) {
          return errorResponse(
            "Cannot change the role of the last super admin",
            400
          );
        }
      }

      // Validate role-specific assignments
      if (data.role === "OWNER" && !data.restaurantId && !user.restaurantId) {
        return errorResponse(
          "Restaurant owners must be assigned to a restaurant",
          400
        );
      }

      if (data.role === "MANAGER" && !data.wilayaId && !user.wilayaId) {
        return errorResponse("Managers must be assigned to a wilaya", 400);
      }
    }

    // Check restaurant availability
    if (data.restaurantId) {
      const restaurant = await prisma.restaurant.findUnique({
        where: { id: data.restaurantId },
        include: { owner: true },
      });

      if (!restaurant) {
        return errorResponse("Restaurant not found", 404);
      }

      if (restaurant.owner && restaurant.owner.id !== user.id) {
        return errorResponse("Restaurant already has an owner", 400);
      }
    }

    // Check wilaya availability
    if (data.wilayaId) {
      const wilaya = await prisma.wilaya.findUnique({
        where: { id: data.wilayaId },
        include: { manager: true },
      });

      if (!wilaya) {
        return errorResponse("Wilaya not found", 404);
      }

      if (wilaya.manager && wilaya.manager.id !== user.id) {
        return errorResponse("Wilaya already has a manager", 400);
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        username: data.username,
        email: data.email,
        role: data.role,
        status: data.status,
        restaurantId: data.restaurantId === null ? null : data.restaurantId,
        wilayaId: data.wilayaId === null ? null : data.wilayaId,
      },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        managedWilaya: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        type: "USER_UPDATED",
        description: `User ${updatedUser.username} updated`,
        userId: currentUser.id,
        metadata: {
          targetUserId: updatedUser.id,
        },
      },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = updatedUser;

    return successResponse({
      user: userWithoutPassword,
      message: "User updated successfully",
    });
  } catch (error: any) {
    console.error("❌ Update user error:", error);

    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return errorResponse(error.message, 403);
    }

    return errorResponse("Internal server error", 500);
  }
}
