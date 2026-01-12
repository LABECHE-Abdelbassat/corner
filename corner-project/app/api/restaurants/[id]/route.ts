// src/app/api/restaurants/[id]/route.ts (UPDATED)

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
} from "@/lib/api-response";

// ==================== GET /api/restaurants/[id] ====================
// Get single restaurant details (Public or Admin)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if user is authenticated (optional - for admin view)
    const currentUser = await getCurrentUser();
    const isAdmin =
      currentUser &&
      (currentUser.role === "SUPER_ADMIN" || currentUser.role === "MANAGER");
    const isOwner =
      currentUser &&
      currentUser.role === "OWNER" &&
      currentUser.restaurantId === id;

    // Find restaurant by ID or slug
    const restaurant = await prisma.restaurant.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        description: true,
        address: true,
        phone: true,
        openingHours: true,
        currency: true,
        lat: true,
        lng: true,
        status: true,
        package: true,
        createdAt: true,
        updatedAt: true,
        wilaya: {
          select: {
            id: true,
            name: true,
            code: true,
            lat: true,
            lng: true,
            gradient: true,
          },
        },
        owner:
          isAdmin || isOwner
            ? {
                select: {
                  id: true,
                  username: true,
                  email: true,
                  status: true,
                },
              }
            : false,
        stats: {
          select: {
            totalViews: true,
            totalScans: true,
            totalMapClicks: true,
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

    // For public users, only show active restaurants
    if (!isAdmin && !isOwner && restaurant.status !== "ACTIVE") {
      return notFoundResponse("Restaurant not found");
    }

    // Get categories preview
    const categories = await prisma.category.findMany({
      where: { restaurantId: restaurant.id },
      select: {
        id: true,
        name: true,
        description: true,
        image: true,
        order: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: { order: "asc" },
      take: 10,
    });

    // Get featured products
    const featuredProducts = await prisma.product.findMany({
      where: {
        restaurantId: restaurant.id,
        isAvailable: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        image: true,
        price: true,
        tags: true,
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
      take: 6,
    });

    // Get active promotions
    const activePromotions = await prisma.promotion.findMany({
      where: {
        restaurantId: restaurant.id,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        discountType: true,
        discountValue: true,
        minimumOrderValue: true,
      },
      take: 3,
    });

    return successResponse({
      restaurant: {
        ...restaurant,
        categories: categories.map((cat) => ({
          id: cat.id,
          name: cat.name,
          description: cat.description,
          image: cat.image,
          order: cat.order,
          productsCount: cat._count.products,
        })),
        featuredProducts,
        activePromotions,
      },
    });
  } catch (error) {
    console.error("❌ Get restaurant error:", error);
    return errorResponse("Internal server error", 500);
  }
}
