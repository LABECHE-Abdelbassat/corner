// src/app/api/admin/analytics/route.ts

import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-response";
import {
  getPlatformStats,
  getAnalyticsSummary,
  getTopRestaurants,
  getUserStats,
  getWilayaStats,
  getRecentActivities,
  getGrowthMetrics,
  getPackageDistribution,
} from "@/lib/analytics";

// ==================== GET /api/admin/analytics ====================
// Get platform-wide analytics (Super Admin) or Wilaya analytics (Manager)
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return errorResponse("Unauthorized", 401);
    }

    // Only Super Admin and Manager can access analytics
    if (currentUser.role !== "SUPER_ADMIN" && currentUser.role !== "MANAGER") {
      return errorResponse(
        "Forbidden:  Only admins and managers can view analytics",
        403
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const period = (searchParams.get("period") || "month") as "week" | "month";
    const topLimit = parseInt(searchParams.get("topLimit") || "10");

    // Determine wilaya scope (managers only see their wilaya)
    const wilayaId =
      currentUser.role === "MANAGER"
        ? currentUser.wilayaId || undefined
        : undefined;

    // Fetch all analytics data in parallel
    const [
      platformStats,
      analyticsSummary,
      topRestaurants,
      userStats,
      wilayaStats,
      recentActivities,
      growthMetrics,
      packageDistribution,
    ] = await Promise.all([
      getPlatformStats(wilayaId),
      getAnalyticsSummary(wilayaId),
      getTopRestaurants(topLimit, wilayaId),
      getUserStats(wilayaId),
      currentUser.role === "SUPER_ADMIN"
        ? getWilayaStats()
        : Promise.resolve(null),
      getRecentActivities(20, wilayaId),
      getGrowthMetrics(period, wilayaId),
      getPackageDistribution(wilayaId),
    ]);

    // Calculate engagement rate
    const totalEngagement =
      analyticsSummary.total.views +
      analyticsSummary.total.scans +
      analyticsSummary.total.mapClicks;

    const todayEngagement =
      analyticsSummary.today.views +
      analyticsSummary.today.scans +
      analyticsSummary.today.mapClicks;

    // Build response
    const analyticsData = {
      overview: {
        restaurants: platformStats.restaurants,
        content: platformStats.content,
        users: userStats,
        packages: packageDistribution,
      },
      analytics: {
        total: {
          ...analyticsSummary.total,
          engagement: totalEngagement,
        },
        today: {
          ...analyticsSummary.today,
          engagement: todayEngagement,
        },
      },
      growth: growthMetrics,
      topRestaurants,
      recentActivities,
      ...(wilayaStats && { wilayas: wilayaStats }), // Only for super admin
      metadata: {
        userRole: currentUser.role,
        userName: currentUser.username,
        ...(wilayaId && {
          wilayaId,
          wilayaScope: "Filtered to your wilaya",
        }),
        generatedAt: new Date().toISOString(),
      },
    };

    return successResponse(analyticsData);
  } catch (error: any) {
    console.error("❌ Get analytics error:", error);

    if (
      error.message === "Unauthorized" ||
      error.message.includes("Forbidden")
    ) {
      return errorResponse(error.message, 403);
    }

    return errorResponse("Internal server error", 500);
  }
}
