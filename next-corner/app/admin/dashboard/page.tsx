"use client";

import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  FaStore,
  FaEye,
  FaQrcode,
  FaMapMarkerAlt,
  FaUsers,
  FaChartLine,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaShieldAlt,
  FaUserTie,
  FaToggleOn,
  FaToggleOff,
  FaCog,
  FaChartBar,
  FaMapMarkedAlt,
  FaCheckCircle,
  FaClock,
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
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Fake Data
const wilayasData = [
  {
    id: "tiaret",
    name: "Tiaret",
    code: "14",
    restaurantCount: 5,
    totalViews: 18500,
    totalScans: 6200,
    mapClicks: 4100,
    lat: 35.3709,
    lng: 1.3219,
    manager: "Mohamed Amine",
  },
  {
    id: "sidi-bel-abbes",
    name: "Sidi Bel Abbès",
    code: "22",
    restaurantCount: 4,
    totalViews: 15200,
    totalScans: 5100,
    mapClicks: 3400,
    lat: 35.2106,
    lng: -0.63,
    manager: "Fatima Zohra",
  },
];

const allRestaurants = [
  {
    id: "rest1",
    name: "Pizza Palace",
    wilaya: "Tiaret",
    lat: 35.3709,
    lng: 1.3219,
    status: "active",
  },
  {
    id: "rest2",
    name: "Burger House",
    wilaya: "Tiaret",
    lat: 35.375,
    lng: 1.318,
    status: "active",
  },
  {
    id: "rest3",
    name: "Le Gourmet",
    wilaya: "Tiaret",
    lat: 35.368,
    lng: 1.325,
    status: "active",
  },
  {
    id: "rest4",
    name: "Shawarma Corner",
    wilaya: "Tiaret",
    lat: 35.373,
    lng: 1.328,
    status: "active",
  },
  {
    id: "rest5",
    name: "Sushi Zen",
    wilaya: "Tiaret",
    lat: 35.369,
    lng: 1.32,
    status: "inactive",
  },
  {
    id: "rest6",
    name: "Bella Vista",
    wilaya: "Sidi Bel Abbès",
    lat: 35.2106,
    lng: -0.63,
    status: "active",
  },
  {
    id: "rest7",
    name: "La Table du Chef",
    wilaya: "Sidi Bel Abbès",
    lat: 35.215,
    lng: -0.635,
    status: "active",
  },
  {
    id: "rest8",
    name: "Ocean Grill",
    wilaya: "Sidi Bel Abbès",
    lat: 35.208,
    lng: -0.628,
    status: "active",
  },
  {
    id: "rest9",
    name: "Café Parisien",
    wilaya: "Sidi Bel Abbès",
    lat: 35.213,
    lng: -0.632,
    status: "active",
  },
];

const recentActivity = [
  {
    id: 1,
    type: "restaurant_created",
    restaurant: "Pizza Palace",
    wilaya: "Tiaret",
    time: "2 hours ago",
  },
  {
    id: 2,
    type: "menu_updated",
    restaurant: "Bella Vista",
    wilaya: "Sidi Bel Abbès",
    time: "5 hours ago",
  },
  {
    id: 3,
    type: "qr_generated",
    restaurant: "Burger House",
    wilaya: "Tiaret",
    time: "1 day ago",
  },
  {
    id: 4,
    type: "restaurant_activated",
    restaurant: "Le Gourmet",
    wilaya: "Tiaret",
    time: "2 days ago",
  },
  {
    id: 5,
    type: "user_created",
    restaurant: "Ocean Grill",
    wilaya: "Sidi Bel Abbès",
    time: "3 days ago",
  },
];

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

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13, { animate: true });
  }, [center, map]);
  return null;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewAsManager, setViewAsManager] = useState(false);
  const [selectedWilaya, setSelectedWilaya] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([36.0, 3.0]);

  const visibleWilayas = viewAsManager
    ? wilayasData.filter((w) => w.id === "tiaret")
    : wilayasData;

  const visibleRestaurants = viewAsManager
    ? allRestaurants.filter((r) => r.wilaya === "Tiaret")
    : selectedWilaya
    ? allRestaurants.filter(
        (r) =>
          r.wilaya === wilayasData.find((w) => w.id === selectedWilaya)?.name
      )
    : allRestaurants;

  const totalStats = viewAsManager
    ? {
        restaurants: wilayasData.find((w) => w.id === "tiaret")!
          .restaurantCount,
        views: wilayasData.find((w) => w.id === "tiaret")!.totalViews,
        scans: wilayasData.find((w) => w.id === "tiaret")!.totalScans,
      }
    : {
        restaurants: wilayasData.reduce((sum, w) => sum + w.restaurantCount, 0),
        views: wilayasData.reduce((sum, w) => sum + w.totalViews, 0),
        scans: wilayasData.reduce((sum, w) => sum + w.totalScans, 0),
      };

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
                className="p-2 rounded-lg hover:bg-white/10 transition-all"
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
                      {viewAsManager ? "Manager" : "Super Admin"}
                    </div>
                    {viewAsManager && (
                      <div className="text-xs text-gray-500">Tiaret</div>
                    )}
                  </div>
                </div>
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
              {!viewAsManager && (
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
                onClick={() => router.push("/admin/login")}
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
                      ? wilayasData.find((w) => w.id === selectedWilaya)?.name +
                        " Dashboard"
                      : viewAsManager
                      ? "Tiaret Dashboard"
                      : "Platform Overview"}
                  </h1>
                  <p className="text-gray-400">
                    {viewAsManager ? "Manager View" : "Super Admin View"}
                  </p>
                </div>
              </div>
              {selectedWilaya && (
                <button
                  onClick={() => setSelectedWilaya(null)}
                  className="px-6 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all"
                >
                  Back to Overview
                </button>
              )}
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8 space-y-8">
          {/* Stats Cards - ONLY 3 CARDS */}
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
              <div className="grid md:grid-cols-2 gap-6">
                {wilayasData.map((wilaya) => (
                  <div
                    key={wilaya.id}
                    onClick={() => {
                      setSelectedWilaya(wilaya.id);
                      setMapCenter([wilaya.lat, wilaya.lng]);
                    }}
                    className="group cursor-pointer backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-[#FFCE18] hover:scale-105 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-2">
                          {wilaya.name}
                        </h3>
                        <p className="text-sm text-gray-400">
                          Manager: {wilaya.manager}
                        </p>
                      </div>
                      <div className="text-4xl">📍</div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white/5 rounded-xl p-3">
                        <div className="text-xl font-black text-[#FFCE18]">
                          {wilaya.restaurantCount}
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

          {/* Map & Activity */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Map */}
            <div className="lg:col-span-2 backdrop-blur-xl bg-white/5 rounded-3xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-black text-white">
                  Restaurants Map
                </h2>
                <span className="px-4 py-2 rounded-full bg-[#FFCE18]/20 text-[#FFCE18] font-bold text-sm">
                  {visibleRestaurants.length} locations
                </span>
              </div>
              <div className="h-[600px] rounded-2xl overflow-hidden border-2 border-white/10">
                <MapContainer
                  center={mapCenter}
                  zoom={viewAsManager || selectedWilaya ? 13 : 6}
                  className="h-full w-full"
                  zoomControl={true}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <MapUpdater center={mapCenter} />
                  {visibleRestaurants.map((rest) => (
                    <Marker
                      key={rest.id}
                      position={[rest.lat, rest.lng]}
                      icon={createCustomIcon()}
                    >
                      <Popup>
                        <div className="p-4">
                          <h4 className="text-lg font-bold text-gray-900 mb-2">
                            {rest.name}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            {rest.wilaya}
                          </p>
                          <span
                            className={`text-xs font-bold ${
                              rest.status === "active"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {rest.status === "active"
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

            {/* Recent Activity */}
            <div className="backdrop-blur-xl bg-white/5 rounded-3xl p-6 border border-white/10">
              <h2 className="text-2xl font-black text-white mb-6">
                Recent Activity
              </h2>
              <div className="space-y-3">
                {recentActivity
                  .filter(
                    (activity) => !viewAsManager || activity.wilaya === "Tiaret"
                  )
                  .map((activity) => (
                    <div
                      key={activity.id}
                      className="bg-white/5 rounded-xl p-4 border border-white/10"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#FFCE18]/20 flex items-center justify-center flex-shrink-0">
                          {activity.type === "restaurant_created" && (
                            <FaStore className="text-[#FFCE18]" />
                          )}
                          {activity.type === "menu_updated" && (
                            <FaCog className="text-blue-400" />
                          )}
                          {activity.type === "qr_generated" && (
                            <FaQrcode className="text-yellow-400" />
                          )}
                          {activity.type === "restaurant_activated" && (
                            <FaCheckCircle className="text-green-400" />
                          )}
                          {activity.type === "user_created" && (
                            <FaUsers className="text-purple-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-bold text-sm mb-1">
                            {activity.type
                              .replace(/_/g, " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </div>
                          <div className="text-gray-400 text-sm">
                            {activity.restaurant}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-[#FFCE18]">
                              {activity.wilaya}
                            </span>
                            <span className="text-xs text-gray-500">
                              • {activity.time}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
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
      `}</style>
    </div>
  );
}
