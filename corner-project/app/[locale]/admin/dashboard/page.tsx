"use client";

import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  FaStore,
  FaEye,
  FaQrcode,
  FaUsers,
  FaChartLine,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaShieldAlt,
  FaUserTie,
  FaToggleOn,
  FaToggleOff,
  FaChartBar,
  FaMapMarkedAlt,
  FaSpinner,
  FaSync,
} from "react-icons/fa";
import { useRouter } from "next/navigation";

// Fix Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow. png",
});

// ==================== INTERFACES ====================
interface Wilaya {
  id: string;
  name: string;
  code: string;
  managerUsername: string | null;
  restaurantsCount: number;
  totalViews: number;
  totalScans: number;
  totalMapClicks: number;
}

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  wilayaName: string;
  lat: number | null;
  lng: number | null;
  status: string;
}

interface CurrentUser {
  id: string;
  username: string;
  role: string;
  wilayaId: string | null;
}

// ==================== CUSTOM MAP ICON ====================
const createCustomIcon = () => {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background: linear-gradient(135deg, #FFCE18 0%, #ffd94d 100%);
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(255, 206, 24, 0.4);
        position: relative;
      ">
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(45deg);
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
        "></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// Map Updater Component
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13, { animate: true });
  }, [center, map]);
  return null;
}

export default function AdminDashboard() {
  const router = useRouter();

  // State
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewAsManager, setViewAsManager] = useState(false);
  const [selectedWilaya, setSelectedWilaya] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([36.0, 3.0]);

  // ==================== FETCH DATA ====================
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Get current user
      const userResponse = await fetch("/api/auth/me", {
        credentials: "include",
      });
      const userData = await userResponse.json();

      if (!userData.success) {
        router.push("/admin/login");
        return;
      }

      const user = userData.data.user;
      setCurrentUser({
        id: String(user.id || ""),
        username: String(user.username || ""),
        role: String(user.role || ""),
        wilayaId: user.wilayaId ? String(user.wilayaId) : null,
      });

      // Set view based on role
      if (user.role === "MANAGER") {
        setViewAsManager(true);
      }

      // Fetch wilayas with stats
      const wilayasResponse = await fetch("/api/admin/wilayas", {
        credentials: "include",
      });
      const wilayasData = await wilayasResponse.json();

      if (wilayasData.success) {
        setWilayas(
          wilayasData.data.wilayas.map((w: any) => ({
            id: String(w.id || ""),
            name: String(w.name || ""),
            code: String(w.code || ""),
            managerUsername: w.manager?.username
              ? String(w.manager.username)
              : null,
            restaurantsCount: Number(w._count?.restaurants || 0),
            totalViews: Number(w.stats?.totalViews || 0),
            totalScans: Number(w.stats?.totalScans || 0),
            totalMapClicks: Number(w.stats?.totalMapClicks || 0),
          }))
        );
      }

      // Fetch restaurants
      const restaurantsResponse = await fetch("/api/admin/restaurants", {
        credentials: "include",
      });
      const restaurantsData = await restaurantsResponse.json();

      if (restaurantsData.success) {
        setRestaurants(
          restaurantsData.data.restaurants.map((r: any) => ({
            id: String(r.id || ""),
            name: String(r.name || ""),
            slug: String(r.slug || ""),
            wilayaName: String(r.wilaya?.name || ""),
            lat: r.lat ? Number(r.lat) : null,
            lng: r.lng ? Number(r.lng) : null,
            status: String(r.status || "INACTIVE"),
          }))
        );
      }

      // Set initial map center
      if (user.role === "MANAGER" && user.wilayaId) {
        const firstRestaurant = restaurantsData.data.restaurants.find(
          (r: any) => r.wilaya?.id === user.wilayaId && r.lat && r.lng
        );
        if (firstRestaurant) {
          setMapCenter([
            Number(firstRestaurant.lat),
            Number(firstRestaurant.lng),
          ]);
        }
      }
    } catch (err) {
      console.error("Fetch dashboard data error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    router.push("/admin/login");
  };

  // ==================== COMPUTED VALUES ====================
  const visibleWilayas = viewAsManager
    ? wilayas.filter((w) => w.id === currentUser?.wilayaId)
    : wilayas;

  const visibleRestaurants = viewAsManager
    ? restaurants.filter((r) =>
        wilayas.find(
          (w) => w.id === currentUser?.wilayaId && w.name === r.wilayaName
        )
      )
    : selectedWilaya
    ? restaurants.filter(
        (r) =>
          r.wilayaName === wilayas.find((w) => w.id === selectedWilaya)?.name
      )
    : restaurants;

  const totalStats = {
    restaurants: visibleWilayas.reduce(
      (sum, w) => sum + (w.restaurantsCount || 0),
      0
    ),
    views: visibleWilayas.reduce((sum, w) => sum + (w.totalViews || 0), 0),
    scans: visibleWilayas.reduce((sum, w) => sum + (w.totalScans || 0), 0),
  };

  // ==================== RENDER ====================
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="w-16 h-16 text-[#FFCE18] animate-spin mx-auto mb-4" />
          <p className="text-white text-xl font-bold">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex">
      {/* Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 lg:relative z-50">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>

          {/* Sidebar Content */}
          <div className="fixed lg:sticky top-0 left-0 h-screen w-64 bg-gray-950 border-r border-white/10 flex flex-col">
            {/* Logo & Close */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                  <FaShieldAlt className="text-white" />
                </div>
                <div>
                  <h2 className="text-white font-black">Admin</h2>
                  <p className="text-xs text-gray-500">Platform</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg hover: bg-white/10 transition-all lg:hidden"
              >
                <FaTimes className="text-white" />
              </button>
            </div>

            {/* Role Display */}
            <div className="p-4 border-b border-white/10">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                  {viewAsManager ? (
                    <FaUserTie className="text-blue-400" />
                  ) : (
                    <FaShieldAlt className="text-red-500" />
                  )}
                  <div>
                    <div className="text-white font-bold text-sm">
                      {currentUser.username}
                    </div>
                    <div className="text-xs text-gray-500">
                      {viewAsManager ? "Manager" : "Super Admin"}
                    </div>
                  </div>
                </div>
                {currentUser.role === "SUPER_ADMIN" && (
                  <button
                    onClick={() => {
                      setViewAsManager(!viewAsManager);
                      setSelectedWilaya(null);
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-purple-500/20 border border-purple-500 text-purple-400 hover:bg-purple-500/30 transition-all"
                  >
                    <span className="text-sm font-bold">View as Manager</span>
                    {viewAsManager ? (
                      <FaToggleOn className="text-xl" />
                    ) : (
                      <FaToggleOff className="text-xl" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              <button
                onClick={() => router.push("/admin/dashboard")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/20 text-red-400 font-bold"
              >
                <FaChartLine />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => router.push("/admin/restaurants")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all"
              >
                <FaStore />
                <span>Restaurants</span>
              </button>
              {currentUser.role === "SUPER_ADMIN" && (
                <>
                  <button
                    onClick={() => router.push("/admin/users")}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all"
                  >
                    <FaUsers />
                    <span>Users</span>
                  </button>
                  <button
                    onClick={() => router.push("/admin/wilayas")}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all"
                  >
                    <FaMapMarkedAlt />
                    <span>Wilayas</span>
                  </button>
                </>
              )}
              <button
                onClick={() => router.push("/admin/analytics")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all"
              >
                <FaChartBar />
                <span>Analytics</span>
              </button>
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-white/10">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all font-bold"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="sticky top-0 z-40 backdrop-blur-xl bg-black/80 border-b border-white/10">
          <div className="px-4 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
                >
                  <FaBars className="text-white" />
                </button>
                <div>
                  <h1 className="text-3xl font-black text-white">
                    {selectedWilaya
                      ? wilayas.find((w) => w.id === selectedWilaya)?.name +
                        " Dashboard"
                      : viewAsManager
                      ? wilayas.find((w) => w.id === currentUser.wilayaId)
                          ?.name + " Dashboard"
                      : "Platform Overview"}
                  </h1>
                  <p className="text-gray-400">
                    {viewAsManager ? "Manager View" : "Super Admin View"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {selectedWilaya && (
                  <button
                    onClick={() => setSelectedWilaya(null)}
                    className="px-6 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all"
                  >
                    Back to Overview
                  </button>
                )}
                <button
                  onClick={fetchDashboardData}
                  className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all"
                  title="Refresh"
                >
                  <FaSync className="text-white" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 lg: p-8 space-y-8">
          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="backdrop-blur-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl p-6 border border-blue-500/30">
              <FaStore className="text-4xl text-blue-400 mb-4" />
              <div className="text-4xl font-black text-white mb-2">
                {totalStats.restaurants}
              </div>
              <div className="text-gray-400 font-semibold">
                Total Restaurants
              </div>
            </div>

            <div className="backdrop-blur-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-purple-500/30">
              <FaEye className="text-4xl text-purple-400 mb-4" />
              <div className="text-4xl font-black text-white mb-2">
                {totalStats.views.toLocaleString()}
              </div>
              <div className="text-gray-400 font-semibold">Total Views</div>
            </div>

            <div className="backdrop-blur-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl p-6 border border-yellow-500/30">
              <FaQrcode className="text-4xl text-yellow-400 mb-4" />
              <div className="text-4xl font-black text-white mb-2">
                {totalStats.scans.toLocaleString()}
              </div>
              <div className="text-gray-400 font-semibold">QR Scans</div>
            </div>
          </div>

          {/* Wilayas Overview */}
          {!viewAsManager && !selectedWilaya && (
            <div className="backdrop-blur-xl bg-white/5 rounded-3xl p-8 border border-white/10">
              <h2 className="text-3xl font-black text-white mb-6">Wilayas</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wilayas.map((wilaya) => (
                  <div
                    key={wilaya.id}
                    onClick={() => {
                      setSelectedWilaya(wilaya.id);
                      // Find first restaurant in this wilaya for map center
                      const firstRestaurant = restaurants.find(
                        (r) => r.wilayaName === wilaya.name && r.lat && r.lng
                      );
                      if (
                        firstRestaurant &&
                        firstRestaurant.lat &&
                        firstRestaurant.lng
                      ) {
                        setMapCenter([
                          firstRestaurant.lat,
                          firstRestaurant.lng,
                        ]);
                      }
                    }}
                    className="group cursor-pointer backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-[#FFCE18] hover:scale-105 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-2">
                          {wilaya.name}
                        </h3>
                        <p className="text-sm text-gray-400">
                          Code: {wilaya.code}
                        </p>
                        {wilaya.managerUsername && (
                          <p className="text-sm text-gray-500">
                            Manager: {wilaya.managerUsername}
                          </p>
                        )}
                      </div>
                      <div className="text-4xl">📍</div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white/5 rounded-xl p-3">
                        <div className="text-xl font-black text-[#FFCE18]">
                          {wilaya.restaurantsCount}
                        </div>
                        <div className="text-xs text-gray-500">Restaurants</div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3">
                        <div className="text-xl font-black text-purple-400">
                          {wilaya.totalViews.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">Views</div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3">
                        <div className="text-xl font-black text-yellow-400">
                          {wilaya.totalScans.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">Scans</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Map - Full Width */}
          <div className="backdrop-blur-xl bg-white/5 rounded-3xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-black text-white">
                Restaurants Map
              </h2>
              <span className="px-4 py-2 rounded-full bg-[#FFCE18]/20 text-[#FFCE18] font-bold text-sm">
                {visibleRestaurants.filter((r) => r.lat && r.lng).length}{" "}
                locations
              </span>
            </div>
            <div className="h-[700px] rounded-2xl overflow-hidden border-2 border-white/10">
              <MapContainer
                center={mapCenter}
                zoom={viewAsManager || selectedWilaya ? 13 : 6}
                className="h-full w-full"
                zoomControl={true}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapUpdater center={mapCenter} />
                {visibleRestaurants
                  .filter((rest) => rest.lat && rest.lng)
                  .map((rest) => (
                    <Marker
                      key={rest.id}
                      position={[rest.lat!, rest.lng!]}
                      icon={createCustomIcon()}
                    >
                      <Popup>
                        <div className="p-4">
                          <h4 className="text-lg font-bold text-gray-900 mb-2">
                            {rest.name}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            {rest.wilayaName}
                          </p>
                          <span
                            className={`text-xs font-bold ${
                              rest.status === "ACTIVE"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {rest.status === "ACTIVE"
                              ? "✓ Active"
                              : "✗ Inactive"}
                          </span>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
              </MapContainer>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .leaflet-popup-content-wrapper {
          background: white;
          border-radius: 16px;
          padding: 0;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        }
        .leaflet-popup-content {
          margin: 0;
        }
        .leaflet-popup-tip {
          background: white;
        }
        .custom-marker {
          background: transparent;
          border: none;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
