"use client";

import React, { useState, useEffect, use } from "react";
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
  FaImage,
  FaTimes,
  FaExclamationTriangle,
  FaSpinner,
  FaSync,
} from "react-icons/fa";

// ==================== TYPES ====================
interface Restaurant {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  address: string | null;
  phone: string | null;
  openingHours: string | null;
  currency: string;
  lat: number | null;
  lng: number | null;
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
  stats?: {
    totalViews: number;
    totalScans: number;
    totalMapClicks: number;
  };
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

export default function RestaurantDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [viewAsManager, setViewAsManager] = useState(false);

  // Data states
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  // Tab state
  const [activeTab, setActiveTab] = useState<"info" | "menu" | "stats">("info");

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    wilayaId: "",
    address: "",
    phone: "",
    description: "",
    openingHours: "",
    logo: "",
    lat: "",
    lng: "",
    package: "BASIC" as "BASIC" | "PRO" | "PREMIUM",
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Menu JSON state
  const [jsonInput, setJsonInput] = useState("");
  const [jsonError, setJsonError] = useState("");
  const [menuLoading, setMenuLoading] = useState(false);
  const [menuSaving, setMenuSaving] = useState(false);

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // ==================== FETCH DATA ====================
  useEffect(() => {
    fetchRestaurant();
    fetchWilayas();
  }, [resolvedParams.id]);

  useEffect(() => {
    // Fetch menu when switching to menu tab
    if (activeTab === "menu" && restaurant && !jsonInput) {
      fetchMenu();
    }
  }, [activeTab, restaurant]);

  const fetchRestaurant = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/restaurants/${resolvedParams.id}`,
        {
          credentials: "include",
        }
      );
      const data = await response.json();

      if (data.success) {
        const rest = data.data.restaurant;
        setRestaurant(rest);

        // Populate form
        setFormData({
          name: rest.name,
          wilayaId: rest.wilaya.id,
          address: rest.address || "",
          phone: rest.phone || "",
          description: rest.description || "",
          openingHours: rest.openingHours || "",
          logo: rest.logo || "",
          lat: rest.lat?.toString() || "",
          lng: rest.lng?.toString() || "",
          package: rest.package,
        });
      } else {
        setError(data.error || "Failed to fetch restaurant");
      }
    } catch (err) {
      setError("Network error");
      console.error("Fetch restaurant error:", err);
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

  const fetchMenu = async () => {
    if (!restaurant) return;

    try {
      setMenuLoading(true);
      const response = await fetch(`/api/restaurants/${restaurant.id}/menu`, {
        credentials: "include",
      });
      const data = await response.json();

      if (data.success) {
        // Format the menu data nicely
        setJsonInput(JSON.stringify(data.data, null, 2));
        setJsonError("");
      } else {
        // If no menu exists, set default structure
        setJsonInput(
          JSON.stringify(
            {
              restaurant: {
                name: restaurant.name,
                currency: restaurant.currency,
                description: restaurant.description || "",
              },
              categories: [],
              products: [],
              promotions: [],
            },
            null,
            2
          )
        );
      }
    } catch (err) {
      console.error("Fetch menu error:", err);
      setJsonError("Failed to load menu");
    } finally {
      setMenuLoading(false);
    }
  };

  // ==================== HANDLE LOGO ====================
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Logo size must be less than 2MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
        setFormData({ ...formData, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // ==================== SAVE INFO ====================
  const handleSaveInfo = async () => {
    if (!restaurant) return;

    if (!formData.name || !formData.wilayaId) {
      alert("Name and Wilaya are required");
      return;
    }

    try {
      setSaving(true);
      const payload: any = {
        name: formData.name,
        wilayaId: formData.wilayaId,
        package: formData.package,
      };

      if (formData.address) payload.address = formData.address;
      if (formData.phone) payload.phone = formData.phone;
      if (formData.description) payload.description = formData.description;
      if (formData.openingHours) payload.openingHours = formData.openingHours;
      if (formData.logo) payload.logo = formData.logo;
      if (formData.lat) payload.lat = parseFloat(formData.lat);
      if (formData.lng) payload.lng = parseFloat(formData.lng);

      const response = await fetch(`/api/admin/restaurants/${restaurant.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        alert("Restaurant updated successfully!");
        fetchRestaurant(); // Refresh data
      } else {
        alert(data.error || "Failed to update restaurant");
      }
    } catch (err) {
      alert("Network error");
      console.error("Update restaurant error:", err);
    } finally {
      setSaving(false);
    }
  };

  // ==================== TOGGLE STATUS ====================
  const toggleStatus = async () => {
    if (!restaurant) return;

    const newStatus = restaurant.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    try {
      const response = await fetch(`/api/admin/restaurants/${restaurant.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        setRestaurant({ ...restaurant, status: newStatus });
      } else {
        alert(data.error || "Failed to update status");
      }
    } catch (err) {
      alert("Network error");
      console.error("Toggle status error:", err);
    }
  };

  // ==================== MENU JSON ====================
  const validateJSON = () => {
    try {
      JSON.parse(jsonInput);
      setJsonError("");
      alert("✅ JSON is valid!");
      return true;
    } catch (e: any) {
      setJsonError(e.message);
      return false;
    }
  };

  const handleSaveJSON = async () => {
    if (!restaurant) return;

    // Validate first
    if (!validateJSON()) {
      return;
    }

    try {
      setMenuSaving(true);
      const menuData = JSON.parse(jsonInput);

      const response = await fetch(`/api/restaurants/${restaurant.id}/menu`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(menuData),
      });

      const data = await response.json();

      if (data.success) {
        alert(
          `✅ Menu saved successfully!\n\n` +
            `Categories: ${data.data.stats.categories}\n` +
            `Products: ${data.data.stats.products}\n` +
            `Promotions: ${data.data.stats.promotions}`
        );
        // Refresh restaurant data to update counts
        fetchRestaurant();
      } else {
        alert("❌ Failed to save menu:\n\n" + (data.error || "Unknown error"));
      }
    } catch (err: any) {
      alert("❌ Network error:\n\n" + err.message);
      console.error("Save menu error:", err);
    } finally {
      setMenuSaving(false);
    }
  };

  const handleRefreshMenu = () => {
    fetchMenu();
  };

  // ==================== DELETE ====================
  const handleDelete = async () => {
    if (!restaurant) return;

    try {
      setDeleting(true);
      const response = await fetch(`/api/admin/restaurants/${restaurant.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        alert("Restaurant deleted successfully!");
        router.push("/admin/restaurants");
      } else {
        alert(data.error || "Failed to delete restaurant");
      }
    } catch (err) {
      alert("Network error");
      console.error("Delete restaurant error:", err);
    } finally {
      setDeleting(false);
    }
  };

  // ==================== RENDER ====================
  if (loading) {
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

  if (error || !restaurant) {
    return (
      <AdminLayout
        viewAsManager={viewAsManager}
        setViewAsManager={setViewAsManager}
      >
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-2xl font-bold text-white mb-2">Error</h3>
            <p className="text-gray-400">{error || "Restaurant not found"}</p>
            <div className="flex gap-4 justify-center mt-4">
              <button
                onClick={() => router.push("/admin/restaurants")}
                className="px-6 py-3 rounded-xl bg-white/10 text-white font-bold"
              >
                Back to Restaurants
              </button>
              <button
                onClick={() => {
                  setError("");
                  fetchRestaurant();
                }}
                className="px-6 py-3 rounded-xl bg-[#FFCE18] text-black font-bold"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      viewAsManager={viewAsManager}
      setViewAsManager={setViewAsManager}
      title={restaurant.name}
      subtitle={`${restaurant.wilaya.name} • Manage restaurant details`}
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
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-start gap-4">
              {logoPreview || restaurant.logo ? (
                <img
                  src={logoPreview || restaurant.logo || ""}
                  alt={restaurant.name}
                  className="w-20 h-20 rounded-xl object-cover border-2 border-white/10"
                />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-white/5 border-2 border-white/10 flex items-center justify-center">
                  <FaStore className="text-3xl text-gray-500" />
                </div>
              )}
              <div>
                <h2 className="text-3xl font-black text-white mb-2">
                  {restaurant.name}
                </h2>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm font-bold">
                    {restaurant.wilaya.name}
                  </span>
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
                  <button
                    onClick={toggleStatus}
                    className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 hover:opacity-80 transition-all ${
                      restaurant.status === "ACTIVE"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
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
                  <span className="text-sm text-gray-500">
                    Created:{" "}
                    {new Date(restaurant.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  window.open(`/restaurant/${restaurant.slug}`, "_blank")
                }
                className="px-4 py-2 rounded-xl bg-blue-500/20 border border-blue-500 text-blue-400 font-bold hover:bg-blue-500/30 transition-all flex items-center gap-2"
              >
                <FaEye /> View Public Page
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
            {[
              { key: "info", label: "Info", icon: FaEdit },
              { key: "menu", label: "Menu", icon: FaCode },
              { key: "stats", label: "Stats", icon: FaChartLine },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-8 py-4 font-bold border-b-2 transition-all capitalize flex items-center gap-2 ${
                  activeTab === tab.key
                    ? "border-[#FFCE18] text-[#FFCE18] bg-white/5"
                    : "border-transparent text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <tab.icon />
                {tab.label}
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
                      Restaurant Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#FFCE18] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-bold mb-2">
                      Wilaya *
                    </label>
                    <select
                      value={formData.wilayaId}
                      onChange={(e) =>
                        setFormData({ ...formData, wilayaId: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#FFCE18] focus: outline-none"
                    >
                      {wilayas.map((wilaya) => (
                        <option key={wilaya.id} value={wilaya.id}>
                          {wilaya.name} ({wilaya.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-white font-bold mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#FFCE18] focus:outline-none"
                    placeholder="Brief description of the restaurant..."
                  />
                </div>

                <div>
                  <label className="block text-white font-bold mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus: border-[#FFCE18] focus:outline-none"
                    placeholder="Full address..."
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-bold mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#FFCE18] focus:outline-none"
                      placeholder="+213 555 123 456"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-bold mb-2">
                      Opening Hours
                    </label>
                    <input
                      type="text"
                      value={formData.openingHours}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          openingHours: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#FFCE18] focus:outline-none"
                      placeholder="Mon-Fri: 10:00-22:00"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-bold mb-2">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      value={formData.lat}
                      onChange={(e) =>
                        setFormData({ ...formData, lat: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus: border-[#FFCE18] focus:outline-none"
                      placeholder="35.3709"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-bold mb-2">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      value={formData.lng}
                      onChange={(e) =>
                        setFormData({ ...formData, lng: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#FFCE18] focus: outline-none"
                      placeholder="1.3219"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white font-bold mb-2">
                    Package
                  </label>
                  <div className="grid md:grid-cols-3 gap-4">
                    {["BASIC", "PRO", "PREMIUM"].map((pkg) => (
                      <button
                        key={pkg}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, package: pkg as any })
                        }
                        className={`p-4 rounded-xl border-2 transition-all ${
                          formData.package === pkg
                            ? "bg-purple-500/20 border-purple-500 text-purple-400"
                            : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                        }`}
                      >
                        {pkg}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-white font-bold mb-2">
                    Logo
                  </label>
                  {logoPreview || formData.logo ? (
                    <div className="relative group inline-block">
                      <img
                        src={logoPreview || formData.logo}
                        alt="Logo"
                        className="w-48 h-48 object-cover rounded-xl border-2 border-white/10"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setLogoPreview(null);
                          setFormData({ ...formData, logo: "" });
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
                  disabled={saving}
                  className="px-10 py-4 rounded-xl bg-gradient-to-r from-[#FFCE18] to-[#ffd94d] text-black font-black text-lg hover:scale-110 transition-all shadow-2xl disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave /> Save Changes
                    </>
                  )}
                </button>
              </div>
            )}

            {/* MENU TAB */}
            {activeTab === "menu" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                  <div>
                    <h3 className="text-2xl font-black text-white mb-2">
                      JSON Menu Editor
                    </h3>
                    <p className="text-gray-400">
                      Edit your complete menu data structure
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleRefreshMenu}
                      disabled={menuLoading}
                      className="px-6 py-3 rounded-xl bg-gray-500/20 border border-gray-500 text-gray-400 font-bold hover:bg-gray-500/30 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {menuLoading ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaSync />
                      )}
                      Refresh
                    </button>
                    <button
                      onClick={validateJSON}
                      className="px-6 py-3 rounded-xl bg-blue-500/20 border border-blue-500 text-blue-400 font-bold hover:bg-blue-500/30 transition-all"
                    >
                      Validate JSON
                    </button>
                    <button
                      onClick={() =>
                        window.open(`/menu/${restaurant.slug}`, "_blank")
                      }
                      className="px-6 py-3 rounded-xl bg-purple-500/20 border border-purple-500 text-purple-400 font-bold hover:bg-purple-500/30 transition-all flex items-center gap-2"
                    >
                      <FaEye /> Preview
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

                {menuLoading ? (
                  <div className="flex items-center justify-center h-[600px] bg-gray-950 rounded-xl border border-white/10">
                    <FaSpinner className="text-4xl text-[#FFCE18] animate-spin" />
                  </div>
                ) : (
                  <textarea
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    className="w-full h-[600px] px-4 py-3 rounded-xl bg-gray-950 border border-white/10 text-green-400 font-mono text-sm focus:border-[#FFCE18] focus: outline-none resize-none"
                    spellCheck={false}
                  />
                )}

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                  <p className="text-blue-400 text-sm">
                    💡 <strong>Tip:</strong> Edit the JSON structure to manage
                    your menu. The menu will be saved to{" "}
                    <code className="bg-black/30 px-2 py-1 rounded">
                      /api/restaurants/{restaurant.id}/menu
                    </code>
                  </p>
                </div>

                <button
                  onClick={handleSaveJSON}
                  disabled={menuSaving || menuLoading}
                  className="px-10 py-4 rounded-xl bg-gradient-to-r from-[#FFCE18] to-[#ffd94d] text-black font-black text-lg hover:scale-110 transition-all shadow-2xl disabled:opacity-50 flex items-center gap-2"
                >
                  {menuSaving ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Saving Menu...
                    </>
                  ) : (
                    <>
                      <FaSave /> Save Menu
                    </>
                  )}
                </button>
              </div>
            )}

            {/* STATS TAB */}
            {activeTab === "stats" && (
              <div className="space-y-6">
                <h3 className="text-2xl font-black text-white mb-6">
                  Restaurant Statistics
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="backdrop-blur-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-purple-500/30">
                    <FaEye className="text-4xl text-purple-400 mb-4" />
                    <div className="text-4xl font-black text-white mb-2">
                      {restaurant.stats?.totalViews.toLocaleString() || 0}
                    </div>
                    <div className="text-gray-400 font-semibold">
                      Menu Views
                    </div>
                  </div>
                  <div className="backdrop-blur-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl p-6 border border-yellow-500/30">
                    <div className="text-4xl mb-4">🔍</div>
                    <div className="text-4xl font-black text-white mb-2">
                      {restaurant.stats?.totalScans.toLocaleString() || 0}
                    </div>
                    <div className="text-gray-400 font-semibold">QR Scans</div>
                  </div>
                  <div className="backdrop-blur-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl p-6 border border-green-500/30">
                    <div className="text-4xl mb-4">📍</div>
                    <div className="text-4xl font-black text-white mb-2">
                      {restaurant.stats?.totalMapClicks.toLocaleString() || 0}
                    </div>
                    <div className="text-gray-400 font-semibold">
                      Map Clicks
                    </div>
                  </div>
                </div>

                <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10">
                  <h4 className="text-xl font-bold text-white mb-4">
                    Menu Content
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-xl p-4">
                      <div className="text-3xl font-black text-white mb-2">
                        {restaurant._count?.categories || 0}
                      </div>
                      <div className="text-gray-400">Categories</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4">
                      <div className="text-3xl font-black text-white mb-2">
                        {restaurant._count?.products || 0}
                      </div>
                      <div className="text-gray-400">Products</div>
                    </div>
                  </div>
                </div>

                {restaurant.owner && (
                  <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10">
                    <h4 className="text-xl font-bold text-white mb-4">Owner</h4>
                    <div className="flex items-center justify-between bg-white/5 rounded-xl p-4">
                      <div>
                        <div className="text-white font-bold">
                          {restaurant.owner.username}
                        </div>
                        <div className="text-sm text-gray-400">
                          {restaurant.owner.email || "No email"}
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-bold ${
                          restaurant.owner.status === "ACTIVE"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {restaurant.owner.status}
                      </span>
                    </div>
                  </div>
                )}
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
              <p className="text-gray-400 mb-4">
                Are you sure you want to delete{" "}
                <span className="font-bold text-white">{restaurant.name}</span>?
              </p>
              <div className="bg-red-500/10 border border-red-500 rounded-xl p-4 text-red-400 text-sm text-left">
                ⚠️ This will permanently delete:
                <ul className="mt-2 space-y-1">
                  <li>• The restaurant and all data</li>
                  <li>• The owner account</li>
                  <li>• {restaurant._count?.categories || 0} categories</li>
                  <li>• {restaurant._count?.products || 0} products</li>
                </ul>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 px-6 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-6 py-3 rounded-xl bg-red-500 text-white font-bold hover: bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
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
