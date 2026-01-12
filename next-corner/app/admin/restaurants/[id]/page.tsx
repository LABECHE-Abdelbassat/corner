"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  FaStore,
  FaEdit,
  FaTrash,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaArrowLeft,
  FaSave,
  FaCode,
  FaChartLine,
  FaUsers,
  FaImage,
  FaTimes,
  FaCheck,
  FaExclamationTriangle,
} from "react-icons/fa";

// Fake restaurant data
const fakeRestaurant = {
  id: "rest1",
  name: "Pizza Palace",
  wilaya: "Tiaret",
  address: "15 Rue de la Liberté, Centre Ville, Tiaret",
  phone: "+213 46 XX XX XX",
  owner: "Ahmed Benali",
  email: "ahmed@example.com",
  status: "active",
  createdDate: "2024-01-15",
  logo: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400",
  openingHours: "Mon-Fri: 10:00-22:00",
  stats: {
    views: 3200,
    scans: 1100,
    mapClicks: 850,
  },
  users: [
    { id: "u1", username: "ahmed_pizza", role: "Owner", status: "active" },
    { id: "u2", username: "manager_pizza", role: "Manager", status: "active" },
  ],
  menuData: {
    restaurant: {
      name: "Pizza Palace",
      currency: "DZD",
      description: "Best pizza in town",
    },
    categories: [
      {
        _id: "cat1",
        name: "Pizzas",
        description: "Our delicious pizzas",
        order: 1,
      },
    ],
    products: [
      {
        _id: "prod1",
        categoryId: "cat1",
        name: "Margherita",
        description: "Classic pizza",
        price: 800,
        isAvailable: true,
        tags: ["vegetarian"],
        allergens: [],
      },
    ],
    promotions: [],
  },
};

export default function RestaurantDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [viewAsManager, setViewAsManager] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "info" | "menu" | "stats" | "users"
  >("info");
  const [restaurant, setRestaurant] = useState(fakeRestaurant);
  const [jsonInput, setJsonInput] = useState(
    JSON.stringify(restaurant.menuData, null, 2)
  );
  const [jsonError, setJsonError] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
        setRestaurant({ ...restaurant, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const validateJSON = () => {
    try {
      JSON.parse(jsonInput);
      setJsonError("");
      return true;
    } catch (e: any) {
      setJsonError(e.message);
      return false;
    }
  };

  const handleSaveJSON = () => {
    if (validateJSON()) {
      const parsedData = JSON.parse(jsonInput);
      setRestaurant({ ...restaurant, menuData: parsedData });
      alert("Menu saved successfully!");
    }
  };

  const handleSaveInfo = () => {
    console.log("Save restaurant info:", restaurant);
    alert("Restaurant info saved!");
  };

  const toggleStatus = () => {
    setRestaurant({
      ...restaurant,
      status: restaurant.status === "active" ? "inactive" : "active",
    });
  };

  const handleDelete = () => {
    console.log("Delete restaurant:", params.id);
    router.push("/admin/restaurants");
  };

  return (
    <AdminLayout
      viewAsManager={viewAsManager}
      setViewAsManager={setViewAsManager}
      title={restaurant.name}
      subtitle={`${restaurant.wilaya} • Manage restaurant details`}
    >
      <div className="p-4 lg:p-8">
        {/* Back Button */}
        <button
          onClick={() => router.push("/admin/restaurants")}
          className="mb-6 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-white font-bold"
        >
          <FaArrowLeft /> Back to Restaurants
        </button>

        {/* Restaurant Header */}
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <img
                src={logoPreview || restaurant.logo}
                alt={restaurant.name}
                className="w-20 h-20 rounded-xl object-cover border-2 border-white/10"
              />
              <div>
                <h2 className="text-3xl font-black text-white mb-2">
                  {restaurant.name}
                </h2>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm font-bold">
                    {restaurant.wilaya}
                  </span>
                  <button
                    onClick={toggleStatus}
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
                  <span className="text-sm text-gray-500">
                    Created:{" "}
                    {new Date(restaurant.createdDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  window.open(`/restaurant/${params.id}`, "_blank")
                }
                className="px-4 py-2 rounded-xl bg-blue-500/20 border border-blue-500 text-blue-400 font-bold hover:bg-blue-500/30 transition-all flex items-center gap-2"
              >
                <FaEye /> View as User
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 rounded-xl bg-red-500/20 border border-red-500 text-red-400 font-bold hover:bg-red-500/30 transition-all flex items-center gap-2"
              >
                <FaTrash /> Delete
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
          <div className="border-b border-white/10 flex overflow-x-auto">
            {["info", "menu", "stats", "users"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-8 py-4 font-bold border-b-2 transition-all capitalize ${
                  activeTab === tab
                    ? "border-[#FFCE18] text-[#FFCE18] bg-white/5"
                    : "border-transparent text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {tab === "info" && <FaEdit className="inline mr-2" />}
                {tab === "menu" && <FaCode className="inline mr-2" />}
                {tab === "stats" && <FaChartLine className="inline mr-2" />}
                {tab === "users" && <FaUsers className="inline mr-2" />}
                {tab}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* INFO TAB */}
            {activeTab === "info" && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-bold mb-2">
                      Restaurant Name
                    </label>
                    <input
                      type="text"
                      value={restaurant.name}
                      onChange={(e) =>
                        setRestaurant({ ...restaurant, name: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#FFCE18] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-bold mb-2">
                      Wilaya
                    </label>
                    <select
                      value={restaurant.wilaya}
                      onChange={(e) =>
                        setRestaurant({ ...restaurant, wilaya: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#FFCE18] focus:outline-none"
                    >
                      <option value="Tiaret">Tiaret</option>
                      <option value="Sidi Bel Abbès">Sidi Bel Abbès</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-white font-bold mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={restaurant.address}
                    onChange={(e) =>
                      setRestaurant({ ...restaurant, address: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#FFCE18] focus:outline-none"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-bold mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={restaurant.phone}
                      onChange={(e) =>
                        setRestaurant({ ...restaurant, phone: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus: border-[#FFCE18] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-bold mb-2">
                      Opening Hours
                    </label>
                    <input
                      type="text"
                      value={restaurant.openingHours}
                      onChange={(e) =>
                        setRestaurant({
                          ...restaurant,
                          openingHours: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#FFCE18] focus: outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white font-bold mb-2">
                    Logo
                  </label>
                  {logoPreview || restaurant.logo ? (
                    <div className="relative group inline-block">
                      <img
                        src={logoPreview || restaurant.logo}
                        alt="Logo"
                        className="w-48 h-48 object-cover rounded-xl border-2 border-white/10"
                      />
                      <button
                        onClick={() => {
                          setLogoPreview(null);
                          setRestaurant({ ...restaurant, logo: "" });
                        }}
                        className="absolute top-2 right-2 p-2 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() =>
                        document.getElementById("logo-edit")?.click()
                      }
                      className="w-48 h-48 rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center cursor-pointer hover:border-[#FFCE18] transition-all"
                    >
                      <FaImage className="w-12 h-12 text-gray-500 mb-2" />
                      <span className="text-gray-400">Upload Logo</span>
                    </div>
                  )}
                  <input
                    id="logo-edit"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </div>

                <button
                  onClick={handleSaveInfo}
                  className="px-10 py-4 rounded-xl bg-gradient-to-r from-[#FFCE18] to-[#ffd94d] text-black font-black text-lg hover:scale-110 transition-all shadow-2xl"
                >
                  <FaSave className="inline mr-2" /> Save Changes
                </button>
              </div>
            )}

            {/* MENU TAB */}
            {activeTab === "menu" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-black text-white mb-2">
                      JSON Menu Editor
                    </h3>
                    <p className="text-gray-400">
                      Paste and edit your complete menu data structure
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={validateJSON}
                      className="px-6 py-3 rounded-xl bg-blue-500/20 border border-blue-500 text-blue-400 font-bold hover:bg-blue-500/30 transition-all"
                    >
                      Validate JSON
                    </button>
                    <button
                      onClick={() =>
                        window.open(`/menu/${params.id}`, "_blank")
                      }
                      className="px-6 py-3 rounded-xl bg-purple-500/20 border border-purple-500 text-purple-400 font-bold hover:bg-purple-500/30 transition-all flex items-center gap-2"
                    >
                      <FaEye /> Preview Menu
                    </button>
                  </div>
                </div>

                {jsonError && (
                  <div className="bg-red-500/20 border border-red-500 rounded-xl p-4 text-red-400 flex items-start gap-3">
                    <FaExclamationTriangle className="mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-bold mb-1">
                        JSON Validation Error:{" "}
                      </div>
                      <div className="text-sm">{jsonError}</div>
                    </div>
                  </div>
                )}

                <textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  className="w-full h-[600px] px-4 py-3 rounded-xl bg-gray-950 border border-white/10 text-green-400 font-mono text-sm focus:border-[#FFCE18] focus: outline-none resize-none"
                  spellCheck={false}
                />

                <button
                  onClick={handleSaveJSON}
                  className="px-10 py-4 rounded-xl bg-gradient-to-r from-[#FFCE18] to-[#ffd94d] text-black font-black text-lg hover:scale-110 transition-all shadow-2xl"
                >
                  <FaSave className="inline mr-2" /> Save Menu
                </button>
              </div>
            )}

            {/* STATS TAB */}
            {activeTab === "stats" && (
              <div className="space-y-6">
                <h3 className="text-2xl font-black text-white mb-6">
                  Restaurant Statistics
                </h3>
                <div className="grid md: grid-cols-3 gap-6">
                  <div className="backdrop-blur-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-purple-500/30">
                    <FaEye className="text-4xl text-purple-400 mb-4" />
                    <div className="text-4xl font-black text-white mb-2">
                      {restaurant.stats.views.toLocaleString()}
                    </div>
                    <div className="text-gray-400 font-semibold">
                      Menu Views
                    </div>
                  </div>
                  <div className="backdrop-blur-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl p-6 border border-yellow-500/30">
                    <div className="text-4xl mb-4">🔍</div>
                    <div className="text-4xl font-black text-white mb-2">
                      {restaurant.stats.scans.toLocaleString()}
                    </div>
                    <div className="text-gray-400 font-semibold">QR Scans</div>
                  </div>
                  <div className="backdrop-blur-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl p-6 border border-green-500/30">
                    <div className="text-4xl mb-4">📍</div>
                    <div className="text-4xl font-black text-white mb-2">
                      {restaurant.stats.mapClicks.toLocaleString()}
                    </div>
                    <div className="text-gray-400 font-semibold">
                      Map Clicks
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* USERS TAB */}
            {activeTab === "users" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-black text-white">
                    Restaurant Users
                  </h3>
                </div>
                <div className="space-y-3">
                  {restaurant.users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between bg-white/5 rounded-xl p-4 border border-white/10"
                    >
                      <div>
                        <div className="text-white font-bold">
                          {user.username}
                        </div>
                        <div className="text-sm text-gray-400">{user.role}</div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-bold ${
                          user.status === "active"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {user.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
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
                Are you sure you want to delete{" "}
                <span className="font-bold text-white">{restaurant.name}</span>?
                This action cannot be undone.
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
                onClick={handleDelete}
                className="flex-1 px-6 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all"
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
