// src/app/api/restaurants/[id]/stats/route.ts

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
} from "@/lib/api-response";

// ==================== GET /api/restaurants/[id]/stats ====================
// Get restaurant statistics (Owner only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return errorResponse("Unauthorized", 401);
    }

    // Check if user is owner of this restaurant or admin
    if (currentUser.role !== "SUPER_ADMIN" && currentUser.role !== "MANAGER") {
      if (currentUser.role !== "OWNER" || currentUser.restaurantId !== id) {
        return errorResponse(
          "Forbidden: You can only view your own restaurant stats",
          403
        );
      }
    }

    // Find restaurant with stats
    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        stats: true,
        wilaya: {
          select: {
            name: true,
            code: true,
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

    // Get recent activities
    const recentActivities = await prisma.activity.findMany({
      where: { restaurantId: id },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        type: true,
        description: true,
        createdAt: true,
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    // Calculate today's stats (if stats exist)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let todayStats = {
      views: restaurant.stats?.todayViews || 0,
      scans: restaurant.stats?.todayScans || 0,
      mapClicks: restaurant.stats?.todayMapClicks || 0,
    };

    // Check if we need to reset today's stats
    if (restaurant.stats) {
      const lastReset = new Date(restaurant.stats.lastResetDate);
      lastReset.setHours(0, 0, 0, 0);

      if (lastReset < today) {
        // Reset today's stats
        await prisma.restaurantStats.update({
          where: { id: restaurant.stats.id },
          data: {
            todayViews: 0,
            todayScans: 0,
            todayMapClicks: 0,
            lastResetDate: new Date(),
          },
        });

        todayStats = { views: 0, scans: 0, mapClicks: 0 };
      }
    }

    // Get products availability
    const products = await prisma.product.findMany({
      where: { restaurantId: id },
      select: {
        isAvailable: true,
      },
    });

    const availableProducts = products.filter((p) => p.isAvailable).length;
    const unavailableProducts = products.filter((p) => !p.isAvailable).length;

    // Build response
    const statsData = {
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        slug: restaurant.slug,
        status: restaurant.status,
        package: restaurant.package,
        wilaya: restaurant.wilaya.name,
      },
      analytics: {
        total: {
          views: restaurant.stats?.totalViews || 0,
          scans: restaurant.stats?.totalScans || 0,
          mapClicks: restaurant.stats?.totalMapClicks || 0,
        },
        today: todayStats,
      },
      menu: {
        categories: restaurant._count.categories,
        products: restaurant._count.products,
        availableProducts,
        unavailableProducts,
        promotions: restaurant._count.promotions,
      },
      recentActivities: recentActivities.map((activity) => ({
        id: activity.id,
        type: activity.type,
        description: activity.description,
        user: activity.user?.username || "System",
        createdAt: activity.createdAt,
      })),
    };

    return successResponse(statsData);
  } catch (error: any) {
    console.error("❌ Get stats error:", error);

    if (
      error.message === "Unauthorized" ||
      error.message.includes("Forbidden")
    ) {
      return errorResponse(error.message, 403);
    }

    return errorResponse("Internal server error", 500);
  }
}
