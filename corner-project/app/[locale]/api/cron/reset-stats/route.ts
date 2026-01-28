// src/app/api/cron/reset-stats/route.ts

import { NextRequest } from "next/server";
import { resetDailyStats } from "@/lib/tracking";
import { successResponse, errorResponse } from "@/lib/api-response";

// ==================== GET /api/cron/reset-stats ====================
// Reset daily stats (Call this via cron job at midnight)
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (for security)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || "your-secret-key";

    if (authHeader !== `Bearer ${cronSecret}`) {
      return errorResponse("Unauthorized", 401);
    }

    // Reset stats
    const count = await resetDailyStats();

    return successResponse({
      message: "Daily stats reset successfully",
      restaurantsUpdated: count,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Cron reset error:", error);
    return errorResponse("Internal server error", 500);
  }
}
