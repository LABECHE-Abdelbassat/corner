// lib/analytics.ts

import prisma from "./prisma";

// ==================== DATE HELPERS ====================
export function getDateRange(
  period: "today" | "week" | "month" | "year" | "all"
) {
  const now = new Date();
  const startDate = new Date();

  switch (period) {
    case "today":
      startDate.setHours(0, 0, 0, 0);
      break;
    case "week":
      startDate.setDate(now.getDate() - 7);
      break;
    case "month":
      startDate.setMonth(now.getMonth() - 1);
      break;
    case "year":
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    case "all":
      startDate.setFullYear(2020, 0, 1); // Start from 2020
      break;
  }

  return { startDate, endDate: now };
}

// ==================== PLATFORM STATS ====================
export async function getPlatformStats(wilayaId?: string) {
  const where: any = {};
  if (wilayaId) {
    where.wilayaId = wilayaId;
  }

  // Get counts
  const [
    totalRestaurants,
    activeRestaurants,
    inactiveRestaurants,
    totalCategories,
    totalProducts,
    totalPromotions,
  ] = await Promise.all([
    prisma.restaurant.count({ where }),
    prisma.restaurant.count({ where: { ...where, status: "ACTIVE" } }),
    prisma.restaurant.count({ where: { ...where, status: "INACTIVE" } }),
    prisma.category.count({
      where: wilayaId ? { restaurant: { wilayaId } } : {},
    }),
    prisma.product.count({
      where: wilayaId ? { restaurant: { wilayaId } } : {},
    }),
    prisma.promotion.count({
      where: wilayaId ? { restaurant: { wilayaId } } : {},
    }),
  ]);

  return {
    restaurants: {
      total: totalRestaurants,
      active: activeRestaurants,
      inactive: inactiveRestaurants,
    },
    content: {
      categories: totalCategories,
      products: totalProducts,
      promotions: totalPromotions,
    },
  };
}

// ==================== ANALYTICS AGGREGATION ====================
export async function getAnalyticsSummary(wilayaId?: string) {
  const where: any = {};
  if (wilayaId) {
    where.restaurant = { wilayaId };
  }

  // Get all stats
  const stats = await prisma.restaurantStats.findMany({
    where,
    select: {
      totalViews: true,
      totalScans: true,
      totalMapClicks: true,
      todayViews: true,
      todayScans: true,
      todayMapClicks: true,
    },
  });

  // Aggregate
  const summary = stats.reduce(
    (acc, stat) => ({
      total: {
        views: acc.total.views + stat.totalViews,
        scans: acc.total.scans + stat.totalScans,
        mapClicks: acc.total.mapClicks + stat.totalMapClicks,
      },
      today: {
        views: acc.today.views + stat.todayViews,
        scans: acc.today.scans + stat.todayScans,
        mapClicks: acc.today.mapClicks + stat.todayMapClicks,
      },
    }),
    {
      total: { views: 0, scans: 0, mapClicks: 0 },
      today: { views: 0, scans: 0, mapClicks: 0 },
    }
  );

  return summary;
}

// ==================== TOP RESTAURANTS ====================
export async function getTopRestaurants(limit: number = 10, wilayaId?: string) {
  const where: any = {};
  if (wilayaId) {
    where.wilayaId = wilayaId;
  }

  const restaurants = await prisma.restaurant.findMany({
    where,
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      status: true,
      wilaya: {
        select: {
          name: true,
          code: true,
        },
      },
      stats: {
        select: {
          totalViews: true,
          totalScans: true,
          totalMapClicks: true,
        },
      },
      _count: {
        select: {
          products: true,
        },
      },
    },
    orderBy: {
      stats: {
        totalViews: "desc",
      },
    },
    take: limit,
  });

  return restaurants.map((restaurant) => ({
    id: restaurant.id,
    name: restaurant.name,
    slug: restaurant.slug,
    logo: restaurant.logo,
    status: restaurant.status,
    wilaya: restaurant.wilaya.name,
    productsCount: restaurant._count.products,
    views: restaurant.stats?.totalViews || 0,
    scans: restaurant.stats?.totalScans || 0,
    mapClicks: restaurant.stats?.totalMapClicks || 0,
    totalEngagement:
      (restaurant.stats?.totalViews || 0) +
      (restaurant.stats?.totalScans || 0) +
      (restaurant.stats?.totalMapClicks || 0),
  }));
}

// ==================== USER STATS ====================
export async function getUserStats(wilayaId?: string) {
  const where: any = {};
  if (wilayaId) {
    where.OR = [{ wilayaId }, { restaurant: { wilayaId } }];
  }

  const [
    totalUsers,
    superAdmins,
    managers,
    owners,
    activeUsers,
    inactiveUsers,
  ] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.count({ where: { ...where, role: "SUPER_ADMIN" } }),
    prisma.user.count({ where: { ...where, role: "MANAGER" } }),
    prisma.user.count({ where: { ...where, role: "OWNER" } }),
    prisma.user.count({ where: { ...where, status: "ACTIVE" } }),
    prisma.user.count({ where: { ...where, status: "INACTIVE" } }),
  ]);

  return {
    total: totalUsers,
    byRole: {
      superAdmins,
      managers,
      owners,
    },
    byStatus: {
      active: activeUsers,
      inactive: inactiveUsers,
    },
  };
}

// ==================== WILAYA STATS ====================
export async function getWilayaStats() {
  const wilayas = await prisma.wilaya.findMany({
    select: {
      id: true,
      name: true,
      code: true,
      gradient: true,
      manager: {
        select: {
          username: true,
        },
      },
      _count: {
        select: {
          restaurants: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  // Get analytics for each wilaya
  const wilayasWithStats = await Promise.all(
    wilayas.map(async (wilaya) => {
      const analytics = await getAnalyticsSummary(wilaya.id);
      const restaurantStats = await getPlatformStats(wilaya.id);

      return {
        id: wilaya.id,
        name: wilaya.name,
        code: wilaya.code,
        gradient: wilaya.gradient,
        manager: wilaya.manager?.username || null,
        restaurantsCount: wilaya._count.restaurants,
        activeRestaurants: restaurantStats.restaurants.active,
        totalViews: analytics.total.views,
        totalScans: analytics.total.scans,
        totalMapClicks: analytics.total.mapClicks,
      };
    })
  );

  return wilayasWithStats;
}

// ==================== RECENT ACTIVITIES ====================
export async function getRecentActivities(
  limit: number = 20,
  wilayaId?: string
) {
  const where: any = {};
  if (wilayaId) {
    where.OR = [{ restaurant: { wilayaId } }, { user: { wilayaId } }];
  }

  const activities = await prisma.activity.findMany({
    where,
    select: {
      id: true,
      type: true,
      description: true,
      createdAt: true,
      user: {
        select: {
          username: true,
          role: true,
        },
      },
      restaurant: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });

  return activities.map((activity) => ({
    id: activity.id,
    type: activity.type,
    description: activity.description,
    createdAt: activity.createdAt,
    user: activity.user?.username || "System",
    userRole: activity.user?.role || null,
    restaurant: activity.restaurant?.name || null,
    restaurantSlug: activity.restaurant?.slug || null,
  }));
}

// ==================== GROWTH METRICS ====================
export async function getGrowthMetrics(
  period: "week" | "month" = "month",
  wilayaId?: string
) {
  const { startDate } = getDateRange(period);
  const where: any = {
    createdAt: {
      gte: startDate,
    },
  };

  if (wilayaId) {
    where.wilayaId = wilayaId;
  }

  const [newRestaurants, newUsers] = await Promise.all([
    prisma.restaurant.count({ where }),
    prisma.user.count({
      where: {
        createdAt: {
          gte: startDate,
        },
        ...(wilayaId
          ? {
              OR: [{ wilayaId }, { restaurant: { wilayaId } }],
            }
          : {}),
      },
    }),
  ]);

  return {
    period,
    newRestaurants,
    newUsers,
  };
}

// ==================== PACKAGE DISTRIBUTION ====================
export async function getPackageDistribution(wilayaId?: string) {
  const where: any = {};
  if (wilayaId) {
    where.wilayaId = wilayaId;
  }

  const [basic, pro, premium] = await Promise.all([
    prisma.restaurant.count({ where: { ...where, package: "BASIC" } }),
    prisma.restaurant.count({ where: { ...where, package: "PRO" } }),
    prisma.restaurant.count({ where: { ...where, package: "PREMIUM" } }),
  ]);

  return {
    BASIC: basic,
    PRO: pro,
    PREMIUM: premium,
    total: basic + pro + premium,
  };
}
