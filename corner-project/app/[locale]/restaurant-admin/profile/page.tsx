"use client";

import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  FaArrowLeft,
  FaSave,
  FaMapMarkerAlt,
  FaImage,
  FaTimes,
  FaCheckCircle,
  FaSpinner,
  FaPhone,
  FaClock,
  FaInfoCircle,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaExclamationTriangle,
} from "react-icons/fa";
import { IoRestaurantOutline } from "react-icons/io5";
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

// ==================== INTERFACES ====================
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
}

// Location Picker Component
function LocationPicker({ position, setPosition }: any) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return position ? <Marker position={position} /> : null;
}

export default function ProfilePage() {
  const router = useRouter();

  // Loading states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingLocation, setSavingLocation] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Restaurant data
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [location, setLocation] = useState<[number, number]>([35.3709, 1.3219]);

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    openingHours: "",
    currency: "DZD",
    logo: "",
    lat: "",
    lng: "",
  });

  // Original data for comparison
  const [originalData, setOriginalData] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    openingHours: "",
    currency: "DZD",
    logo: "",
    lat: "",
    lng: "",
  });

  // Track unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Password form
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Modals
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showNavigationWarning, setShowNavigationWarning] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(
    null
  );
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });

  // ==================== FETCH DATA ====================
  useEffect(() => {
    fetchRestaurantData();
  }, []);

  // Check for unsaved changes
  useEffect(() => {
    const hasChanges =
      JSON.stringify(formData) !== JSON.stringify(originalData);
    setHasUnsavedChanges(hasChanges);
  }, [formData, originalData]);

  // Warn before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const fetchRestaurantData = async () => {
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

      // Get restaurant details
      const response = await fetch(`/api/admin/restaurants/${restaurantId}`, {
        credentials: "include",
      });
      const data = await response.json();

      if (data.success) {
        const rest = data.data.restaurant;
        setRestaurant({
          id: rest.id,
          name: rest.name,
          slug: rest.slug,
          logo: rest.logo,
          description: rest.description,
          address: rest.address,
          phone: rest.phone,
          openingHours: rest.openingHours,
          currency: rest.currency,
          lat: rest.lat,
          lng: rest.lng,
        });

        // Populate form
        const initialData = {
          name: rest.name || "",
          description: rest.description || "",
          address: rest.address || "",
          phone: rest.phone || "",
          openingHours: rest.openingHours || "",
          currency: rest.currency || "DZD",
          logo: rest.logo || "",
          lat: rest.lat?.toString() || "",
          lng: rest.lng?.toString() || "",
        };

        setFormData(initialData);
        setOriginalData(initialData);

        // Set location if available
        if (rest.lat && rest.lng) {
          setLocation([rest.lat, rest.lng]);
        }
      } else {
        showAlert("error", "Failed to load restaurant data");
      }
    } catch (err) {
      console.error("Fetch restaurant data error:", err);
      showAlert("error", "Network error");
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type: "success" | "error", message: string) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: "", message: "" }), 3000);
  };

  // ==================== HANDLE LOGO ====================
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showAlert("error", "Logo size must be less than 2MB");
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

    if (!formData.name) {
      showAlert("error", "Restaurant name is required");
      return;
    }

    try {
      setSaving(true);

      const payload: any = {
        name: formData.name,
        description: formData.description,
        address: formData.address,
        phone: formData.phone,
        openingHours: formData.openingHours,
        currency: formData.currency,
      };

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
        showAlert("success", "Profile updated successfully!");
        // Update original data to match current
        setOriginalData({ ...formData });
        setHasUnsavedChanges(false);
      } else {
        showAlert("error", data.error || "Failed to update profile");
      }
    } catch (err) {
      console.error("Update profile error:", err);
      showAlert("error", "Network error");
    } finally {
      setSaving(false);
    }
  };

  // ==================== UPDATE LOCATION ====================
  const handleUpdateLocation = async () => {
    if (!restaurant) return;

    try {
      setSavingLocation(true);

      // Include ALL current form data + new location
      const payload: any = {
        name: formData.name,
        description: formData.description,
        address: formData.address,
        phone: formData.phone,
        openingHours: formData.openingHours,
        currency: formData.currency,
        lat: location[0],
        lng: location[1],
      };

      if (formData.logo) payload.logo = formData.logo;

      const response = await fetch(`/api/admin/restaurants/${restaurant.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        showAlert("success", "Location and changes saved successfully!");

        // Update form data and original data with new location
        const updatedData = {
          ...formData,
          lat: location[0].toString(),
          lng: location[1].toString(),
        };
        setFormData(updatedData);
        setOriginalData(updatedData);
        setHasUnsavedChanges(false);
        setShowLocationModal(false);
      } else {
        showAlert("error", data.error || "Failed to update location");
      }
    } catch (err) {
      console.error("Update location error:", err);
      showAlert("error", "Network error");
    } finally {
      setSavingLocation(false);
    }
  };

  // ==================== CHANGE PASSWORD ====================
  const handleChangePassword = async () => {
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      showAlert("error", "All password fields are required");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showAlert("error", "New password must be at least 6 characters");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showAlert("error", "New passwords do not match");
      return;
    }

    try {
      setSavingPassword(true);

      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showAlert("success", "Password changed successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        showAlert("error", data.error || "Failed to change password");
      }
    } catch (err) {
      console.error("Change password error:", err);
      showAlert("error", "Network error");
    } finally {
      setSavingPassword(false);
    }
  };

  // ==================== NAVIGATION WITH WARNING ====================
  const handleNavigation = (path: string) => {
    if (hasUnsavedChanges) {
      setPendingNavigation(path);
      setShowNavigationWarning(true);
    } else {
      router.push(path);
    }
  };

  const confirmNavigation = () => {
    if (pendingNavigation) {
      router.push(pendingNavigation);
    }
  };

  const cancelNavigation = () => {
    setShowNavigationWarning(false);
    setPendingNavigation(null);
  };

  // ==================== RENDER ====================
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="w-16 h-16 text-[#FFCE18] animate-spin mx-auto mb-4" />
          <p className="text-white text-xl font-bold">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-2xl font-bold text-white mb-2">Error</h3>
          <p className="text-gray-400 mb-6">Failed to load profile</p>
          <button
            onClick={() => router.push("/restaurant-admin/dashboard")}
            className="px-6 py-3 rounded-xl bg-[#FFCE18] text-black font-bold hover:scale-105 transition-all"
          >
            Back to Dashboard
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
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleNavigation("/restaurant-admin/dashboard")}
                className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all"
                title="Back to Dashboard"
              >
                <FaArrowLeft className="text-white" />
              </button>
              <div>
                <h1 className="text-3xl font-black text-white">
                  Profile & Settings
                </h1>
                <p className="text-gray-400">
                  Manage your restaurant information
                  {hasUnsavedChanges && (
                    <span className="ml-2 text-yellow-400 font-bold">
                      • Unsaved changes
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Restaurant Information */}
        <div className="backdrop-blur-xl bg-white/5 rounded-3xl p-8 border border-white/10">
          <h2 className="text-3xl font-black text-white mb-6 flex items-center gap-3">
            <IoRestaurantOutline className="text-[#FFCE18]" />
            Restaurant Information
          </h2>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
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
                    placeholder="Enter restaurant name"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#FFCE18] focus: outline-none"
                  />
                </div>
                <div>
                  <label className="block text-white font-bold mb-2">
                    Currency
                  </label>
                  <input
                    type="text"
                    value={formData.currency}
                    onChange={(e) =>
                      setFormData({ ...formData, currency: e.target.value })
                    }
                    placeholder="DZD, USD, EUR..."
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#FFCE18] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white font-bold mb-2 flex items-center gap-2">
                  <FaInfoCircle className="text-[#FFCE18]" /> Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Brief description of your restaurant"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#FFCE18] focus:outline-none"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-bold mb-2 flex items-center gap-2">
                    <FaPhone className="text-[#FFCE18]" /> Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="+213 XXX XXX XXX"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#FFCE18] focus: outline-none"
                  />
                </div>
                <div>
                  <label className="block text-white font-bold mb-2 flex items-center gap-2">
                    <FaClock className="text-[#FFCE18]" /> Opening Hours
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
                    placeholder="Mon-Fri: 10:00-22:00"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#FFCE18] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white font-bold mb-2 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-[#FFCE18]" /> Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="15 Rue de la Liberté, Tiaret"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#FFCE18] focus: outline-none"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
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
                    placeholder="35.3709"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#FFCE18] focus:outline-none"
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
                    placeholder="1.3219"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#FFCE18] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-white font-bold mb-2">Logo</label>
              {logoPreview || formData.logo ? (
                <div className="relative group">
                  <img
                    src={logoPreview || formData.logo}
                    alt="Logo"
                    className="w-full h-64 object-cover rounded-xl border-2 border-white/10"
                  />
                  <button
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
                  onClick={() => document.getElementById("logo-input")?.click()}
                  className="h-64 rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center cursor-pointer hover:border-[#FFCE18] transition-all"
                >
                  <FaImage className="w-12 h-12 text-gray-500 mb-2" />
                  <span className="text-gray-400">Upload Logo</span>
                  <span className="text-gray-600 text-xs mt-1">Max 2MB</span>
                </div>
              )}
              <input
                id="logo-input"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </div>
          </div>

          <div className="flex justify-end mt-8">
            <button
              onClick={handleSaveInfo}
              disabled={saving || !hasUnsavedChanges}
              className="px-10 py-4 rounded-xl bg-gradient-to-r from-[#FFCE18] to-[#ffd94d] text-black font-black text-lg hover:scale-105 transition-all shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <FaSave /> Save Changes
                  {!hasUnsavedChanges && " (No changes)"}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Location Map & Change Password - Side by Side on Large Screens */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Location Map */}
          <div className="backdrop-blur-xl bg-white/5 rounded-3xl p-8 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-white flex items-center gap-3">
                <FaMapMarkerAlt className="text-[#FFCE18]" />
                Location
              </h2>
              <button
                onClick={() => setShowLocationModal(true)}
                className="px-4 py-3 rounded-xl bg-blue-500/20 border border-blue-500 text-blue-400 font-bold hover:bg-blue-500/30 transition-all flex items-center gap-2"
              >
                <FaMapMarkerAlt /> Update
              </button>
            </div>
            <div className="h-[400px] rounded-2xl overflow-hidden border border-white/10 mb-4">
              <MapContainer
                center={location}
                zoom={15}
                className="h-full w-full"
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={location} />
              </MapContainer>
            </div>
            <div className="text-sm text-gray-400">
              Current: {location[0].toFixed(6)}, {location[1].toFixed(6)}
            </div>
          </div>

          {/* Change Password */}
          <div className="backdrop-blur-xl bg-white/5 rounded-3xl p-8 border border-white/10">
            <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
              <FaLock className="text-[#FFCE18]" />
              Change Password
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-white font-bold mb-2 text-sm">
                  Current Password *
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    placeholder="Current password"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#FFCE18] focus: outline-none pr-12"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords({
                        ...showPasswords,
                        current: !showPasswords.current,
                      })
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-white font-bold mb-2 text-sm">
                  New Password *
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    placeholder="Min 6 characters"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#FFCE18] focus:outline-none pr-12"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords({
                        ...showPasswords,
                        new: !showPasswords.new,
                      })
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-white font-bold mb-2 text-sm">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    placeholder="Confirm new password"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#FFCE18] focus:outline-none pr-12"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords({
                        ...showPasswords,
                        confirm: !showPasswords.confirm,
                      })
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <button
                onClick={handleChangePassword}
                disabled={savingPassword}
                className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold hover:scale-105 transition-all shadow-2xl disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
              >
                {savingPassword ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Changing...
                  </>
                ) : (
                  <>
                    <FaLock /> Change Password
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

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
                className="p-2 hover:bg-white/10 rounded-lg"
              >
                <FaTimes className="text-white" />
              </button>
            </div>
            <p className="text-gray-400 mb-6">
              Click on the map to update your restaurant location
            </p>
            {hasUnsavedChanges && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
                <p className="text-yellow-400 text-sm flex items-center gap-2">
                  <FaInfoCircle />
                  <span>
                    You have unsaved changes. Saving location will also save all
                    your changes.
                  </span>
                </p>
              </div>
            )}
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
                disabled={savingLocation}
                className="flex-1 px-6 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateLocation}
                disabled={savingLocation}
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-[#FFCE18] to-[#ffd94d] text-black font-bold hover:scale-105 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {savingLocation ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave />{" "}
                    {hasUnsavedChanges
                      ? "Save Location & Changes"
                      : "Save Location"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Warning Modal */}
      {showNavigationWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="bg-gradient-to-b from-gray-900 to-black rounded-3xl border-2 border-yellow-500 max-w-md w-full p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaExclamationTriangle className="text-3xl text-yellow-400" />
              </div>
              <h3 className="text-2xl font-black text-white mb-2">
                Unsaved Changes
              </h3>
              <p className="text-gray-400">
                You have unsaved changes. Are you sure you want to leave?
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={cancelNavigation}
                className="flex-1 px-6 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all"
              >
                Stay
              </button>
              <button
                onClick={confirmNavigation}
                className="flex-1 px-6 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all"
              >
                Leave Anyway
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
