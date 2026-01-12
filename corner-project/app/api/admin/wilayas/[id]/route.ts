// src/app/api/admin/wilayas/[id]/route.ts

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth";
import { updateWilayaSchema } from "@/lib/validators";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  validationErrorResponse,
} from "@/lib/api-response";

// ==================== GET /api/admin/wilayas/[id] ====================
// Get single wilaya details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is super admin
    await requireSuperAdmin();

    const { id } = await params;

    // Fetch wilaya with all related data
    const wilaya = await prisma.wilaya.findUnique({
      where: { id },
      include: {
        manager: {
          select: {
            id: true,
            username: true,
            email: true,
            status: true,
            createdAt: true,
          },
        },
        restaurants: {
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
            package: true,
            createdAt: true,
            owner: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
          orderBy: {
            name: "asc",
          },
        },
        _count: {
          select: {
            restaurants: true,
          },
        },
      },
    });

    if (!wilaya) {
      return notFoundResponse("Wilaya not found");
    }

    // Calculate statistics
    const stats = {
      totalRestaurants: wilaya._count.restaurants,
      activeRestaurants: wilaya.restaurants.filter((r) => r.status === "ACTIVE")
        .length,
      inactiveRestaurants: wilaya.restaurants.filter(
        (r) => r.status === "INACTIVE"
      ).length,
      hasManager: !!wilaya.manager,
    };

    return successResponse({
      wilaya: {
        ...wilaya,
        stats,
      },
    });
  } catch (error: any) {
    console.error("❌ Get wilaya error:", error);

    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return errorResponse(error.message, 403);
    }

    return errorResponse("Internal server error", 500);
  }
}

// ==================== PUT /api/admin/wilayas/[id] ====================
// Update wilaya
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
    const validation = updateWilayaSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten().fieldErrors);
    }

    const { name, code, lat, lng, gradient, managerId } = validation.data;

    // Find existing wilaya
    const existingWilaya = await prisma.wilaya.findUnique({
      where: { id },
      include: {
        manager: true,
      },
    });

    if (!existingWilaya) {
      return notFoundResponse("Wilaya not found");
    }

    // Check if name is taken (if changing)
    if (name && name !== existingWilaya.name) {
      const duplicateName = await prisma.wilaya.findUnique({
        where: { name },
      });

      if (duplicateName) {
        return errorResponse("Wilaya name already exists", 409);
      }
    }

    // Check if code is taken (if changing)
    if (code && code !== existingWilaya.code) {
      const duplicateCode = await prisma.wilaya.findUnique({
        where: { code },
      });

      if (duplicateCode) {
        return errorResponse("Wilaya code already exists", 409);
      }
    }

    // Handle manager assignment changes
    if (managerId !== undefined) {
      // If removing manager (managerId is null)
      if (managerId === null) {
        if (existingWilaya.manager) {
          // Remove wilaya assignment from old manager
          await prisma.user.update({
            where: { id: existingWilaya.manager.id },
            data: { wilayaId: null },
          });
        }
      }
      // If assigning new manager
      else {
        const newManager = await prisma.user.findUnique({
          where: { id: managerId },
          include: { managedWilaya: true },
        });

        if (!newManager) {
          return errorResponse("Manager not found", 404);
        }

        if (newManager.role !== "MANAGER") {
          return errorResponse("User is not a manager", 400);
        }

        if (newManager.status !== "ACTIVE") {
          return errorResponse("Manager account is inactive", 400);
        }

        // Check if new manager already manages another wilaya
        if (
          newManager.managedWilaya &&
          newManager.managedWilaya.id !== existingWilaya.id
        ) {
          return errorResponse(
            `Manager already manages ${newManager.managedWilaya.name}`,
            400
          );
        }

        // Remove old manager if exists
        if (existingWilaya.manager && existingWilaya.manager.id !== managerId) {
          await prisma.user.update({
            where: { id: existingWilaya.manager.id },
            data: { wilayaId: null },
          });
        }

        // Assign new manager
        await prisma.user.update({
          where: { id: managerId },
          data: { wilayaId: existingWilaya.id },
        });
      }
    }

    // Update wilaya
    const updatedWilaya = await prisma.wilaya.update({
      where: { id },
      data: {
        name,
        code,
        lat,
        lng,
        gradient,
      },
      include: {
        manager: {
          select: {
            id: true,
            username: true,
            email: true,
            status: true,
          },
        },
        _count: {
          select: {
            restaurants: true,
          },
        },
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        type: "WILAYA_UPDATED",
        description: `Wilaya ${updatedWilaya.name} updated`,
        userId: currentUser.id,
        metadata: {
          wilayaId: updatedWilaya.id,
          wilayaName: updatedWilaya.name,
          changes: body,
        },
      },
    });

    return successResponse({
      wilaya: updatedWilaya,
      message: "Wilaya updated successfully",
    });
  } catch (error: any) {
    console.error("❌ Update wilaya error:", error);

    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return errorResponse(error.message, 403);
    }

    return errorResponse("Internal server error", 500);
  }
}

// ==================== DELETE /api/admin/wilayas/[id] ====================
// Delete wilaya
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is super admin
    const currentUser = await requireSuperAdmin();

    const { id } = await params;

    // Find wilaya with restaurants count
    const wilaya = await prisma.wilaya.findUnique({
      where: { id },
      include: {
        manager: true,
        _count: {
          select: {
            restaurants: true,
          },
        },
      },
    });

    if (!wilaya) {
      return notFoundResponse("Wilaya not found");
    }

    // Prevent deletion if wilaya has restaurants
    if (wilaya._count.restaurants > 0) {
      return errorResponse(
        `Cannot delete wilaya with ${wilaya._count.restaurants} restaurant(s). Please remove or reassign restaurants first.`,
        400
      );
    }

    // If wilaya has a manager, remove the assignment
    if (wilaya.manager) {
      await prisma.user.update({
        where: { id: wilaya.manager.id },
        data: { wilayaId: null },
      });
    }

    // Delete wilaya
    await prisma.wilaya.delete({
      where: { id },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        type: "WILAYA_DELETED",
        description: `Wilaya ${wilaya.name} (${wilaya.code}) deleted`,
        userId: currentUser.id,
        metadata: {
          wilayaName: wilaya.name,
          wilayaCode: wilaya.code,
        },
      },
    });

    return successResponse({
      message: "Wilaya deleted successfully",
      deletedWilaya: {
        id: wilaya.id,
        name: wilaya.name,
        code: wilaya.code,
      },
    });
  } catch (error: any) {
    console.error("❌ Delete wilaya error:", error);

    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return errorResponse(error.message, 403);
    }

    return errorResponse("Internal server error", 500);
  }
}
