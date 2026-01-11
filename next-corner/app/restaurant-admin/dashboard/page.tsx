"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  FaEye,
  FaMapMarkerAlt,
  FaQrcode,
  FaEdit,
  FaDownload,
  FaSync,
  FaPrint,
  FaChartLine,
  FaClock,
  FaUsers,
  FaTimes,
  FaExclamationTriangle,
  FaCheckCircle,
  FaLink,
  FaTrash,
  FaChevronDown,
  FaChevronUp,
  FaCalendarAlt,
  FaTrophy,
  FaUtensils,
  FaSignOutAlt,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import QRCode from "qrcode";
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

// Fake Restaurant Data
const restaurantData = {
  id: "rest1",
  name: "Le Gourmet Palace",
  location: {
    lat: 35.3709,
    lng: 1.3219,
    address: "15 Rue de la Liberté, Tiaret",
  },
  qrCode: {
    currentLink: "https://corner.dz/menu/le-gourmet-palace",
    generatedDate: "2025-01-10",
    scans: 1247,
  },
};

// Fake Analytics Data
const statsData = {
  totalMenuViews: 3542,
  mapClicks: 856,
  qrScans: 1247,
  todayViews: 142,
};

const viewsOverTime = [
  { date: "Jan 1", views: 120 },
  { date: "Jan 2", views: 150 },
  { date: "Jan 3", views: 180 },
  { date: "Jan 4", views: 160 },
  { date: "Jan 5", views: 200 },
  { date: "Jan 6", views: 190 },
  { date: "Jan 7", views: 220 },
];

const peakHours = [
  { hour: "08:00", orders: 5 },
  { hour: "10:00", orders: 12 },
  { hour: "12:00", orders: 45 },
  { hour: "14:00", orders: 38 },
  { hour: "16:00", orders: 15 },
  { hour: "18:00", orders: 28 },
  { hour: "20:00", orders: 52 },
  { hour: "22:00", orders: 30 },
];

const trafficSources = [
  { name: "QR Code", value: 1247, color: "#FFCE18" },
  { name: "Map", value: 856, color: "#3B82F6" },
  { name: "Direct", value: 1439, color: "#10B981" },
];

// Monthly Stats (2024)
const monthlyStats = [
  { month: "Jan", views: 2850, scans: 980, mapClicks: 650 },
  { month: "Feb", views: 3200, scans: 1100, mapClicks: 720 },
  { month: "Mar", views: 3800, scans: 1250, mapClicks: 850 },
  { month: "Apr", views: 4200, scans: 1400, mapClicks: 920 },
  { month: "May", views: 5100, scans: 1680, mapClicks: 1150 },
  { month: "Jun", views: 5800, scans: 1920, mapClicks: 1280 },
  { month: "Jul", views: 6200, scans: 2050, mapClicks: 1380 },
  { month: "Aug", views: 5900, scans: 1950, mapClicks: 1320 },
  { month: "Sep", views: 5400, scans: 1780, mapClicks: 1200 },
  { month: "Oct", views: 4900, scans: 1620, mapClicks: 1090 },
  { month: "Nov", views: 4300, scans: 1420, mapClicks: 950 },
  { month: "Dec", views: 5500, scans: 1820, mapClicks: 1220 },
];

// Yearly Comparison
const yearlyComparison = [
  { year: "2022", views: 38500, scans: 12800, mapClicks: 8650 },
  { year: "2023", views: 48200, scans: 16100, mapClicks: 10890 },
  { year: "2024", views: 57200, scans: 18970, mapClicks: 12730 },
];

// Location Picker Component
function LocationPicker({ position, setPosition }: any) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return position ? <Marker position={position} /> : null;
}

export default function RestaurantDashboard() {
  const router = useRouter();
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [showQRModal, setShowQRModal] = useState(false);
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [showUpdateLinkModal, setShowUpdateLinkModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showAdvancedStats, setShowAdvancedStats] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const [newQRLink, setNewQRLink] = useState(restaurantData.qrCode.currentLink);
  const [location, setLocation] = useState<[number, number]>([
    restaurantData.location.lat,
    restaurantData.location.lng,
  ]);
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });

  const showAlert = (type: "success" | "error", message: string) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: "", message: "" }), 3000);
  };

  // Generate QR Code
  useEffect(() => {
    QRCode.toDataURL(restaurantData.qrCode.currentLink, {
      width: 400,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    }).then(setQrCodeDataUrl);
  }, []);

  const handleDownloadQR = () => {
    const link = document.createElement("a");
    link.href = qrCodeDataUrl;
    link.download = `${restaurantData.name}-QR-Code.png`;
    link.click();
    showAlert("success", "QR Code downloaded successfully!");
  };

  const handlePrintQR = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Code - ${restaurantData.name}</title>
            <style>
              body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: Arial; }
              img { width: 400px; height: 400px; }
              h2 { margin-top: 20px; }
              p { color: #666; }
            </style>
          </head>
          <body>
            <img src="${qrCodeDataUrl}" alt="QR Code" />
            <h2>${restaurantData.name}</h2>
            <p>Scan to view our menu</p>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleRegenerateQR = () => {
    if (confirmName.toLowerCase() !== restaurantData.name.toLowerCase()) {
      showAlert("error", "Restaurant name doesn't match!");
      return;
    }
    showAlert(
      "success",
      "QR Code regenerated successfully!  Old QR code is now deactivated."
    );
    setShowRegenerateModal(false);
    setConfirmName("");
  };

  const handleUpdateLink = () => {
    if (!newQRLink.trim()) {
      showAlert("error", "Please enter a valid link");
      return;
    }
    showAlert("success", "QR Code link updated successfully!");
    setShowUpdateLinkModal(false);
  };

  const handleUpdateLocation = () => {
    showAlert("success", "Location updated successfully!");
    setShowLocationModal(false);
  };

  // Find best performing month
  const bestMonth = monthlyStats.reduce((prev, current) =>
    prev.views > current.views ? prev : current
  );

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
                {restaurantData.name}
              </h1>
              <p className="text-gray-400">Restaurant Dashboard</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push(`/menu/${restaurantData.id}`)}
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
                onClick={() => router.push("/login")}
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
                +12% today
              </span>
            </div>
            <div className="text-4xl font-black text-white mb-2">
              {statsData.totalMenuViews.toLocaleString()}
            </div>
            <div className="text-gray-400 font-semibold">Total Menu Views</div>
          </div>

          <div className="backdrop-blur-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-purple-500/30">
            <div className="flex items-center justify-between mb-4">
              <FaMapMarkerAlt className="text-4xl text-purple-400" />
              <span className="text-sm text-green-400 font-bold">
                +8% today
              </span>
            </div>
            <div className="text-4xl font-black text-white mb-2">
              {statsData.mapClicks.toLocaleString()}
            </div>
            <div className="text-gray-400 font-semibold">Map Clicks</div>
          </div>

          <div className="backdrop-blur-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl p-6 border border-yellow-500/30">
            <div className="flex items-center justify-between mb-4">
              <FaQrcode className="text-4xl text-yellow-400" />
              <span className="text-sm text-green-400 font-bold">
                +15% today
              </span>
            </div>
            <div className="text-4xl font-black text-white mb-2">
              {statsData.qrScans.toLocaleString()}
            </div>
            <div className="text-gray-400 font-semibold">QR Code Scans</div>
          </div>

          <div className="backdrop-blur-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl p-6 border border-green-500/30">
            <div className="flex items-center justify-between mb-4">
              <FaUsers className="text-4xl text-green-400" />
              <span className="text-sm text-green-400 font-bold">Today</span>
            </div>
            <div className="text-4xl font-black text-white mb-2">
              {statsData.todayViews}
            </div>
            <div className="text-gray-400 font-semibold">Today's Visitors</div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Views Over Time */}
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <FaChartLine className="text-2xl text-[#FFCE18]" />
              <h2 className="text-2xl font-black text-white">
                Views Over Time
              </h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={viewsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="date" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip
                  contentStyle={{
                    background: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#fff" }}
                />
                <Line
                  type="monotone"
                  dataKey="views"
                  stroke="#FFCE18"
                  strokeWidth={3}
                  dot={{ fill: "#FFCE18", r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Peak Hours */}
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <FaClock className="text-2xl text-[#FFCE18]" />
              <h2 className="text-2xl font-black text-white">Peak Hours</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={peakHours}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="hour" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip
                  contentStyle={{
                    background: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#fff" }}
                />
                <Bar dataKey="orders" fill="#FFCE18" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10">
          <h2 className="text-2xl font-black text-white mb-6">
            Traffic Sources
          </h2>
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

        {/* Advanced Stats Section (Collapsible) */}
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
          <button
            onClick={() => setShowAdvancedStats(!showAdvancedStats)}
            className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-all"
          >
            <div className="flex items-center gap-3">
              <FaCalendarAlt className="text-2xl text-[#FFCE18]" />
              <h2 className="text-2xl font-black text-white">
                Monthly & Yearly Analytics
              </h2>
            </div>
            {showAdvancedStats ? (
              <FaChevronUp className="text-white text-xl" />
            ) : (
              <FaChevronDown className="text-white text-xl" />
            )}
          </button>

          {showAdvancedStats && (
            <div className="p-6 space-y-8 animate-fade-in">
              {/* Best Month Highlight */}
              <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl p-6 border-2 border-yellow-500">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-yellow-500 flex items-center justify-center">
                    <FaTrophy className="text-3xl text-black" />
                  </div>
                  <div>
                    <div className="text-sm text-yellow-400 font-bold">
                      Best Performing Month
                    </div>
                    <div className="text-4xl font-black text-white">
                      {bestMonth.month} 2024
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-black text-white">
                      {bestMonth.views.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-400">Views</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-white">
                      {bestMonth.scans.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-400">QR Scans</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-white">
                      {bestMonth.mapClicks.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-400">Map Clicks</div>
                  </div>
                </div>
              </div>

              {/* Monthly Performance Chart */}
              <div>
                <h3 className="text-xl font-bold text-white mb-4">
                  Monthly Performance (2024)
                </h3>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={monthlyStats}>
                    <defs>
                      <linearGradient
                        id="colorViews"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#FFCE18"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#FFCE18"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="colorScans"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#3B82F6"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3B82F6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                    <XAxis dataKey="month" stroke="#fff" />
                    <YAxis stroke="#fff" />
                    <Tooltip
                      contentStyle={{
                        background: "#1f2937",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                      }}
                      labelStyle={{ color: "#fff" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="views"
                      stroke="#FFCE18"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorViews)"
                    />
                    <Area
                      type="monotone"
                      dataKey="scans"
                      stroke="#3B82F6"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorScans)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Yearly Comparison */}
              <div>
                <h3 className="text-xl font-bold text-white mb-4">
                  Yearly Growth
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={yearlyComparison}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                    <XAxis dataKey="year" stroke="#fff" />
                    <YAxis stroke="#fff" />
                    <Tooltip
                      contentStyle={{
                        background: "#1f2937",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                      }}
                      labelStyle={{ color: "#fff" }}
                    />
                    <Bar dataKey="views" fill="#FFCE18" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="scans" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                    <Bar
                      dataKey="mapClicks"
                      fill="#10B981"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Monthly Breakdown Table */}
              <div>
                <h3 className="text-xl font-bold text-white mb-4">
                  Monthly Breakdown
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left text-white font-bold p-3">
                          Month
                        </th>
                        <th className="text-right text-white font-bold p-3">
                          Views
                        </th>
                        <th className="text-right text-white font-bold p-3">
                          QR Scans
                        </th>
                        <th className="text-right text-white font-bold p-3">
                          Map Clicks
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyStats.map((stat, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-white/5 hover:bg-white/5 transition-all"
                        >
                          <td className="text-white p-3 font-semibold">
                            {stat.month}
                          </td>
                          <td className="text-right text-gray-300 p-3">
                            {stat.views.toLocaleString()}
                          </td>
                          <td className="text-right text-gray-300 p-3">
                            {stat.scans.toLocaleString()}
                          </td>
                          <td className="text-right text-gray-300 p-3">
                            {stat.mapClicks.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
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
                    {restaurantData.qrCode.currentLink}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <FaQrcode className="text-[#FFCE18]" />
                <div>
                  <span className="font-semibold text-white">
                    Total Scans:{" "}
                  </span>{" "}
                  {restaurantData.qrCode.scans.toLocaleString()}
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
                onClick={() => setShowUpdateLinkModal(true)}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-green-500/20 border border-green-500 text-green-400 font-bold hover:bg-green-500/30 transition-all"
              >
                <FaLink className="text-xl" />
                <div className="text-left">
                  <div className="font-bold text-white">Update QR Link</div>
                  <div className="text-xs text-green-300">Change menu URL</div>
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

        {/* Location Map */}
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-white flex items-center gap-3">
              <FaMapMarkerAlt className="text-[#FFCE18]" />
              Restaurant Location
            </h2>
            <button
              onClick={() => setShowLocationModal(true)}
              className="px-6 py-3 rounded-xl bg-blue-500/20 border border-blue-500 text-blue-400 font-bold hover:bg-blue-500/30 transition-all flex items-center gap-2"
            >
              <FaEdit /> Update Location
            </button>
          </div>
          <div className="h-[400px] rounded-2xl overflow-hidden border border-white/10">
            <MapContainer center={location} zoom={15} className="h-full w-full">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={location}>
                <Popup>
                  <div className="p-2">
                    <div className="font-bold">{restaurantData.name}</div>
                    <div className="text-sm text-gray-600">
                      {restaurantData.location.address}
                    </div>
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
      </div>

      {/* All Modals - Same as before but I'll keep them here for completeness */}
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
              <div className="font-bold text-white mb-2">
                {restaurantData.name}
              </div>
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
                <span className="text-white font-bold">
                  {restaurantData.name}
                </span>
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
                placeholder={restaurantData.name}
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
                  confirmName.toLowerCase() !==
                  restaurantData.name.toLowerCase()
                }
                className="flex-1 px-6 py-3 rounded-xl bg-red-500 text-white font-bold hover: bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaSync className="inline mr-2" /> Regenerate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Link Modal */}
      {showUpdateLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="bg-gradient-to-b from-gray-900 to-black rounded-3xl border border-white/10 max-w-md w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-white">Update QR Link</h3>
              <button
                onClick={() => setShowUpdateLinkModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg"
              >
                <FaTimes className="text-white" />
              </button>
            </div>
            <div className="mb-6">
              <label className="block text-white font-bold mb-2">
                Menu URL
              </label>
              <input
                type="text"
                value={newQRLink}
                onChange={(e) => setNewQRLink(e.target.value)}
                placeholder="https://corner.dz/menu/your-restaurant"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#FFCE18] focus: outline-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                This will update the link your QR code points to
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowUpdateLinkModal(false)}
                className="flex-1 px-6 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateLink}
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-[#FFCE18] to-[#ffd94d] text-black font-bold hover:scale-105 transition-all"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Location Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="bg-gradient-to-b from-gray-900 to-black rounded-3xl border border-white/10 max-w-2xl w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-white">
                Update Location
              </h3>
              <button
                onClick={() => setShowLocationModal(false)}
                className="p-2 hover: bg-white/10 rounded-lg"
              >
                <FaTimes className="text-white" />
              </button>
            </div>
            <p className="text-gray-400 mb-6">
              Click on the map to update your restaurant location
            </p>
            <div className="h-[400px] rounded-2xl overflow-hidden border border-white/10 mb-6">
              <MapContainer
                center={location}
                zoom={15}
                className="h-full w-full"
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationPicker position={location} setPosition={setLocation} />
              </MapContainer>
            </div>
            <div className="text-sm text-gray-400 mb-6">
              Selected: {location[0].toFixed(6)}, {location[1].toFixed(6)}
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowLocationModal(false)}
                className="flex-1 px-6 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateLocation}
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-[#FFCE18] to-[#ffd94d] text-black font-bold hover:scale-105 transition-all"
              >
                Save Location
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
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
