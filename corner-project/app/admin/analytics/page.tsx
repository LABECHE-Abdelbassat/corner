"use client";

import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  FaDownload,
  FaTrophy,
  FaChartLine,
  FaSortUp,
  FaSortDown,
  FaMapMarkedAlt,
  FaSpinner,
  FaSync,
} from "react-icons/fa";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

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

// ==================== INTERFACES ====================
interface Wilaya {
  id: string;
  name: string;
  code: string;
  restaurants: number;
  views: number;
  scans: number;
  mapClicks: number;
  growth: number;
}

interface Restaurant {
  id: string;
  name: string;
  wilayaName: string;
  lat: number | null;
  lng: number | null;
  views: number;
  scans: number;
}

// ==================== HELPER FUNCTIONS ====================
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 7, { animate: true });
  }, [center, map]);
  return null;
}

const createCustomIcon = (size: number) => {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: linear-gradient(135deg, #FFCE18 0%, #ffd94d 100%);
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(255, 206, 24, 0.6);
        position: relative;
      ">
        <div style="
          position: absolute;
          top: 50%;
          left:  50%;
          transform: translate(-50%, -50%) rotate(45deg);
          width: ${size / 4}px;
          height: ${size / 4}px;
          background: white;
          border-radius: 50%;
        "></div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
};

export default function AnalyticsPage() {
  const router = useRouter();

  // State
  const [loading, setLoading] = useState(true);
  const [viewAsManager, setViewAsManager] = useState(false);
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedWilayas, setSelectedWilayas] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState("last30days");
  const [sortField, setSortField] = useState<"views" | "scans" | "growth">(
    "views"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [mapCenter, setMapCenter] = useState<[number, number]>([36.0, 3.0]);

  // ==================== FETCH DATA ====================
  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
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
      if (String(user.role) === "MANAGER") {
        setViewAsManager(true);
      }

      // Fetch wilayas with stats
      const wilayasResponse = await fetch("/api/admin/wilayas", {
        credentials: "include",
      });
      const wilayasData = await wilayasResponse.json();

      if (wilayasData.success) {
        const wilayasList = wilayasData.data.wilayas.map((w: any) => ({
          id: String(w.id || ""),
          name: String(w.name || ""),
          code: String(w.code || ""),
          restaurants: Number(w._count?.restaurants || 0),
          views: Number(w.stats?.totalViews || 0),
          scans: Number(w.stats?.totalScans || 0),
          mapClicks: Number(w.stats?.totalMapClicks || 0),
          growth: 0, // Calculate if you have historical data
        }));

        setWilayas(wilayasList);

        // Set initial selection
        if (String(user.role) === "MANAGER" && user.wilayaId) {
          setSelectedWilayas([String(user.wilayaId)]);
        } else {
          setSelectedWilayas(wilayasList.map((w: Wilaya) => w.id));
        }
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
            wilayaName: String(r.wilaya?.name || ""),
            lat: r.lat ? Number(r.lat) : null,
            lng: r.lng ? Number(r.lng) : null,
            views: Number(r.stats?.totalViews || 0),
            scans: Number(r.stats?.totalScans || 0),
          }))
        );
      }
    } catch (err) {
      console.error("Fetch analytics data error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ==================== COMPUTED VALUES ====================
  const filteredWilayas = viewAsManager
    ? wilayas.filter((w) => selectedWilayas.includes(w.id))
    : wilayas.filter((w) => selectedWilayas.includes(w.id));

  const filteredRestaurants = restaurants.filter((r) =>
    selectedWilayas.some(
      (wid) => wilayas.find((w) => w.id === wid)?.name === r.wilayaName
    )
  );

  const totalStats = {
    restaurants: filteredWilayas.reduce(
      (sum, w) => sum + (w.restaurants || 0),
      0
    ),
    views: filteredWilayas.reduce((sum, w) => sum + (w.views || 0), 0),
    scans: filteredWilayas.reduce((sum, w) => sum + (w.scans || 0), 0),
  };

  const toggleWilaya = (wilayaId: string) => {
    if (selectedWilayas.includes(wilayaId)) {
      if (selectedWilayas.length > 1) {
        setSelectedWilayas(selectedWilayas.filter((id) => id !== wilayaId));
      }
    } else {
      setSelectedWilayas([...selectedWilayas, wilayaId]);
    }
  };

  const sortedWilayas = [...filteredWilayas].sort((a, b) => {
    const aVal = Number(a[sortField] || 0);
    const bVal = Number(b[sortField] || 0);
    return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
  });

  const toggleSort = (field: "views" | "scans" | "growth") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const topRestaurants = [...restaurants]
    .filter((r) =>
      selectedWilayas.some(
        (wid) => wilayas.find((w) => w.id === wid)?.name === r.wilayaName
      )
    )
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);

  const exportCSV = () => {
    const csv = [
      ["Wilaya", "Restaurants", "Views", "Scans", "Map Clicks", "Growth %"],
      ...filteredWilayas.map((w) => [
        w.name,
        w.restaurants,
        w.views,
        w.scans,
        w.mapClicks,
        `${w.growth}%`,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-report-${Date.now()}.csv`;
    a.click();
  };

  // Prepare chart data
  const comparisonChartData = filteredWilayas.map((w) => ({
    name: w.name,
    Views: w.views,
    Scans: w.scans,
  }));

  // ==================== RENDER ====================
  if (loading) {
    return (
      <AdminLayout
        viewAsManager={viewAsManager}
        setViewAsManager={setViewAsManager}
        title="Platform Analytics"
        subtitle="Loading..."
      >
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <FaSpinner className="w-16 h-16 text-[#FFCE18] animate-spin mx-auto mb-4" />
            <p className="text-white text-xl font-bold">
              Loading analytics...{" "}
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      viewAsManager={viewAsManager}
      setViewAsManager={setViewAsManager}
      title="Platform Analytics"
      subtitle="Comprehensive data and insights"
    >
      <div className="p-4 lg:p-8">
        {/* Filters */}
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10 mb-8">
          <div className="grid lg:grid-cols-4 gap-4">
            {/* Date Range */}
            <div>
              <label className="block text-white font-bold mb-2 text-sm">
                Date Range
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#FFCE18] focus: outline-none"
              >
                <option value="last7days">Last 7 Days</option>
                <option value="last30days">Last 30 Days</option>
                <option value="last3months">Last 3 Months</option>
                <option value="lastyear">Last Year</option>
              </select>
            </div>

            {/* Wilaya Filter */}
            {!viewAsManager && (
              <div className="lg:col-span-2">
                <label className="block text-white font-bold mb-2 text-sm">
                  Compare Wilayas
                </label>
                <div className="flex gap-2 flex-wrap">
                  {wilayas.map((wilaya) => (
                    <button
                      key={wilaya.id}
                      onClick={() => toggleWilaya(wilaya.id)}
                      className={`px-4 py-3 rounded-xl font-bold transition-all ${
                        selectedWilayas.includes(wilaya.id)
                          ? "bg-[#FFCE18]/20 border-2 border-[#FFCE18] text-[#FFCE18]"
                          : "bg-white/5 border-2 border-white/10 text-white hover:bg-white/10"
                      }`}
                    >
                      {wilaya.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Export & Refresh */}
            <div className="flex items-end gap-2">
              <button
                onClick={fetchAnalyticsData}
                className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all"
                title="Refresh"
              >
                <FaSync className="text-white" />
              </button>
              <button
                onClick={exportCSV}
                className="flex-1 px-6 py-3 rounded-xl bg-blue-500/20 border border-blue-500 text-blue-400 font-bold hover:bg-blue-500/30 transition-all flex items-center justify-center gap-2"
              >
                <FaDownload /> Export
              </button>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="backdrop-blur-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl p-6 border border-blue-500/30">
            <div className="text-5xl mb-4">🏪</div>
            <div className="text-4xl font-black text-white mb-2">
              {totalStats.restaurants}
            </div>
            <div className="text-gray-400 font-semibold">Total Restaurants</div>
          </div>

          <div className="backdrop-blur-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-purple-500/30">
            <div className="text-5xl mb-4">👁️</div>
            <div className="text-4xl font-black text-white mb-2">
              {totalStats.views.toLocaleString()}
            </div>
            <div className="text-gray-400 font-semibold">Total Views</div>
          </div>

          <div className="backdrop-blur-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl p-6 border border-yellow-500/30">
            <div className="text-5xl mb-4">🔍</div>
            <div className="text-4xl font-black text-white mb-2">
              {totalStats.scans.toLocaleString()}
            </div>
            <div className="text-gray-400 font-semibold">Total Scans</div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Wilaya Comparison */}
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10">
            <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
              <FaChartLine className="text-[#FFCE18]" />
              Wilaya Comparison
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="name" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip
                  contentStyle={{
                    background: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#fff" }}
                />
                <Legend />
                <Bar dataKey="Views" fill="#FFCE18" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Scans" fill="#3B82F6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Performance Overview */}
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10">
            <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
              <FaChartLine className="text-[#FFCE18]" />
              Performance Overview
            </h2>
            <div className="space-y-4">
              {filteredWilayas.map((wilaya) => (
                <div key={wilaya.id} className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-bold">{wilaya.name}</span>
                    <span className="text-[#FFCE18] font-bold">
                      {wilaya.views.toLocaleString()} views
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-[#FFCE18] to-[#ffd94d] h-2 rounded-full"
                      style={{
                        width: `${
                          (wilaya.views /
                            Math.max(...filteredWilayas.map((w) => w.views))) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Restaurants & Map */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Top Restaurants */}
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10">
            <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
              <FaTrophy className="text-[#FFCE18]" />
              Top Restaurants
            </h2>
            {topRestaurants.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                No restaurants found
              </div>
            ) : (
              <div className="space-y-3">
                {topRestaurants.map((rest, idx) => (
                  <div
                    key={rest.id}
                    className="flex items-center gap-4 bg-white/5 rounded-xl p-4 border border-white/10"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${
                        idx === 0
                          ? "bg-yellow-500 text-black"
                          : idx === 1
                          ? "bg-gray-400 text-black"
                          : idx === 2
                          ? "bg-orange-600 text-white"
                          : "bg-white/10 text-white"
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-bold">{rest.name}</div>
                      <div className="text-sm text-gray-400">
                        {rest.wilayaName}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[#FFCE18] font-black">
                        {rest.views.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">views</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Heatmap */}
          <div className="lg:col-span-2 backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10">
            <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
              <FaMapMarkedAlt className="text-[#FFCE18]" />
              Restaurant Heatmap
            </h2>
            <div className="h-[400px] rounded-2xl overflow-hidden border-2 border-white/10">
              <MapContainer
                center={mapCenter}
                zoom={7}
                className="h-full w-full"
                zoomControl={true}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapUpdater center={mapCenter} />
                {filteredRestaurants
                  .filter((rest) => rest.lat && rest.lng)
                  .map((rest) => {
                    const maxViews = Math.max(
                      ...filteredRestaurants.map((r) => r.views || 0)
                    );
                    const size = Math.max(
                      20,
                      Math.min(50, ((rest.views || 0) / maxViews) * 50)
                    );
                    return (
                      <Marker
                        key={rest.id}
                        position={[rest.lat!, rest.lng!]}
                        icon={createCustomIcon(size)}
                      >
                        <Popup>
                          <div className="p-4">
                            <h4 className="text-lg font-bold text-gray-900 mb-2">
                              {rest.name}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2">
                              {rest.wilayaName}
                            </p>
                            <div className="text-[#FFCE18] font-bold">
                              {rest.views.toLocaleString()} views
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
              </MapContainer>
            </div>
          </div>
        </div>

        {/* Stats Table */}
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-2xl font-black text-white">
              Wilaya Statistics
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-white font-bold">Wilaya</th>
                  <th className="text-left p-4 text-white font-bold">
                    Restaurants
                  </th>
                  <th
                    onClick={() => toggleSort("views")}
                    className="text-left p-4 text-white font-bold cursor-pointer hover:bg-white/5"
                  >
                    <div className="flex items-center gap-2">
                      Views
                      {sortField === "views" &&
                        (sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />)}
                    </div>
                  </th>
                  <th
                    onClick={() => toggleSort("scans")}
                    className="text-left p-4 text-white font-bold cursor-pointer hover:bg-white/5"
                  >
                    <div className="flex items-center gap-2">
                      Scans
                      {sortField === "scans" &&
                        (sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />)}
                    </div>
                  </th>
                  <th className="text-left p-4 text-white font-bold">
                    Map Clicks
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedWilayas.map((wilaya) => (
                  <tr
                    key={wilaya.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-all"
                  >
                    <td className="p-4 text-white font-bold">{wilaya.name}</td>
                    <td className="p-4 text-white">{wilaya.restaurants}</td>
                    <td className="p-4 text-purple-400 font-bold">
                      {wilaya.views.toLocaleString()}
                    </td>
                    <td className="p-4 text-yellow-400 font-bold">
                      {wilaya.scans.toLocaleString()}
                    </td>
                    <td className="p-4 text-green-400 font-bold">
                      {wilaya.mapClicks.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style jsx global>{`
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
    </AdminLayout>
  );
}
