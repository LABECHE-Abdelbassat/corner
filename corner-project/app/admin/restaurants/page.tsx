"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaEye,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaDownload,
  FaFilter,
  FaSortUp,
  FaSortDown,
  FaSpinner,
  FaTimes,
} from "react-icons/fa";

// ==================== TYPES ====================
interface Restaurant {
  id: string;
  name: string;
  slug: string;
  status: "ACTIVE" | "INACTIVE";
  package: "BASIC" | "PRO" | "PREMIUM";
  createdAt: string;
  updatedAt: string;
  wilaya: {
    id: string;
    name: string;
    code: string;
  };
  owner: {
    id: string;
    username: string;
    email: string | null;
    status: string;
  } | null;
  _count?: {
    categories: number;
    products: number;
  };
}

interface Wilaya {
  id: string;
  name: string;
  code: string;
}

export default function RestaurantsPage() {
  const router = useRouter();
  const [viewAsManager, setViewAsManager] = useState(false);

  // Data states
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWilayas, setSelectedWilayas] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "ACTIVE" | "INACTIVE"
  >("all");
  const [sortField, setSortField] = useState<"name" | "createdAt">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRestaurants, setTotalRestaurants] = useState(0);
  const itemsPerPage = 10;

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);
  const [showWilayaDropdown, setShowWilayaDropdown] = useState(false);

  // ==================== FETCH DATA ====================
  useEffect(() => {
    fetchRestaurants();
    fetchWilayas();
  }, [searchQuery, selectedWilayas, statusFilter, currentPage]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);

      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        includeStats: "true",
      });

      if (searchQuery) params.append("search", searchQuery);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (selectedWilayas.length === 1)
        params.append("wilayaId", getWilayaId(selectedWilayas[0]));

      const response = await fetch(`/api/admin/restaurants?${params}`, {
        credentials: "include",
      });
      const data = await response.json();

      if (data.success) {
        setRestaurants(data.data.restaurants);
        setTotalRestaurants(data.data.pagination.total);
      } else {
        setError(data.error || "Failed to fetch restaurants");
      }
    } catch (err) {
      setError("Network error");
      console.error("Fetch restaurants error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWilayas = async () => {
    try {
      const response = await fetch("/api/admin/wilayas", {
        credentials: "include",
      });
      const data = await response.json();

      if (data.success) {
        setWilayas(data.data.wilayas);
      }
    } catch (err) {
      console.error("Fetch wilayas error:", err);
    }
  };

  const getWilayaId = (wilayaName: string): string => {
    const wilaya = wilayas.find((w) => w.name === wilayaName);
    return wilaya?.id || "";
  };

  // ==================== FILTER & SORT ====================
  const toggleSort = (field: "name" | "createdAt") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const toggleWilaya = (wilayaName: string) => {
    if (selectedWilayas.includes(wilayaName)) {
      setSelectedWilayas(selectedWilayas.filter((w) => w !== wilayaName));
    } else {
      setSelectedWilayas([...selectedWilayas, wilayaName]);
    }
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Sort restaurants client-side
  const sortedRestaurants = [...restaurants].sort((a, b) => {
    if (sortField === "name") {
      return sortOrder === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else {
      return sortOrder === "asc"
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  // ==================== ACTIONS ====================
  const toggleStatus = async (restaurant: Restaurant) => {
    if (actionLoading) return;

    const newStatus = restaurant.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    try {
      setActionLoading(true);
      const response = await fetch(`/api/admin/restaurants/${restaurant.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        setRestaurants(
          restaurants.map((r) =>
            r.id === restaurant.id ? { ...r, status: newStatus } : r
          )
        );
      } else {
        alert(data.error || "Failed to update status");
      }
    } catch (err) {
      alert("Network error");
      console.error("Toggle status error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedRestaurant) return;

    try {
      setActionLoading(true);
      const response = await fetch(
        `/api/admin/restaurants/${selectedRestaurant.id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("Restaurant deleted successfully!");
        setShowDeleteModal(false);
        setSelectedRestaurant(null);
        fetchRestaurants();
      } else {
        alert(data.error || "Failed to delete restaurant");
      }
    } catch (err) {
      alert("Network error");
      console.error("Delete restaurant error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const exportToCSV = () => {
    const csv = [
      [
        "Name",
        "Slug",
        "Wilaya",
        "Owner",
        "Email",
        "Status",
        "Package",
        "Categories",
        "Products",
        "Created Date",
      ],
      ...restaurants.map((r) => [
        r.name,
        r.slug,
        r.wilaya.name,
        r.owner?.username || "No owner",
        r.owner?.email || "No email",
        r.status,
        r.package,
        r._count?.categories || 0,
        r._count?.products || 0,
        new Date(r.createdAt).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `restaurants-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  // ==================== PAGINATION ====================
  const totalPages = Math.ceil(totalRestaurants / itemsPerPage);

  // ==================== RENDER ====================
  if (loading && restaurants.length === 0) {
    return (
      <AdminLayout
        viewAsManager={viewAsManager}
        setViewAsManager={setViewAsManager}
      >
        <div className="flex items-center justify-center min-h-[60vh]">
          <FaSpinner className="text-6xl text-[#FFCE18] animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout
        viewAsManager={viewAsManager}
        setViewAsManager={setViewAsManager}
      >
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-2xl font-bold text-white mb-2">Error</h3>
            <p className="text-gray-400">{error}</p>
            <button
              onClick={() => {
                setError("");
                fetchRestaurants();
              }}
              className="mt-4 px-6 py-3 rounded-xl bg-[#FFCE18] text-black font-bold"
            >
              Retry
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      viewAsManager={viewAsManager}
      setViewAsManager={setViewAsManager}
    >
      <div className="p-4 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black text-white mb-2">Restaurants</h1>
            <p className="text-gray-400">
              {viewAsManager
                ? "Manage restaurants in your wilaya"
                : "Manage all restaurants"}
            </p>
          </div>
          <button
            onClick={() => router.push("/admin/restaurants/create")}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold hover:scale-105 transition-all flex items-center gap-2 shadow-xl"
          >
            <FaPlus /> Add Restaurant
          </button>
        </div>

        {/* Filters */}
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10 mb-6">
          <div className="grid lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-white font-bold mb-2 text-sm">
                Search
              </label>
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search by name, slug, address, or phone..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#FFCE18] focus: outline-none"
                />
              </div>
            </div>

            {/* Wilaya Filter */}
            {!viewAsManager && wilayas.length > 0 && (
              <div className="relative">
                <label className="block text-white font-bold mb-2 text-sm">
                  Wilaya
                </label>
                <button
                  onClick={() => setShowWilayaDropdown(!showWilayaDropdown)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-left flex items-center justify-between"
                >
                  <span className="text-sm">
                    {selectedWilayas.length === 0
                      ? "All Wilayas"
                      : `${selectedWilayas.length} selected`}
                  </span>
                  <FaFilter className="text-gray-400" />
                </button>
                {showWilayaDropdown && (
                  <div className="absolute top-full mt-2 w-full bg-gray-900 border border-white/10 rounded-xl p-2 z-10 max-h-60 overflow-y-auto">
                    {wilayas.map((wilaya) => (
                      <button
                        key={wilaya.id}
                        onClick={() => toggleWilaya(wilaya.name)}
                        className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
                          selectedWilayas.includes(wilaya.name)
                            ? "bg-[#FFCE18]/20 text-[#FFCE18]"
                            : "text-white hover:bg-white/5"
                        }`}
                      >
                        {wilaya.name} ({wilaya.code})
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Status Filter */}
            <div>
              <label className="block text-white font-bold mb-2 text-sm">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#FFCE18] focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          {/* Active Filters */}
          {(selectedWilayas.length > 0 ||
            statusFilter !== "all" ||
            searchQuery) && (
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <span className="text-sm text-gray-400">Active filters:</span>
              {selectedWilayas.map((wilaya) => (
                <span
                  key={wilaya}
                  className="px-3 py-1 rounded-full bg-[#FFCE18]/20 text-[#FFCE18] text-sm font-bold flex items-center gap-2"
                >
                  {wilaya}
                  <button onClick={() => toggleWilaya(wilaya)}>×</button>
                </span>
              ))}
              {statusFilter !== "all" && (
                <span className="px-3 py-1 rounded-full bg-[#FFCE18]/20 text-[#FFCE18] text-sm font-bold flex items-center gap-2">
                  {statusFilter}
                  <button onClick={() => setStatusFilter("all")}>×</button>
                </span>
              )}
              {searchQuery && (
                <span className="px-3 py-1 rounded-full bg-[#FFCE18]/20 text-[#FFCE18] text-sm font-bold flex items-center gap-2">
                  "{searchQuery}"
                  <button onClick={() => setSearchQuery("")}>×</button>
                </span>
              )}
              <button
                onClick={() => {
                  setSelectedWilayas([]);
                  setStatusFilter("all");
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                className="text-sm text-gray-400 hover:text-white underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="text-white font-bold">
              {totalRestaurants} restaurant{totalRestaurants !== 1 ? "s" : ""}
            </div>
            <button
              onClick={exportToCSV}
              disabled={restaurants.length === 0}
              className="px-4 py-2 rounded-xl bg-blue-500/20 border border-blue-500 text-blue-400 font-bold hover:bg-blue-500/30 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <FaDownload /> Export CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th
                    onClick={() => toggleSort("name")}
                    className="text-left p-4 text-white font-bold cursor-pointer hover:bg-white/5"
                  >
                    <div className="flex items-center gap-2">
                      Name
                      {sortField === "name" &&
                        (sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />)}
                    </div>
                  </th>
                  <th className="text-left p-4 text-white font-bold">Wilaya</th>
                  <th className="text-left p-4 text-white font-bold">Owner</th>
                  <th className="text-left p-4 text-white font-bold">
                    Package
                  </th>
                  <th className="text-left p-4 text-white font-bold">Status</th>
                  <th
                    onClick={() => toggleSort("createdAt")}
                    className="text-left p-4 text-white font-bold cursor-pointer hover:bg-white/5"
                  >
                    <div className="flex items-center gap-2">
                      Created
                      {sortField === "createdAt" &&
                        (sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />)}
                    </div>
                  </th>
                  <th className="text-right p-4 text-white font-bold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center">
                      <FaSpinner className="text-4xl text-[#FFCE18] animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : sortedRestaurants.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-400">
                      No restaurants found
                    </td>
                  </tr>
                ) : (
                  sortedRestaurants.map((restaurant) => (
                    <tr
                      key={restaurant.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-all"
                    >
                      <td className="p-4">
                        <div className="text-white font-bold">
                          {restaurant.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {restaurant.slug}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm font-bold">
                          {restaurant.wilaya.name}
                        </span>
                      </td>
                      <td className="p-4">
                        {restaurant.owner ? (
                          <>
                            <div className="text-white">
                              {restaurant.owner.username}
                            </div>
                            <div className="text-sm text-gray-500">
                              {restaurant.owner.email || "No email"}
                            </div>
                          </>
                        ) : (
                          <span className="text-gray-500">No owner</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-bold ${
                            restaurant.package === "PREMIUM"
                              ? "bg-purple-500/20 text-purple-400"
                              : restaurant.package === "PRO"
                              ? "bg-blue-500/20 text-blue-400"
                              : "bg-gray-500/20 text-gray-400"
                          }`}
                        >
                          {restaurant.package}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => toggleStatus(restaurant)}
                          disabled={actionLoading}
                          className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${
                            restaurant.status === "ACTIVE"
                              ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                              : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                          } disabled:opacity-50`}
                        >
                          {restaurant.status === "ACTIVE" ? (
                            <>
                              <FaCheckCircle /> Active
                            </>
                          ) : (
                            <>
                              <FaTimesCircle /> Inactive
                            </>
                          )}
                        </button>
                      </td>
                      <td className="p-4 text-gray-400 text-sm">
                        {new Date(restaurant.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() =>
                              window.open(
                                `/restaurant/${restaurant.slug}`,
                                "_blank"
                              )
                            }
                            className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all"
                            title="View Public Page"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() =>
                              router.push(`/admin/restaurants/${restaurant.id}`)
                            }
                            className="p-2 rounded-lg bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-all"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(restaurant)}
                            disabled={actionLoading}
                            className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all disabled:opacity-50"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-6 border-t border-white/10">
              <div className="text-sm text-gray-400">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, totalRestaurants)} of{" "}
                {totalRestaurants} results
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-xl bg-white/5 text-white font-bold hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let page;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-xl font-bold transition-all ${
                        currentPage === page
                          ? "bg-[#FFCE18] text-black"
                          : "bg-white/5 text-white hover:bg-white/10"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-xl bg-white/5 text-white font-bold hover:bg-white/10 disabled:opacity-30 disabled: cursor-not-allowed transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && selectedRestaurant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gradient-to-b from-gray-900 to-black rounded-3xl border-2 border-red-500 w-full max-w-md p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTrash className="text-3xl text-red-400" />
              </div>
              <h3 className="text-2xl font-black text-white mb-2">
                Delete Restaurant
              </h3>
              <p className="text-gray-400 mb-4">
                Are you sure you want to delete{" "}
                <span className="font-bold text-white">
                  {selectedRestaurant.name}
                </span>
                ?
              </p>
              <div className="bg-red-500/10 border border-red-500 rounded-xl p-4 text-red-400 text-sm">
                ⚠️ This will permanently delete:
                <ul className="mt-2 text-left space-y-1">
                  <li>• The restaurant and all its data</li>
                  <li>• The owner account</li>
                  <li>
                    • All menu items ({selectedRestaurant._count?.products || 0}{" "}
                    products)
                  </li>
                  <li>
                    • All categories (
                    {selectedRestaurant._count?.categories || 0} categories)
                  </li>
                </ul>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedRestaurant(null);
                }}
                disabled={actionLoading}
                className="flex-1 px-6 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={actionLoading}
                className="flex-1 px-6 py-3 rounded-xl bg-red-500 text-white font-bold hover: bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
