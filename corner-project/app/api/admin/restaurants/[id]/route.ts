// src/app/api/admin/restaurants/[id]/route.ts

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole, requireSuperAdmin } from "@/lib/auth";
import { updateRestaurantSchema } from "@/lib/validators";
import { generateUniqueSlug } from "@/lib/utils";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  validationErrorResponse,
} from "@/lib/api-response";

// ==================== GET /api/admin/restaurants/[id] ====================
// Get single restaurant details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is super admin
    await requireRole(["SUPER_ADMIN", "MANAGER", "OWNER"]);

    const { id } = await params;

    // Fetch restaurant with all related data
    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        wilaya: {
          select: {
            id: true,
            name: true,
            code: true,
            lat: true,
            lng: true,
          },
        },
        owner: {
          select: {
            id: true,
            username: true,
            email: true,
            status: true,
            createdAt: true,
          },
        },
        categories: {
          select: {
            id: true,
            name: true,
            order: true,
            _count: {
              select: {
                products: true,
              },
            },
          },
          orderBy: {
            order: "asc",
          },
        },
        products: {
          select: {
            id: true,
            name: true,
            price: true,
            isAvailable: true,
          },
          take: 10,
        },
        stats: true,
        promotions: {
          select: {
            id: true,
            name: true,
            isActive: true,
            discountType: true,
            discountValue: true,
          },
        },
        _count: {
          select: {
            categories: true,
            products: true,
            promotions: true,
          },
        },
      },
    });

    if (!restaurant) {
      return notFoundResponse("Restaurant not found");
    }

    return successResponse({
      restaurant,
    });
  } catch (error: any) {
    console.error("❌ Get restaurant error:", error);

    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return errorResponse(error.message, 403);
    }

    return errorResponse("Internal server error", 500);
  }
}

// ==================== PUT /api/admin/restaurants/[id] ====================
// Update restaurant
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is super admin
    const currentUser = await requireRole(["SUPER_ADMIN", "MANAGER", "OWNER"]);

    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validation = updateRestaurantSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten().fieldErrors);
    }

    const updateData = validation.data;

    // Find existing restaurant
    const existingRestaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        wilaya: true,
      },
    });

    if (!existingRestaurant) {
      return notFoundResponse("Restaurant not found");
    }

    // If wilaya is being changed, verify it exists
    if (
      updateData.wilayaId &&
      updateData.wilayaId !== existingRestaurant.wilayaId
    ) {
      const wilaya = await prisma.wilaya.findUnique({
        where: { id: updateData.wilayaId },
      });

      if (!wilaya) {
        return errorResponse("Wilaya not found", 404);
      }
    }

    // If name is being changed, generate new slug
    let newSlug: string | undefined;
    if (updateData.name && updateData.name !== existingRestaurant.name) {
      newSlug = await generateUniqueSlug(updateData.name, async (slug) => {
        if (slug === existingRestaurant.slug) return false;
        const existing = await prisma.restaurant.findUnique({
          where: { slug },
        });
        return !!existing;
      });
    }

    // Update restaurant
    const updatedRestaurant = await prisma.restaurant.update({
      where: { id },
      data: {
        name: updateData.name,
        slug: newSlug,
        wilayaId: updateData.wilayaId,
        address: updateData.address,
        phone: updateData.phone,
        description: updateData.description,
        openingHours: updateData.openingHours,
        logo: updateData.logo,
        lat: updateData.lat,
        lng: updateData.lng,
        currency: updateData.currency,
        status: updateData.status,
        package: updateData.package,
      },
      include: {
        wilaya: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        owner: {
          select: {
            id: true,
            username: true,
            email: true,
            status: true,
          },
        },
        stats: true,
        _count: {
          select: {
            categories: true,
            products: true,
          },
        },
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        type: "RESTAURANT_UPDATED",
        description: `Restaurant ${updatedRestaurant.name} updated`,
        userId: currentUser.id,
        restaurantId: updatedRestaurant.id,
        metadata: {
          changes: updateData,
        },
      },
    });

    return successResponse({
      restaurant: updatedRestaurant,
      message: "Restaurant updated successfully",
    });
  } catch (error: any) {
    console.error("❌ Update restaurant error:", error);

    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return errorResponse(error.message, 403);
    }

    return errorResponse("Internal server error", 500);
  }
}

// ==================== DELETE /api/admin/restaurants/[id] ====================
// Delete restaurant and owner
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is super admin
    const currentUser = await requireSuperAdmin();

    const { id } = await params;

    // Find restaurant with owner
    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        owner: true,
        wilaya: true,
        _count: {
          select: {
            categories: true,
            products: true,
          },
        },
      },
    });

    if (!restaurant) {
      return notFoundResponse("Restaurant not found");
    }

    // Delete restaurant (cascades will delete related data)
    await prisma.$transaction(async (tx) => {
      // Log activity before deletion
      await tx.activity.create({
        data: {
          type: "RESTAURANT_DELETED",
          description: `Restaurant ${restaurant.name} deleted from ${restaurant.wilaya.name}`,
          userId: currentUser.id,
          metadata: {
            restaurantName: restaurant.name,
            restaurantSlug: restaurant.slug,
            wilayaName: restaurant.wilaya.name,
            categoriesCount: restaurant._count.categories,
            productsCount: restaurant._count.products,
          },
        },
      });

      // Delete restaurant (will cascade delete owner due to relation)
      await tx.restaurant.delete({
        where: { id },
      });
    });

    return successResponse({
      message: "Restaurant and owner account deleted successfully",
      deletedRestaurant: {
        id: restaurant.id,
        name: restaurant.name,
        slug: restaurant.slug,
      },
    });
  } catch (error: any) {
    console.error("❌ Delete restaurant error:", error);

    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return errorResponse(error.message, 403);
    }

    return errorResponse("Internal server error", 500);
  }
}
