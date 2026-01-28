// src/app/api/restaurants/[id]/track/route.ts

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
} from "@/lib/api-response";

// ==================== POST /api/restaurants/[id]/track ====================
// Track analytics event (Public endpoint - no auth required)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate input - FIXED: expecting "type" not "eventType"
    const { type } = body;

    if (!type || !["view", "scan", "map_click"].includes(type)) {
      return errorResponse(
        "Invalid event type. Must be:  view, scan, or map_click",
        400
      );
    }

    // Try to find restaurant by ID first, then by slug
    let restaurant = await prisma.restaurant.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    // If not found by ID, try by slug
    if (!restaurant) {
      restaurant = await prisma.restaurant.findUnique({
        where: { slug: id },
        select: { id: true, name: true },
      });
    }

    if (!restaurant) {
      return notFoundResponse("Restaurant not found");
    }

    // Get or create stats record
    let stats = await prisma.restaurantStats.findUnique({
      where: { restaurantId: restaurant.id },
    });

    if (!stats) {
      stats = await prisma.restaurantStats.create({
        data: {
          restaurantId: restaurant.id,
          totalViews: 0,
          totalScans: 0,
          totalMapClicks: 0,
          todayViews: 0,
          todayScans: 0,
          todayMapClicks: 0,
          lastResetDate: new Date(),
        },
      });
    }

    // Check if we need to reset today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastReset = new Date(stats.lastResetDate);
    lastReset.setHours(0, 0, 0, 0);

    const needsReset = lastReset < today;

    // Build update data - FIXED: Only include fields we're updating
    let updateData: any = {
      lastResetDate: new Date(),
    };

    if (needsReset) {
      // Reset all today's stats and set the current event to 1
      updateData.todayViews = type === "view" ? 1 : 0;
      updateData.todayScans = type === "scan" ? 1 : 0;
      updateData.todayMapClicks = type === "map_click" ? 1 : 0;
    } else {
      // Increment only the relevant today stat
      if (type === "view") {
        updateData.todayViews = { increment: 1 };
      } else if (type === "scan") {
        updateData.todayScans = { increment: 1 };
      } else if (type === "map_click") {
        updateData.todayMapClicks = { increment: 1 };
      }
    }

    // Always increment the relevant total stat
    if (type === "view") {
      updateData.totalViews = { increment: 1 };
    } else if (type === "scan") {
      updateData.totalScans = { increment: 1 };
    } else if (type === "map_click") {
      updateData.totalMapClicks = { increment: 1 };
    }

    // Update stats
    const updatedStats = await prisma.restaurantStats.update({
      where: { restaurantId: restaurant.id },
      data: updateData,
    });

    console.log(`✅ Tracked ${type} for ${restaurant.name}:`, {
      totalViews: updatedStats.totalViews,
      totalScans: updatedStats.totalScans,
      totalMapClicks: updatedStats.totalMapClicks,
      todayViews: updatedStats.todayViews,
      todayScans: updatedStats.todayScans,
      todayMapClicks: updatedStats.todayMapClicks,
    });

    return successResponse({
      message: "Event tracked successfully",
      type,
      stats: {
        total: {
          views: updatedStats.totalViews,
          scans: updatedStats.totalScans,
          mapClicks: updatedStats.totalMapClicks,
        },
        today: {
          views: updatedStats.todayViews,
          scans: updatedStats.todayScans,
          mapClicks: updatedStats.todayMapClicks,
        },
      },
    });
  } catch (error) {
    console.error("❌ Track event error:", error);
    return errorResponse("Internal server error", 500);
  }
}
