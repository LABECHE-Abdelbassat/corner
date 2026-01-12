"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  FaStore,
  FaMapMarkerAlt,
  FaPhone,
  FaUser,
  FaEnvelope,
  FaKey,
  FaCopy,
  FaCheck,
  FaImage,
  FaClock,
  FaArrowLeft,
  FaTimes,
} from "react-icons/fa";

const availableWilayas = ["Tiaret", "Sidi Bel Abbès"];
const packages = ["Basic", "Pro", "Premium"];

export default function CreateRestaurantPage() {
  const router = useRouter();
  const [viewAsManager, setViewAsManager] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState({
    username: "",
    password: "",
  });
  const [copied, setCopied] = useState({ username: false, password: false });

  // Form state
  const [formData, setFormData] = useState({
    restaurantName: "",
    wilaya: viewAsManager ? "Tiaret" : "",
    address: "",
    phone: "",
    ownerName: "",
    ownerEmail: "",
    package: "Basic",
    logo: "",
    openingHours: "Mon-Fri:  10:00-22:00",
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
        setFormData({ ...formData, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const generateCredentials = () => {
    const username =
      formData.restaurantName
        .toLowerCase()
        .replace(/\s+/g, "")
        .substring(0, 10) + Math.floor(Math.random() * 1000);
    const password = Math.random().toString(36).slice(-8).toUpperCase();
    return { username, password };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.restaurantName ||
      !formData.wilaya ||
      !formData.ownerName ||
      !formData.ownerEmail
    ) {
      alert("Please fill all required fields");
      return;
    }

    const credentials = generateCredentials();
    setGeneratedCredentials(credentials);
    console.log("Creating restaurant:", formData, credentials);
    // API call here

    setShowSuccessModal(true);
  };

  const copyToClipboard = (text: string, field: "username" | "password") => {
    navigator.clipboard.writeText(text);
    setCopied({ ...copied, [field]: true });
    setTimeout(() => setCopied({ ...copied, [field]: false }), 2000);
  };

  const handleSuccess = () => {
    setShowSuccessModal(false);
    router.push("/admin/restaurants");
  };

  return (
    <AdminLayout
      viewAsManager={viewAsManager}
      setViewAsManager={setViewAsManager}
    >
      <div className="p-4 lg:p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push("/admin/restaurants")}
            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
          >
            <FaArrowLeft className="text-white" />
          </button>
          <div>
            <h1 className="text-4xl font-black text-white mb-2">
              Create Restaurant
            </h1>
            <p className="text-gray-400">
              Add a new restaurant to the platform
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Restaurant Info */}
              <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10">
                <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                  <FaStore className="text-green-400" />
                  Restaurant Information
                </h2>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white font-bold mb-2">
                        Restaurant Name *
                      </label>
                      <input
                        type="text"
                        value={formData.restaurantName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            restaurantName: e.target.value,
                          })
                        }
                        placeholder="e.g., Pizza Palace"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-white font-bold mb-2">
                        Wilaya *
                      </label>
                      <select
                        value={formData.wilaya}
                        onChange={(e) =>
                          setFormData({ ...formData, wilaya: e.target.value })
                        }
                        disabled={viewAsManager}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-green-500 focus:outline-none disabled:opacity-50"
                        required
                      >
                        <option value="">Select Wilaya</option>
                        {(viewAsManager ? ["Tiaret"] : availableWilayas).map(
                          (wilaya) => (
                            <option key={wilaya} value={wilaya}>
                              {wilaya}
                            </option>
                          )
                        )}
                      </select>
                    </div>
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
                      placeholder="e.g., 15 Rue de la Liberté, Centre Ville"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
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
                        placeholder="+213 XXX XXX XXX"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
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
                        placeholder="Mon-Fri: 10:00-22:00"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus: border-green-500 focus: outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Owner Info */}
              <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10">
                <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                  <FaUser className="text-blue-400" />
                  Owner Information
                </h2>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white font-bold mb-2">
                        Owner Name *
                      </label>
                      <input
                        type="text"
                        value={formData.ownerName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            ownerName: e.target.value,
                          })
                        }
                        placeholder="e.g., Ahmed Benali"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-white font-bold mb-2">
                        Owner Email *
                      </label>
                      <input
                        type="email"
                        value={formData.ownerEmail}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            ownerEmail: e.target.value,
                          })
                        }
                        placeholder="owner@example.com"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                    <p className="text-blue-400 text-sm flex items-center gap-2">
                      <FaKey />
                      Username and password will be generated automatically
                      after creation
                    </p>
                  </div>
                </div>
              </div>

              {/* Package */}
              <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10">
                <h2 className="text-2xl font-black text-white mb-6">Package</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  {packages.map((pkg) => (
                    <button
                      key={pkg}
                      type="button"
                      onClick={() => setFormData({ ...formData, package: pkg })}
                      className={`p-6 rounded-xl border-2 transition-all ${
                        formData.package === pkg
                          ? "bg-purple-500/20 border-purple-500 text-purple-400"
                          : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                      }`}
                    >
                      <div className="text-2xl font-black mb-2">{pkg}</div>
                      <div className="text-sm text-gray-400">
                        {pkg === "Basic" && "Essential features"}
                        {pkg === "Pro" && "Advanced features"}
                        {pkg === "Premium" && "All features"}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Logo Upload */}
              <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-black text-white mb-4">Logo</h3>
                {logoPreview ? (
                  <div className="relative group">
                    <img
                      src={logoPreview}
                      alt="Logo"
                      className="w-full h-48 object-cover rounded-xl border-2 border-white/10"
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
                      document.getElementById("logo-input")?.click()
                    }
                    className="h-48 rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center cursor-pointer hover:border-green-500 transition-all"
                  >
                    <FaImage className="w-12 h-12 text-gray-500 mb-2" />
                    <span className="text-gray-400">Upload Logo</span>
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

              {/* Actions */}
              <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10 space-y-4">
                <button
                  type="submit"
                  className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-black text-lg hover:scale-105 transition-all shadow-xl"
                >
                  Create Restaurant
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/admin/restaurants")}
                  className="w-full px-6 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gradient-to-b from-gray-900 to-black rounded-3xl border-2 border-green-500 w-full max-w-md p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheck className="text-3xl text-green-400" />
              </div>
              <h3 className="text-2xl font-black text-white mb-2">
                Restaurant Created!{" "}
              </h3>
              <p className="text-gray-400 mb-6">
                {formData.restaurantName} has been created successfully. Save
                these credentials:
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-white/5 rounded-xl p-4">
                <label className="block text-gray-400 text-sm mb-2">
                  Username
                </label>
                <div className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/10">
                  <span className="text-white font-mono font-bold">
                    {generatedCredentials.username}
                  </span>
                  <button
                    onClick={() =>
                      copyToClipboard(generatedCredentials.username, "username")
                    }
                    className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all"
                  >
                    {copied.username ? <FaCheck /> : <FaCopy />}
                  </button>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4">
                <label className="block text-gray-400 text-sm mb-2">
                  Password
                </label>
                <div className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/10">
                  <span className="text-white font-mono font-bold">
                    {generatedCredentials.password}
                  </span>
                  <button
                    onClick={() =>
                      copyToClipboard(generatedCredentials.password, "password")
                    }
                    className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all"
                  >
                    {copied.password ? <FaCheck /> : <FaCopy />}
                  </button>
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                <p className="text-yellow-400 text-sm">
                  ⚠️ These credentials are shown only once. Make sure to save
                  them.
                </p>
              </div>
            </div>

            <button
              onClick={handleSuccess}
              className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold hover:scale-105 transition-all"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
