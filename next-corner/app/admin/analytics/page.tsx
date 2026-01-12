"use client";

import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  FaDownload,
  FaCalendarAlt,
  FaTrophy,
  FaChartLine,
  FaSortUp,
  FaSortDown,
  FaMapMarkedAlt,
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

// Fake Data
const wilayasData = [
  {
    id: "tiaret",
    name: "Tiaret",
    restaurants: 5,
    views: 18500,
    scans: 6200,
    mapClicks: 4100,
    growth: 12,
    lat: 35.3709,
    lng: 1.3219,
  },
  {
    id: "sidi-bel-abbes",
    name: "Sidi Bel Abbès",
    restaurants: 4,
    views: 15200,
    scans: 5100,
    mapClicks: 3400,
    growth: 8,
    lat: 35.2106,
    lng: -0.63,
  },
];

const monthlyData = [
  { month: "Jan", tiaret: 2800, sba: 2400 },
  { month: "Feb", tiaret: 3200, sba: 2800 },
  { month: "Mar", tiaret: 3800, sba: 3100 },
  { month: "Apr", tiaret: 4200, sba: 3600 },
  { month: "May", tiaret: 5100, sba: 4200 },
  { month: "Jun", tiaret: 4800, sba: 3900 },
];

const topRestaurants = [
  {
    id: "rest2",
    name: "Burger House",
    wilaya: "Tiaret",
    views: 4500,
    scans: 1500,
  },
  {
    id: "rest4",
    name: "Shawarma Corner",
    wilaya: "Tiaret",
    views: 4200,
    scans: 1400,
  },
  {
    id: "rest7",
    name: "La Table du Chef",
    wilaya: "Sidi Bel Abbès",
    views: 4100,
    scans: 1400,
  },
  {
    id: "rest8",
    name: "Ocean Grill",
    wilaya: "Sidi Bel Abbès",
    views: 3900,
    scans: 1300,
  },
  {
    id: "rest3",
    name: "Le Gourmet",
    wilaya: "Tiaret",
    views: 3800,
    scans: 1300,
  },
];

const allRestaurants = [
  {
    id: "rest1",
    name: "Pizza Palace",
    wilaya: "Tiaret",
    lat: 35.3709,
    lng: 1.3219,
    views: 3200,
  },
  {
    id: "rest2",
    name: "Burger House",
    wilaya: "Tiaret",
    lat: 35.375,
    lng: 1.318,
    views: 4500,
  },
  {
    id: "rest3",
    name: "Le Gourmet",
    wilaya: "Tiaret",
    lat: 35.368,
    lng: 1.325,
    views: 3800,
  },
  {
    id: "rest4",
    name: "Shawarma Corner",
    wilaya: "Tiaret",
    lat: 35.373,
    lng: 1.328,
    views: 4200,
  },
  {
    id: "rest5",
    name: "Sushi Zen",
    wilaya: "Tiaret",
    lat: 35.369,
    lng: 1.32,
    views: 2800,
  },
  {
    id: "rest6",
    name: "Bella Vista",
    wilaya: "Sidi Bel Abbès",
    lat: 35.2106,
    lng: -0.63,
    views: 3600,
  },
  {
    id: "rest7",
    name: "La Table du Chef",
    wilaya: "Sidi Bel Abbès",
    lat: 35.215,
    lng: -0.635,
    views: 4100,
  },
  {
    id: "rest8",
    name: "Ocean Grill",
    wilaya: "Sidi Bel Abbès",
    lat: 35.208,
    lng: -0.628,
    views: 3900,
  },
  {
    id: "rest9",
    name: "Café Parisien",
    wilaya: "Sidi Bel Abbès",
    lat: 35.213,
    lng: -0.632,
    views: 3600,
  },
];

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
        background:  linear-gradient(135deg, #FFCE18 0%, #ffd94d 100%);
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(255, 206, 24, 0.6);
        position: relative;
      ">
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
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
  const [viewAsManager, setViewAsManager] = useState(false);
  const [selectedWilayas, setSelectedWilayas] = useState<string[]>([
    "tiaret",
    "sidi-bel-abbes",
  ]);
  const [dateRange, setDateRange] = useState("last30days");
  const [sortField, setSortField] = useState<"views" | "scans" | "growth">(
    "views"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [mapCenter, setMapCenter] = useState<[number, number]>([36.0, 3.0]);

  const filteredWilayas = viewAsManager
    ? wilayasData.filter((w) => w.id === "tiaret")
    : wilayasData.filter((w) => selectedWilayas.includes(w.id));

  const filteredRestaurants = viewAsManager
    ? allRestaurants.filter((r) => r.wilaya === "Tiaret")
    : selectedWilayas.length > 0
    ? allRestaurants.filter((r) =>
        selectedWilayas.some(
          (wid) => wilayasData.find((w) => w.id === wid)?.name === r.wilaya
        )
      )
    : allRestaurants;

  const totalStats = {
    restaurants: filteredWilayas.reduce((sum, w) => sum + w.restaurants, 0),
    views: filteredWilayas.reduce((sum, w) => sum + w.views, 0),
    scans: filteredWilayas.reduce((sum, w) => sum + w.scans, 0),
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
    const aVal = a[sortField];
    const bVal = b[sortField];
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

  const exportCSV = () => {
    const csv = [
      ["Wilaya", "Restaurants", "Views", "Scans", "Map Clicks", "Growth %"],
      ...filteredWilayas.map((w) => [
        w?.name,
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
    a.download = "analytics-report.csv";
    a.click();
  };

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
                <div className="flex gap-2">
                  {wilayasData.map((wilaya) => (
                    <button
                      key={wilaya.id}
                      onClick={() => toggleWilaya(wilaya.id)}
                      className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all ${
                        selectedWilayas.includes(wilaya.id)
                          ? "bg-[#FFCE18]/20 border-2 border-[#FFCE18] text-[#FFCE18]"
                          : "bg-white/5 border-2 border-white/10 text-white hover:bg-white/10"
                      }`}
                    >
                      {wilaya?.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Export */}
            <div className="flex items-end">
              <button
                onClick={exportCSV}
                className="w-full px-6 py-3 rounded-xl bg-blue-500/20 border border-blue-500 text-blue-400 font-bold hover:bg-blue-500/30 transition-all flex items-center justify-center gap-2"
              >
                <FaDownload /> Export CSV
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
              <BarChart
                data={filteredWilayas.map((w) => ({
                  name: w?.name,
                  Views: w.views,
                  Scans: w.scans,
                }))}
              >
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

          {/* Growth Trends */}
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10">
            <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
              <FaChartLine className="text-[#FFCE18]" />
              Growth Trends
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
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
                <Legend />
                <Line
                  type="monotone"
                  dataKey="tiaret"
                  stroke="#FFCE18"
                  strokeWidth={3}
                  name="Tiaret"
                />
                <Line
                  type="monotone"
                  dataKey="sba"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  name="Sidi Bel Abbès"
                />
              </LineChart>
            </ResponsiveContainer>
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
            <div className="space-y-3">
              {topRestaurants
                .filter((r) => !viewAsManager || r.wilaya === "Tiaret")
                .slice(0, 5)
                .map((rest, idx) => (
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
                      <div className="text-white font-bold">{rest?.name}</div>
                      <div className="text-sm text-gray-400">{rest.wilaya}</div>
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
                {filteredRestaurants.map((rest) => {
                  const size = Math.max(
                    20,
                    Math.min(50, (rest.views / 5000) * 50)
                  );
                  return (
                    <Marker
                      key={rest.id}
                      position={[rest.lat, rest.lng]}
                      icon={createCustomIcon(size)}
                    >
                      <Popup>
                        <div className="p-4">
                          <h4 className="text-lg font-bold text-gray-900 mb-2">
                            {rest?.name}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            {rest.wilaya}
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
                  <th
                    onClick={() => toggleSort("growth")}
                    className="text-left p-4 text-white font-bold cursor-pointer hover:bg-white/5"
                  >
                    <div className="flex items-center gap-2">
                      Growth %
                      {sortField === "growth" &&
                        (sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />)}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedWilayas.map((wilaya) => (
                  <tr
                    key={wilaya.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-all"
                  >
                    <td className="p-4 text-white font-bold">{wilaya?.name}</td>
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
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full font-bold text-sm ${
                          wilaya.growth >= 10
                            ? "bg-green-500/20 text-green-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        +{wilaya.growth}%
                      </span>
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
      `}</style>
    </AdminLayout>
  );
}
