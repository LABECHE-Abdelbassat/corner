// lib/client-tracking.ts
// Client-side tracking helper

export async function trackRestaurantView(restaurantId: string) {
  try {
    await fetch(`/api/restaurants/${restaurantId}/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType: "view",
        metadata: {
          userAgent: navigator.userAgent,
          referer: document.referrer,
          timestamp: new Date().toISOString(),
        },
      }),
    });
  } catch (error) {
    console.error("Tracking error:", error);
  }
}

export async function trackQRScan(restaurantId: string) {
  try {
    await fetch(`/api/restaurants/${restaurantId}/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType: "scan",
        metadata: {
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        },
      }),
    });
  } catch (error) {
    console.error("Tracking error:", error);
  }
}

export async function trackMapClick(restaurantId: string) {
  try {
    await fetch(`/api/restaurants/${restaurantId}/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType: "map_click",
        metadata: {
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        },
      }),
    });
  } catch (error) {
    console.error("Tracking error:", error);
  }
}

// Auto-track page views
export function useAutoTrackView(restaurantId: string) {
  if (typeof window !== "undefined") {
    // Track on mount (only once)
    const tracked = sessionStorage.getItem(`tracked_${restaurantId}`);
    if (!tracked) {
      trackRestaurantView(restaurantId);
      sessionStorage.setItem(`tracked_${restaurantId}`, "true");
    }
  }
}
