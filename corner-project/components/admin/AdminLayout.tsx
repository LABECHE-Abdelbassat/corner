"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  FaStore,
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
} from "react-icons/fa";

interface AdminLayoutProps {
  children: React.ReactNode;
  viewAsManager: boolean;
  setViewAsManager: (value: boolean) => void;
  title?: string;
  subtitle?: string;
}

export default function AdminLayout({
  children,
  viewAsManager,
  setViewAsManager,
  title,
  subtitle,
}: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path: string) =>
    pathname === path || pathname?.startsWith(path + "/");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex">
      {/* Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 lg:relative z-50">
          <div
            className="fixed inset-0 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
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
                  onClick={() => setViewAsManager(!viewAsManager)}
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  isActive("/admin/dashboard")
                    ? "bg-red-500/20 text-red-400"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <FaChartLine />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => router.push("/admin/restaurants")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  isActive("/admin/restaurants")
                    ? "bg-red-500/20 text-red-400"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <FaStore />
                <span>Restaurants</span>
              </button>
              {!viewAsManager && (
                <>
                  <button
                    onClick={() => router.push("/admin/users")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                      isActive("/admin/users")
                        ? "bg-red-500/20 text-red-400"
                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <FaUsers />
                    <span>Users</span>
                  </button>
                  <button
                    onClick={() => router.push("/admin/wilayas")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                      isActive("/admin/wilayas")
                        ? "bg-red-500/20 text-red-400"
                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <FaMapMarkedAlt />
                    <span>Wilayas</span>
                  </button>
                </>
              )}
              <button
                onClick={() => router.push("/admin/analytics")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  isActive("/admin/analytics")
                    ? "bg-red-500/20 text-red-400"
                    : "text-gray-400 hover: bg-white/5 hover: text-white"
                }`}
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
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
              >
                <FaBars className="text-white" />
              </button>
              <div>
                <h1 className="text-3xl font-black text-white">
                  {title || "Admin Panel"}
                </h1>
                <p className="text-gray-400">
                  {subtitle ||
                    (viewAsManager ? "Manager View" : "Super Admin View")}
                </p>
              </div>
            </div>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
