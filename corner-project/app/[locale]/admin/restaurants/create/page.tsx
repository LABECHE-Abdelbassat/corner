"use client";

import React, { useState, useEffect } from "react";
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
  FaSpinner,
  FaAlignLeft,
} from "react-icons/fa";

// ==================== TYPES ====================
interface Wilaya {
  id: string;
  name: string;
  code: string;
}

const packages = [
  { value: "BASIC", label: "Basic", description: "Essential features" },
  { value: "PRO", label: "Pro", description: "Advanced features" },
  { value: "PREMIUM", label: "Premium", description: "All features" },
];

export default function CreateRestaurantPage() {
  const router = useRouter();
  const [viewAsManager, setViewAsManager] = useState(false);

  // Data states
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState({
    username: "",
    password: "",
  });
  const [copied, setCopied] = useState({ username: false, password: false });

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    wilayaId: "",
    address: "",
    phone: "",
    description: "",
    openingHours: "Mon-Fri: 10:00-22:00",
    ownerName: "",
    ownerEmail: "",
    package: "BASIC" as "BASIC" | "PRO" | "PREMIUM",
    logo: "",
    lat: "",
    lng: "",
    currency: "DZD",
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // ==================== FETCH WILAYAS ====================
  useEffect(() => {
    fetchWilayas();
  }, []);

  const fetchWilayas = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/wilayas", {
        credentials: "include",
      });
      const data = await response.json();

      if (data.success) {
        setWilayas(data.data.wilayas);
      } else {
        setError(data.error || "Failed to fetch wilayas");
      }
    } catch (err) {
      setError("Network error");
      console.error("Fetch wilayas error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ==================== HANDLE LOGO ====================
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 2MB)
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

  // ==================== HANDLE SUBMIT ====================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.wilayaId || !formData.ownerName) {
      alert("Please fill all required fields");
      return;
    }

    if (
      formData.ownerEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.ownerEmail)
    ) {
      alert("Please enter a valid email address");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const payload: any = {
        name: formData.name,
        wilayaId: formData.wilayaId,
        ownerName: formData.ownerName,
        package: formData.package,
        currency: formData.currency,
      };

      // Optional fields
      if (formData.address) payload.address = formData.address;
      if (formData.phone) payload.phone = formData.phone;
      if (formData.description) payload.description = formData.description;
      if (formData.openingHours) payload.openingHours = formData.openingHours;
      if (formData.ownerEmail) payload.ownerEmail = formData.ownerEmail;
      if (formData.logo) payload.logo = formData.logo;
      if (formData.lat) payload.lat = parseFloat(formData.lat);
      if (formData.lng) payload.lng = parseFloat(formData.lng);

      const response = await fetch("/api/admin/restaurants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        // Set credentials from backend response
        setGeneratedCredentials({
          username: data.data.ownerCredentials.username,
          password: data.data.ownerCredentials.password,
        });
        setShowSuccessModal(true);
      } else {
        alert(data.error || "Failed to create restaurant");
      }
    } catch (err) {
      alert("Network error.  Please try again.");
      console.error("Create restaurant error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // ==================== HELPER FUNCTIONS ====================
  const copyToClipboard = (text: string, field: "username" | "password") => {
    navigator.clipboard.writeText(text);
    setCopied({ ...copied, [field]: true });
    setTimeout(() => setCopied({ ...copied, [field]: false }), 2000);
  };

  const handleSuccess = () => {
    setShowSuccessModal(false);
    router.push("/admin/restaurants");
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
                fetchWilayas();
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
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
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
                        value={formData.wilayaId}
                        onChange={(e) =>
                          setFormData({ ...formData, wilayaId: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-green-500 focus:outline-none"
                        required
                      >
                        <option value="">Select Wilaya</option>
                        {wilayas.map((wilaya) => (
                          <option key={wilaya.id} value={wilaya.id}>
                            {wilaya.name} ({wilaya.code})
                          </option>
                        ))}
                      </select>
                      {wilayas.length === 0 && (
                        <p className="text-yellow-400 text-sm mt-2">
                          ⚠️ No wilayas available. Please create one first.
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-bold mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Brief description of the restaurant..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
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
                        placeholder="+213 555 123 456"
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

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white font-bold mb-2">
                        Latitude (Optional)
                      </label>
                      <input
                        type="number"
                        step="0.000001"
                        value={formData.lat}
                        onChange={(e) =>
                          setFormData({ ...formData, lat: e.target.value })
                        }
                        placeholder="e.g., 35.3709"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-white font-bold mb-2">
                        Longitude (Optional)
                      </label>
                      <input
                        type="number"
                        step="0.000001"
                        value={formData.lng}
                        onChange={(e) =>
                          setFormData({ ...formData, lng: e.target.value })
                        }
                        placeholder="e.g., 1.3219"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
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
                        Owner Email (Optional)
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
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus: border-green-500 focus: outline-none"
                      />
                    </div>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                    <p className="text-blue-400 text-sm flex items-center gap-2">
                      <FaKey />
                      Username and password will be generated automatically and
                      shown after creation
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
                      key={pkg.value}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, package: pkg.value as any })
                      }
                      className={`p-6 rounded-xl border-2 transition-all ${
                        formData.package === pkg.value
                          ? "bg-purple-500/20 border-purple-500 text-purple-400"
                          : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                      }`}
                    >
                      <div className="text-2xl font-black mb-2">
                        {pkg.label}
                      </div>
                      <div className="text-sm text-gray-400">
                        {pkg.description}
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
                <h3 className="text-xl font-black text-white mb-4">
                  Logo (Optional)
                </h3>
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
                    <span className="text-gray-400 text-sm">Upload Logo</span>
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

              {/* Actions */}
              <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10 space-y-4">
                <button
                  type="submit"
                  disabled={submitting || wilayas.length === 0}
                  className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-black text-lg hover:scale-105 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Restaurant"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/admin/restaurants")}
                  disabled={submitting}
                  className="w-full px-6 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all disabled:opacity-50"
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
                Restaurant Created!
              </h3>
              <p className="text-gray-400 mb-6">
                <span className="font-bold text-white">{formData.name}</span>{" "}
                has been created successfully. Save these credentials:
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
                    className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover: bg-blue-500/30 transition-all"
                  >
                    {copied.password ? <FaCheck /> : <FaCopy />}
                  </button>
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                <p className="text-yellow-400 text-sm">
                  ⚠️ These credentials are shown only once. Make sure to save
                  them and send them to the restaurant owner.
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
