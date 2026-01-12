"use client";

import React, { useState } from "react";
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
} from "react-icons/fa";

// Fake Data
const fakeRestaurants = [
  {
    id: "rest1",
    name: "Pizza Palace",
    wilaya: "Tiaret",
    owner: "Ahmed Benali",
    email: "ahmed@example.com",
    status: "active",
    createdDate: "2024-01-15",
  },
  {
    id: "rest2",
    name: "Burger House",
    wilaya: "Tiaret",
    owner: "Karim Mansouri",
    email: "karim@example.com",
    status: "active",
    createdDate: "2024-02-20",
  },
  {
    id: "rest3",
    name: "Le Gourmet",
    wilaya: "Tiaret",
    owner: "Mohamed Amine",
    email: "mohamed@example.com",
    status: "active",
    createdDate: "2024-03-10",
  },
  {
    id: "rest4",
    name: "Shawarma Corner",
    wilaya: "Tiaret",
    owner: "Yacine Bouzid",
    email: "yacine@example.com",
    status: "inactive",
    createdDate: "2024-04-05",
  },
  {
    id: "rest5",
    name: "Sushi Zen",
    wilaya: "Tiaret",
    owner: "Nassim Taleb",
    email: "nassim@example.com",
    status: "active",
    createdDate: "2024-05-12",
  },
  {
    id: "rest6",
    name: "Bella Vista",
    wilaya: "Sidi Bel Abbès",
    owner: "Fatima Zohra",
    email: "fatima@example.com",
    status: "active",
    createdDate: "2024-01-22",
  },
  {
    id: "rest7",
    name: "La Table du Chef",
    wilaya: "Sidi Bel Abbès",
    owner: "Sofiane Cherif",
    email: "sofiane@example.com",
    status: "active",
    createdDate: "2024-02-18",
  },
  {
    id: "rest8",
    name: "Ocean Grill",
    wilaya: "Sidi Bel Abbès",
    owner: "Rania Amara",
    email: "rania@example.com",
    status: "active",
    createdDate: "2024-03-25",
  },
  {
    id: "rest9",
    name: "Café Parisien",
    wilaya: "Sidi Bel Abbès",
    owner: "Hicham Boudiaf",
    email: "hicham@example.com",
    status: "inactive",
    createdDate: "2024-04-30",
  },
];

const availableWilayas = ["Tiaret", "Sidi Bel Abbès"];

export default function RestaurantsPage() {
  const router = useRouter();
  const [viewAsManager, setViewAsManager] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWilayas, setSelectedWilayas] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [sortField, setSortField] = useState<"name" | "createdDate">(
    "createdDate"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(
    null
  );
  const itemsPerPage = 5;

  // Filter restaurants
  let filteredRestaurants = viewAsManager
    ? fakeRestaurants.filter((r) => r.wilaya === "Tiaret")
    : fakeRestaurants;

  if (searchQuery) {
    filteredRestaurants = filteredRestaurants.filter(
      (r) =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  if (selectedWilayas.length > 0) {
    filteredRestaurants = filteredRestaurants.filter((r) =>
      selectedWilayas.includes(r.wilaya)
    );
  }

  if (statusFilter !== "all") {
    filteredRestaurants = filteredRestaurants.filter(
      (r) => r.status === statusFilter
    );
  }

  // Sort
  filteredRestaurants.sort((a, b) => {
    if (sortField === "name") {
      return sortOrder === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else {
      return sortOrder === "asc"
        ? new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime()
        : new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
    }
  });

  // Pagination
  const totalPages = Math.ceil(filteredRestaurants.length / itemsPerPage);
  const paginatedRestaurants = filteredRestaurants.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSort = (field: "name" | "createdDate") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const toggleWilaya = (wilaya: string) => {
    if (selectedWilayas.includes(wilaya)) {
      setSelectedWilayas(selectedWilayas.filter((w) => w !== wilaya));
    } else {
      setSelectedWilayas([...selectedWilayas, wilaya]);
    }
  };

  const toggleStatus = (restaurantId: string) => {
    console.log("Toggle status for:", restaurantId);
    // API call here
  };

  const handleDelete = (restaurantId: string) => {
    setSelectedRestaurant(restaurantId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    console.log("Delete restaurant:", selectedRestaurant);
    // API call here
    setShowDeleteModal(false);
    setSelectedRestaurant(null);
  };

  const exportToCSV = () => {
    const csv = [
      ["Name", "Wilaya", "Owner", "Email", "Status", "Created Date"],
      ...filteredRestaurants.map((r) => [
        r.name,
        r.wilaya,
        r.owner,
        r.email,
        r.status,
        r.createdDate,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "restaurants.csv";
    a.click();
  };

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
                ? "Manage restaurants in Tiaret"
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
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, owner, or email..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Wilaya Filter */}
            {!viewAsManager && (
              <div>
                <label className="block text-white font-bold mb-2 text-sm">
                  Wilaya
                </label>
                <div className="relative">
                  <button className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-left flex items-center justify-between">
                    <span className="text-sm">
                      {selectedWilayas.length === 0
                        ? "All Wilayas"
                        : `${selectedWilayas.length} selected`}
                    </span>
                    <FaFilter className="text-gray-400" />
                  </button>
                  <div className="absolute top-full mt-2 w-full bg-gray-900 border border-white/10 rounded-xl p-2 z-10">
                    {availableWilayas.map((wilaya) => (
                      <button
                        key={wilaya}
                        onClick={() => toggleWilaya(wilaya)}
                        className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
                          selectedWilayas.includes(wilaya)
                            ? "bg-red-500/20 text-red-400"
                            : "text-white hover:bg-white/5"
                        }`}
                      >
                        {wilaya}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Status Filter */}
            <div>
              <label className="block text-white font-bold mb-2 text-sm">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-red-500 focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
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
                  className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-sm font-bold flex items-center gap-2"
                >
                  {wilaya}
                  <button onClick={() => toggleWilaya(wilaya)}>×</button>
                </span>
              ))}
              {statusFilter !== "all" && (
                <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-sm font-bold flex items-center gap-2">
                  {statusFilter}
                  <button onClick={() => setStatusFilter("all")}>×</button>
                </span>
              )}
              {searchQuery && (
                <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-sm font-bold flex items-center gap-2">
                  "{searchQuery}"
                  <button onClick={() => setSearchQuery("")}>×</button>
                </span>
              )}
              <button
                onClick={() => {
                  setSelectedWilayas([]);
                  setStatusFilter("all");
                  setSearchQuery("");
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
              {filteredRestaurants.length} restaurant
              {filteredRestaurants.length !== 1 ? "s" : ""}
            </div>
            <button
              onClick={exportToCSV}
              className="px-4 py-2 rounded-xl bg-blue-500/20 border border-blue-500 text-blue-400 font-bold hover:bg-blue-500/30 transition-all flex items-center gap-2"
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
                  <th className="text-left p-4 text-white font-bold">Status</th>
                  <th
                    onClick={() => toggleSort("createdDate")}
                    className="text-left p-4 text-white font-bold cursor-pointer hover:bg-white/5"
                  >
                    <div className="flex items-center gap-2">
                      Created
                      {sortField === "createdDate" &&
                        (sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />)}
                    </div>
                  </th>
                  <th className="text-right p-4 text-white font-bold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedRestaurants.map((restaurant) => (
                  <tr
                    key={restaurant.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-all"
                  >
                    <td className="p-4">
                      <div className="text-white font-bold">
                        {restaurant.name}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm font-bold">
                        {restaurant.wilaya}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-white">{restaurant.owner}</div>
                      <div className="text-sm text-gray-500">
                        {restaurant.email}
                      </div>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleStatus(restaurant.id)}
                        className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 ${
                          restaurant.status === "active"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {restaurant.status === "active" ? (
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
                      {new Date(restaurant.createdDate).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            window.open(
                              `/restaurant/${restaurant.id}`,
                              "_blank"
                            )
                          }
                          className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all"
                          title="View"
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
                          onClick={() => handleDelete(restaurant.id)}
                          className="p-2 rounded-lg bg-red-500/20 text-red-400 hover: bg-red-500/30 transition-all"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-6 border-t border-white/10">
              <div className="text-sm text-gray-400">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(
                  currentPage * itemsPerPage,
                  filteredRestaurants.length
                )}{" "}
                of {filteredRestaurants.length} results
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-xl bg-white/5 text-white font-bold hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-xl font-bold transition-all ${
                        currentPage === page
                          ? "bg-red-500 text-white"
                          : "bg-white/5 text-white hover:bg-white/10"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-xl bg-white/5 text-white font-bold hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gradient-to-b from-gray-900 to-black rounded-3xl border-2 border-red-500 w-full max-w-md p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTrash className="text-3xl text-red-400" />
              </div>
              <h3 className="text-2xl font-black text-white mb-2">
                Delete Restaurant
              </h3>
              <p className="text-gray-400">
                Are you sure you want to delete this restaurant? This action
                cannot be undone.
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-6 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-6 py-3 rounded-xl bg-red-500 text-white font-bold hover: bg-red-600 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
