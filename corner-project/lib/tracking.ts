// lib/tracking.ts

import prisma from "./prisma";

// ==================== TRACKING TYPES ====================
export type TrackEventType = "view" | "scan" | "map_click";

export interface TrackEventOptions {
  restaurantId: string;
  eventType: TrackEventType;
  metadata?: {
    userAgent?: string;
    referer?: string;
    ipAddress?: string;
    country?: string;
    city?: string;
    device?: string;
    [key: string]: any;
  };
}

// ==================== TRACK EVENT ====================
export async function trackEvent(options: TrackEventOptions): Promise<boolean> {
  try {
    const { restaurantId, eventType, metadata } = options;

    // Get or create stats record
    let stats = await prisma.restaurantStats.findUnique({
      where: { restaurantId },
    });

    if (!stats) {
      stats = await prisma.restaurantStats.create({
        data: {
          restaurantId,
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

    // Check if we need to reset daily stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastReset = new Date(stats.lastResetDate);
    lastReset.setHours(0, 0, 0, 0);

    const needsReset = lastReset < today;

    // Build update data
    const updateData: any = {};

    if (needsReset) {
      // Reset today's stats
      updateData.todayViews = eventType === "view" ? 1 : 0;
      updateData.todayScans = eventType === "scan" ? 1 : 0;
      updateData.todayMapClicks = eventType === "map_click" ? 1 : 0;
      updateData.lastResetDate = new Date();
    } else {
      // Increment today's stats
      if (eventType === "view") updateData.todayViews = { increment: 1 };
      if (eventType === "scan") updateData.todayScans = { increment: 1 };
      if (eventType === "map_click")
        updateData.todayMapClicks = { increment: 1 };
    }

    // Always increment total stats
    if (eventType === "view") updateData.totalViews = { increment: 1 };
    if (eventType === "scan") updateData.totalScans = { increment: 1 };
    if (eventType === "map_click") updateData.totalMapClicks = { increment: 1 };

    // Update stats
    await prisma.restaurantStats.update({
      where: { restaurantId },
      data: updateData,
    });

    // Optionally:  Store detailed tracking log (for advanced analytics)
    // await prisma.trackingLog.create({
    //   data: {
    //     restaurantId,
    //     eventType,
    //     metadata,
    //     timestamp: new Date(),
    //   },
    // });

    return true;
  } catch (error) {
    console.error("❌ Track event error:", error);
    return false;
  }
}

// ==================== BATCH TRACKING ====================
export async function trackBatch(events: TrackEventOptions[]): Promise<number> {
  let successCount = 0;

  for (const event of events) {
    const success = await trackEvent(event);
    if (success) successCount++;
  }

  return successCount;
}

// ==================== GET RESTAURANT STATS ====================
export async function getRestaurantTracking(restaurantId: string) {
  const stats = await prisma.restaurantStats.findUnique({
    where: { restaurantId },
    select: {
      totalViews: true,
      totalScans: true,
      totalMapClicks: true,
      todayViews: true,
      todayScans: true,
      todayMapClicks: true,
      lastResetDate: true,
    },
  });

  if (!stats) {
    return {
      total: { views: 0, scans: 0, mapClicks: 0 },
      today: { views: 0, scans: 0, mapClicks: 0 },
      lastResetDate: null,
    };
  }

  return {
    total: {
      views: stats.totalViews,
      scans: stats.totalScans,
      mapClicks: stats.totalMapClicks,
    },
    today: {
      views: stats.todayViews,
      scans: stats.todayScans,
      mapClicks: stats.todayMapClicks,
    },
    lastResetDate: stats.lastResetDate,
  };
}

// ==================== RESET DAILY STATS (CRON JOB) ====================
export async function resetDailyStats() {
  try {
    const result = await prisma.restaurantStats.updateMany({
      data: {
        todayViews: 0,
        todayScans: 0,
        todayMapClicks: 0,
        lastResetDate: new Date(),
      },
    });

    console.log(`✅ Reset daily stats for ${result.count} restaurants`);
    return result.count;
  } catch (error) {
    console.error("❌ Reset daily stats error:", error);
    return 0;
  }
}
