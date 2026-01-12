"use client";

import React, { useState, useEffect } from "react";
import {
  FaEye,
  FaMapMarkerAlt,
  FaQrcode,
  FaDownload,
  FaSync,
  FaPrint,
  FaChartLine,
  FaUsers,
  FaTimes,
  FaExclamationTriangle,
  FaCheckCircle,
  FaLink,
  FaUtensils,
  FaSignOutAlt,
  FaSpinner,
  FaUserCircle,
} from "react-icons/fa";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import QRCode from "qrcode";
import { useRouter } from "next/navigation";

// ==================== INTERFACES ====================
interface RestaurantStats {
  totalViews: number;
  totalScans: number;
  totalMapClicks: number;
  todayViews: number;
  todayScans: number;
  todayMapClicks: number;
}

interface Restaurant {
  id: string;
  name: string;
  slug: string;
}

interface MenuContent {
  categories: number;
  products: number;
  promotions: number;
}

export default function RestaurantDashboard() {
  const router = useRouter();

  // State
  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [stats, setStats] = useState<RestaurantStats | null>(null);
  const [menuContent, setMenuContent] = useState<MenuContent | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [showQRModal, setShowQRModal] = useState(false);
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });

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

      if (!userData.success || !userData.data.user.restaurantId) {
        router.push("/login");
        return;
      }

      const restaurantId = userData.data.user.restaurantId;

      // Get restaurant basic info
      const restResponse = await fetch(
        `/api/admin/restaurants/${restaurantId}`,
        {
          credentials: "include",
        }
      );
      const restData = await restResponse.json();

      if (restData.success) {
        setRestaurant({
          id: restData.data.restaurant.id,
          name: restData.data.restaurant.name,
          slug: restData.data.restaurant.slug,
        });

        // Generate QR Code
        const menuUrl = `${window.location.origin}/menu/${restData.data.restaurant.slug}?source=qr`;
        const qrDataUrl = await QRCode.toDataURL(menuUrl, {
          width: 400,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        });
        setQrCodeDataUrl(qrDataUrl);
      }

      // Get stats
      const statsResponse = await fetch(
        `/api/restaurants/${restaurantId}/stats`,
        {
          credentials: "include",
        }
      );
      const statsData = await statsResponse.json();

      if (statsData.success) {
        setStats({
          totalViews: statsData.data.analytics.total.views,
          totalScans: statsData.data.analytics.total.scans,
          totalMapClicks: statsData.data.analytics.total.mapClicks,
          todayViews: statsData.data.analytics.today.views,
          todayScans: statsData.data.analytics.today.scans,
          todayMapClicks: statsData.data.analytics.today.mapClicks,
        });

        setMenuContent({
          categories: statsData.data.menu.categories,
          products: statsData.data.menu.products,
          promotions: statsData.data.menu.promotions,
        });
      }
    } catch (err) {
      console.error("Fetch dashboard data error:", err);
      showAlert("error", "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type: "success" | "error", message: string) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: "", message: "" }), 3000);
  };

  // ==================== QR CODE FUNCTIONS ====================
  const handleDownloadQR = () => {
    const link = document.createElement("a");
    link.href = qrCodeDataUrl;
    link.download = `${restaurant?.name}-QR-Code.png`;
    link.click();
    showAlert("success", "QR Code downloaded successfully!");
  };

  const handlePrintQR = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Code - ${restaurant?.name}</title>
            <style>
              body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: Arial; }
              img { width: 400px; height: 400px; }
              h2 { margin-top: 20px; }
              p { color: #666; }
            </style>
          </head>
          <body>
            <img src="${qrCodeDataUrl}" alt="QR Code" />
            <h2>${restaurant?.name}</h2>
            <p>Scan to view our menu</p>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleRegenerateQR = () => {
    if (confirmName.toLowerCase() !== restaurant?.name.toLowerCase()) {
      showAlert("error", "Restaurant name doesn't match!");
      return;
    }
    // TODO: Implement QR regeneration logic with backend
    showAlert("success", "QR Code regenerated successfully!");
    setShowRegenerateModal(false);
    setConfirmName("");
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    router.push("/login");
  };

  // Calculate traffic sources from real data
  const trafficSources = stats
    ? [
        { name: "QR Code", value: stats.totalScans, color: "#FFCE18" },
        { name: "Map", value: stats.totalMapClicks, color: "#3B82F6" },
        {
          name: "Direct",
          value: Math.max(
            0,
            stats.totalViews - stats.totalScans - stats.totalMapClicks
          ),
          color: "#10B981",
        },
      ]
    : [];

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

  if (!restaurant || !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-2xl font-bold text-white mb-2">Error</h3>
          <p className="text-gray-400 mb-6">Failed to load dashboard</p>
          <button
            onClick={fetchDashboardData}
            className="px-6 py-3 rounded-xl bg-[#FFCE18] text-black font-bold hover:scale-105 transition-all"
          >
            <FaSync className="inline mr-2" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Alert */}
      {alert.show && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div
            className={`px-6 py-4 rounded-xl backdrop-blur-xl border-2 shadow-2xl ${
              alert.type === "success"
                ? "bg-green-500/20 border-green-500 text-green-100"
                : "bg-red-500/20 border-red-500 text-red-100"
            }`}
          >
            {alert.type === "success" ? (
              <FaCheckCircle className="inline mr-2" />
            ) : (
              <FaTimes className="inline mr-2" />
            )}
            {alert.message}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-black/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-white">
                {restaurant.name}
              </h1>
              <p className="text-gray-400">Restaurant Dashboard</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push(`/menu/${restaurant.slug}`)}
                className="px-4 py-2 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all flex items-center gap-2"
              >
                <FaEye /> View Menu
              </button>
              <button
                onClick={() => router.push("/restaurant-admin/menu-manager")}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#FFCE18] to-[#ffd94d] text-black font-bold hover:scale-105 transition-all flex items-center gap-2"
              >
                <FaUtensils /> Manage Menu
              </button>
              <button
                onClick={() => router.push("/restaurant-admin/profile")}
                className="p-3 rounded-full bg-white/10 hover: bg-white/20 transition-all"
                title="Profile & Settings"
              >
                <FaUserCircle className="text-white text-2xl" />
              </button>
              <button
                onClick={handleLogout}
                className="p-3 rounded-xl bg-red-500/20 border border-red-500 text-red-400 hover:bg-red-500/30 transition-all"
                title="Logout"
              >
                <FaSignOutAlt />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6">
          <div className="backdrop-blur-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl p-6 border border-blue-500/30">
            <div className="flex items-center justify-between mb-4">
              <FaEye className="text-4xl text-blue-400" />
              <span className="text-sm text-green-400 font-bold">
                +{stats.todayViews} today
              </span>
            </div>
            <div className="text-4xl font-black text-white mb-2">
              {stats.totalViews.toLocaleString()}
            </div>
            <div className="text-gray-400 font-semibold">Total Menu Views</div>
          </div>

          <div className="backdrop-blur-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-purple-500/30">
            <div className="flex items-center justify-between mb-4">
              <FaMapMarkerAlt className="text-4xl text-purple-400" />
              <span className="text-sm text-green-400 font-bold">
                +{stats.todayMapClicks} today
              </span>
            </div>
            <div className="text-4xl font-black text-white mb-2">
              {stats.totalMapClicks.toLocaleString()}
            </div>
            <div className="text-gray-400 font-semibold">Map Clicks</div>
          </div>

          <div className="backdrop-blur-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl p-6 border border-yellow-500/30">
            <div className="flex items-center justify-between mb-4">
              <FaQrcode className="text-4xl text-yellow-400" />
              <span className="text-sm text-green-400 font-bold">
                +{stats.todayScans} today
              </span>
            </div>
            <div className="text-4xl font-black text-white mb-2">
              {stats.totalScans.toLocaleString()}
            </div>
            <div className="text-gray-400 font-semibold">QR Code Scans</div>
          </div>

          <div className="backdrop-blur-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl p-6 border border-green-500/30">
            <div className="flex items-center justify-between mb-4">
              <FaUsers className="text-4xl text-green-400" />
              <span className="text-sm text-green-400 font-bold">Today</span>
            </div>
            <div className="text-4xl font-black text-white mb-2">
              {stats.todayViews}
            </div>
            <div className="text-gray-400 font-semibold">Today's Visitors</div>
          </div>
        </div>

        {/* Menu Content Stats */}
        {menuContent && (
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <FaUtensils className="text-2xl text-[#FFCE18]" />
              <h2 className="text-2xl font-black text-white">Menu Content</h2>
            </div>
            <div className="grid md: grid-cols-3 gap-6">
              <div className="bg-white/5 rounded-xl p-6 text-center">
                <div className="text-5xl font-black text-[#FFCE18] mb-2">
                  {menuContent.categories}
                </div>
                <div className="text-gray-400 font-semibold">Categories</div>
              </div>
              <div className="bg-white/5 rounded-xl p-6 text-center">
                <div className="text-5xl font-black text-[#FFCE18] mb-2">
                  {menuContent.products}
                </div>
                <div className="text-gray-400 font-semibold">Products</div>
              </div>
              <div className="bg-white/5 rounded-xl p-6 text-center">
                <div className="text-5xl font-black text-[#FFCE18] mb-2">
                  {menuContent.promotions}
                </div>
                <div className="text-gray-400 font-semibold">Promotions</div>
              </div>
            </div>
          </div>
        )}

        {/* Traffic Sources */}
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <FaChartLine className="text-2xl text-[#FFCE18]" />
            <h2 className="text-2xl font-black text-white">Traffic Sources</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={trafficSources}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {trafficSources.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col justify-center space-y-4">
              {trafficSources.map((source) => (
                <div
                  key={source.name}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ background: source.color }}
                    ></div>
                    <span className="text-white font-bold">{source.name}</span>
                  </div>
                  <span className="text-2xl font-black text-white">
                    {source.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* QR Code Management */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* QR Code Display */}
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-white flex items-center gap-3">
                <FaQrcode className="text-[#FFCE18]" />
                QR Code
              </h2>
              <button
                onClick={() => setShowQRModal(true)}
                className="px-4 py-2 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all"
              >
                View Full
              </button>
            </div>
            <div className="bg-white p-6 rounded-2xl mb-6 flex items-center justify-center">
              {qrCodeDataUrl && (
                <img src={qrCodeDataUrl} alt="QR Code" className="w-64 h-64" />
              )}
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-sm text-gray-400">
                <FaLink className="text-[#FFCE18] mt-1" />
                <div>
                  <div className="font-semibold text-white mb-1">
                    Current Link
                  </div>
                  <div className="break-all">
                    {typeof window !== "undefined" &&
                      `${window.location.origin}/menu/${restaurant.slug}`}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <FaQrcode className="text-[#FFCE18]" />
                <div>
                  <span className="font-semibold text-white">
                    Total Scans:{" "}
                  </span>{" "}
                  {stats.totalScans.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* QR Actions */}
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10">
            <h2 className="text-2xl font-black text-white mb-6">
              QR Code Actions
            </h2>
            <div className="space-y-4">
              <button
                onClick={handleDownloadQR}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-blue-500/20 border border-blue-500 text-blue-400 font-bold hover:bg-blue-500/30 transition-all"
              >
                <FaDownload className="text-xl" />
                <div className="text-left">
                  <div className="font-bold text-white">Download QR Code</div>
                  <div className="text-xs text-blue-300">Save as PNG image</div>
                </div>
              </button>

              <button
                onClick={handlePrintQR}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-purple-500/20 border border-purple-500 text-purple-400 font-bold hover:bg-purple-500/30 transition-all"
              >
                <FaPrint className="text-xl" />
                <div className="text-left">
                  <div className="font-bold text-white">Print QR Code</div>
                  <div className="text-xs text-purple-300">Print directly</div>
                </div>
              </button>

              <button
                onClick={() => setShowRegenerateModal(true)}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-red-500/20 border border-red-500 text-red-400 font-bold hover:bg-red-500/30 transition-all"
              >
                <FaSync className="text-xl" />
                <div className="text-left">
                  <div className="font-bold text-white">Regenerate QR Code</div>
                  <div className="text-xs text-red-300">
                    ⚠️ Deactivates old QR
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Full View Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="bg-gradient-to-b from-gray-900 to-black rounded-3xl border border-white/10 max-w-md w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-white">QR Code</h3>
              <button
                onClick={() => setShowQRModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg"
              >
                <FaTimes className="text-white" />
              </button>
            </div>
            <div className="bg-white p-8 rounded-2xl mb-6">
              {qrCodeDataUrl && (
                <img src={qrCodeDataUrl} alt="QR Code" className="w-full" />
              )}
            </div>
            <div className="text-center text-gray-400 mb-6">
              <div className="font-bold text-white mb-2">{restaurant.name}</div>
              <div className="text-sm">Scan to view our menu</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleDownloadQR}
                className="px-6 py-3 rounded-xl bg-blue-500/20 border border-blue-500 text-blue-400 font-bold hover:bg-blue-500/30 transition-all"
              >
                <FaDownload className="inline mr-2" /> Download
              </button>
              <button
                onClick={handlePrintQR}
                className="px-6 py-3 rounded-xl bg-purple-500/20 border border-purple-500 text-purple-400 font-bold hover:bg-purple-500/30 transition-all"
              >
                <FaPrint className="inline mr-2" /> Print
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Regenerate QR Modal */}
      {showRegenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="bg-gradient-to-b from-gray-900 to-black rounded-3xl border-2 border-red-500 max-w-md w-full p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaExclamationTriangle className="text-3xl text-red-400" />
              </div>
              <h3 className="text-2xl font-black text-white mb-2">
                Regenerate QR Code
              </h3>
              <p className="text-red-400 font-semibold mb-4">⚠️ Danger Zone</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-6">
              <p className="text-gray-300 text-sm leading-relaxed">
                Regenerating the QR code will{" "}
                <span className="text-red-400 font-bold">
                  deactivate the old QR code
                </span>
                . All printed QR codes will stop working. To confirm, please
                type your restaurant name:{" "}
                <span className="text-white font-bold">{restaurant.name}</span>
              </p>
            </div>
            <div className="mb-6">
              <label className="block text-white font-bold mb-2">
                Type Restaurant Name
              </label>
              <input
                type="text"
                value={confirmName}
                onChange={(e) => setConfirmName(e.target.value)}
                placeholder={restaurant.name}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-red-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowRegenerateModal(false);
                  setConfirmName("");
                }}
                className="flex-1 px-6 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleRegenerateQR}
                disabled={
                  confirmName.toLowerCase() !== restaurant.name.toLowerCase()
                }
                className="flex-1 px-6 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaSync className="inline mr-2" /> Regenerate
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        . animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
