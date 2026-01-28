"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaMapMarkerAlt,
  FaUserTie,
  FaStore,
  FaTimes,
  FaCheck,
  FaExclamationTriangle,
  FaSpinner,
} from "react-icons/fa";

// ==================== TYPES ====================
interface Manager {
  id: string;
  username: string;
  email: string | null;
  status: string;
}

interface Wilaya {
  id: string;
  name: string;
  code: string;
  lat: number;
  lng: number;
  gradient: string;
  createdAt: string;
  updatedAt: string;
  manager?: Manager | null;
  _count?: {
    restaurants: number;
  };
}

const gradientOptions = [
  { name: "Blue Cyan", value: "from-blue-500 to-cyan-500" },
  { name: "Purple Pink", value: "from-purple-500 to-pink-500" },
  { name: "Green Emerald", value: "from-green-500 to-emerald-500" },
  { name: "Orange Red", value: "from-orange-500 to-red-500" },
  { name: "Yellow Orange", value: "from-yellow-500 to-orange-500" },
  { name: "Indigo Purple", value: "from-indigo-500 to-purple-500" },
];

export default function WilayasPage() {
  const router = useRouter();
  const [viewAsManager, setViewAsManager] = useState(false);

  // Data states
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [availableManagers, setAvailableManagers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedWilaya, setSelectedWilaya] = useState<Wilaya | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    lat: "",
    lng: "",
    managerId: "",
    gradient: "from-blue-500 to-cyan-500",
  });

  // ==================== FETCH DATA ====================
  useEffect(() => {
    fetchWilayas();
    fetchAvailableManagers();
  }, []);

  const fetchWilayas = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/wilayas? includeStats=true", {
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

  const fetchAvailableManagers = async () => {
    try {
      const response = await fetch("/api/admin/users?role=MANAGER", {
        credentials: "include",
      });
      const data = await response.json();

      if (data.success) {
        // Filter managers without a wilaya
        const available = data.data.users.filter((u: any) => !u.wilayaId);
        setAvailableManagers(available);
      }
    } catch (err) {
      console.error("Fetch managers error:", err);
    }
  };

  // ==================== MODAL HANDLERS ====================
  const openAddModal = () => {
    setFormData({
      name: "",
      code: "",
      lat: "",
      lng: "",
      managerId: "",
      gradient: "from-blue-500 to-cyan-500",
    });
    setShowAddModal(true);
  };

  const openEditModal = (wilaya: Wilaya) => {
    setSelectedWilaya(wilaya);
    setFormData({
      name: wilaya.name,
      code: wilaya.code,
      lat: wilaya.lat.toString(),
      lng: wilaya.lng.toString(),
      managerId: wilaya.manager?.id || "",
      gradient: wilaya.gradient,
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (wilaya: Wilaya) => {
    setSelectedWilaya(wilaya);
    setShowDeleteModal(true);
  };

  // ==================== CRUD OPERATIONS ====================
  const handleAdd = async () => {
    if (!formData.name || !formData.code || !formData.lat || !formData.lng) {
      alert("Please fill all required fields");
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch("/api/admin/wilayas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: formData.name,
          code: formData.code,
          lat: parseFloat(formData.lat),
          lng: parseFloat(formData.lng),
          gradient: formData.gradient,
          managerId: formData.managerId || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Wilaya created successfully!");
        setShowAddModal(false);
        fetchWilayas();
        fetchAvailableManagers();
      } else {
        alert(data.error || "Failed to create wilaya");
      }
    } catch (err) {
      alert("Network error");
      console.error("Create wilaya error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedWilaya) return;

    if (!formData.name || !formData.code || !formData.lat || !formData.lng) {
      alert("Please fill all required fields");
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch(`/api/admin/wilayas/${selectedWilaya.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: formData.name,
          code: formData.code,
          lat: parseFloat(formData.lat),
          lng: parseFloat(formData.lng),
          gradient: formData.gradient,
          managerId: formData.managerId || null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Wilaya updated successfully!");
        setShowEditModal(false);
        setSelectedWilaya(null);
        fetchWilayas();
        fetchAvailableManagers();
      } else {
        alert(data.error || "Failed to update wilaya");
      }
    } catch (err) {
      alert("Network error");
      console.error("Update wilaya error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedWilaya) return;

    const restaurantCount = selectedWilaya._count?.restaurants || 0;
    if (restaurantCount > 0) {
      alert(`Cannot delete: ${restaurantCount} restaurants in this wilaya`);
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch(`/api/admin/wilayas/${selectedWilaya.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        alert("Wilaya deleted successfully!");
        setShowDeleteModal(false);
        setSelectedWilaya(null);
        fetchWilayas();
        fetchAvailableManagers();
      } else {
        alert(data.error || "Failed to delete wilaya");
      }
    } catch (err) {
      alert("Network error");
      console.error("Delete wilaya error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // ==================== RENDER ====================
  if (viewAsManager) {
    return (
      <AdminLayout
        viewAsManager={viewAsManager}
        setViewAsManager={setViewAsManager}
        title="Wilaya Management"
        subtitle="Access restricted to Super Admins"
      >
        <div className="p-4 lg:p-8">
          <div className="backdrop-blur-xl bg-red-500/10 border-2 border-red-500 rounded-2xl p-8 text-center">
            <FaExclamationTriangle className="text-6xl text-red-400 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-white mb-2">
              Access Denied
            </h3>
            <p className="text-gray-400">
              Only Super Admins can manage wilayas
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (loading) {
    return (
      <AdminLayout
        viewAsManager={viewAsManager}
        setViewAsManager={setViewAsManager}
        title="Wilaya Management"
        subtitle="Manage regions and assign managers"
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
        title="Wilaya Management"
        subtitle="Manage regions and assign managers"
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
      title="Wilaya Management"
      subtitle="Manage regions and assign managers"
    >
      <div className="p-4 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-400">
              {wilayas.length} wilayas in system
            </h2>
          </div>
          <button
            onClick={openAddModal}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#FFCE18] to-[#ffd94d] text-black font-black text-lg hover:scale-110 transition-all shadow-2xl flex items-center gap-2"
          >
            <FaPlus /> Add Wilaya
          </button>
        </div>

        {/* Wilaya Cards */}
        {wilayas.length === 0 ? (
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-12 border border-white/10 text-center">
            <FaMapMarkerAlt className="text-6xl text-gray-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">
              No Wilayas Yet
            </h3>
            <p className="text-gray-400">
              Click "Add Wilaya" to create your first region
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 lg:grid-cols-3">
            {wilayas.map((wilaya) => {
              const restaurantCount = wilaya._count?.restaurants || 0;

              return (
                <div
                  key={wilaya.id}
                  className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10 hover:scale-105 transition-all"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div
                      className={`px-4 py-2 rounded-full bg-gradient-to-r ${wilaya.gradient} text-white font-bold text-sm`}
                    >
                      {wilaya.code}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(wilaya)}
                        className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => openDeleteModal(wilaya)}
                        disabled={restaurantCount > 0}
                        className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        title={
                          restaurantCount > 0
                            ? "Cannot delete: has restaurants"
                            : "Delete wilaya"
                        }
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-2xl font-black text-white mb-4">
                    {wilaya.name}
                  </h3>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-gray-400">
                      <FaUserTie className="text-[#FFCE18]" />
                      <div>
                        <div className="text-sm text-gray-500">Manager</div>
                        <div className="text-white font-bold">
                          {wilaya.manager?.username || (
                            <span className="text-gray-500">No manager</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-gray-400">
                      <FaStore className="text-[#FFCE18]" />
                      <div>
                        <div className="text-sm text-gray-500">Restaurants</div>
                        <div className="text-white font-bold">
                          {restaurantCount}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-gray-400">
                      <FaMapMarkerAlt className="text-[#FFCE18]" />
                      <div>
                        <div className="text-sm text-gray-500">Coordinates</div>
                        <div className="text-white font-bold text-xs">
                          {wilaya.lat.toFixed(4)}, {wilaya.lng.toFixed(4)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`w-full h-2 rounded-full bg-gradient-to-r ${wilaya.gradient}`}
                  ></div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Wilaya Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gradient-to-b from-gray-900 to-black rounded-3xl border border-white/10 w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-3xl font-black text-white">Add New Wilaya</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg"
              >
                <FaTimes className="text-white" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-bold mb-2">
                    Wilaya Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Alger"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#FFCE18] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-white font-bold mb-2">
                    Wilaya Code *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    placeholder="e.g., 16"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#FFCE18] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-bold mb-2">
                    Latitude *
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.lat}
                    onChange={(e) =>
                      setFormData({ ...formData, lat: e.target.value })
                    }
                    placeholder="e.g., 36.7538"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#FFCE18] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-white font-bold mb-2">
                    Longitude *
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.lng}
                    onChange={(e) =>
                      setFormData({ ...formData, lng: e.target.value })
                    }
                    placeholder="e.g., 3.0588"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#FFCE18] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white font-bold mb-2">
                  Assign Manager (Optional)
                </label>
                <select
                  value={formData.managerId}
                  onChange={(e) =>
                    setFormData({ ...formData, managerId: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#FFCE18] focus:outline-none"
                >
                  <option value="">No Manager (Assign Later)</option>
                  {availableManagers.map((manager) => (
                    <option key={manager.id} value={manager.id}>
                      {manager.username} - {manager.email || "No email"}
                    </option>
                  ))}
                </select>
                {availableManagers.length === 0 && (
                  <p className="text-yellow-400 text-sm mt-2">
                    ⚠️ No available managers without wilaya assignments
                  </p>
                )}
              </div>

              <div>
                <label className="block text-white font-bold mb-2">
                  Color Theme
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {gradientOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() =>
                        setFormData({ ...formData, gradient: option.value })
                      }
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.gradient === option.value
                          ? "border-[#FFCE18]"
                          : "border-white/10"
                      }`}
                    >
                      <div
                        className={`w-full h-8 rounded-lg bg-gradient-to-r ${option.value} mb-2`}
                      ></div>
                      <div className="text-white text-sm font-bold">
                        {option.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setShowAddModal(false)}
                disabled={actionLoading}
                className="flex-1 px-6 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={actionLoading}
                className="flex-1 px-6 py-4 rounded-xl bg-gradient-to-r from-[#FFCE18] to-[#ffd94d] text-black font-black text-lg hover:scale-105 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Wilaya"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Wilaya Modal */}
      {showEditModal && selectedWilaya && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gradient-to-b from-gray-900 to-black rounded-3xl border border-white/10 w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-3xl font-black text-white">Edit Wilaya</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg"
              >
                <FaTimes className="text-white" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-bold mb-2">
                    Wilaya Name *
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
                    Wilaya Code *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus: border-[#FFCE18] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-bold mb-2">
                    Latitude *
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.lat}
                    onChange={(e) =>
                      setFormData({ ...formData, lat: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#FFCE18] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-white font-bold mb-2">
                    Longitude *
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.lng}
                    onChange={(e) =>
                      setFormData({ ...formData, lng: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#FFCE18] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white font-bold mb-2">
                  Assign Manager
                </label>
                <select
                  value={formData.managerId}
                  onChange={(e) =>
                    setFormData({ ...formData, managerId: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus: border-[#FFCE18] focus:outline-none"
                >
                  <option value="">No Manager</option>
                  {/* Show current manager even if not in available list */}
                  {selectedWilaya.manager &&
                    !availableManagers.find(
                      (m) => m.id === selectedWilaya.manager?.id
                    ) && (
                      <option value={selectedWilaya.manager.id}>
                        {selectedWilaya.manager.username} (Current)
                      </option>
                    )}
                  {availableManagers.map((manager) => (
                    <option key={manager.id} value={manager.id}>
                      {manager.username} - {manager.email || "No email"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white font-bold mb-2">
                  Color Theme
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {gradientOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() =>
                        setFormData({ ...formData, gradient: option.value })
                      }
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.gradient === option.value
                          ? "border-[#FFCE18]"
                          : "border-white/10"
                      }`}
                    >
                      <div
                        className={`w-full h-8 rounded-lg bg-gradient-to-r ${option.value} mb-2`}
                      ></div>
                      <div className="text-white text-sm font-bold">
                        {option.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setShowEditModal(false)}
                disabled={actionLoading}
                className="flex-1 px-6 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all disabled: opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEdit}
                disabled={actionLoading}
                className="flex-1 px-6 py-4 rounded-xl bg-gradient-to-r from-[#FFCE18] to-[#ffd94d] text-black font-black text-lg hover: scale-105 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedWilaya && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gradient-to-b from-gray-900 to-black rounded-3xl border-2 border-red-500 w-full max-w-md p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTrash className="text-3xl text-red-400" />
              </div>
              <h3 className="text-2xl font-black text-white mb-2">
                Delete Wilaya
              </h3>
              <p className="text-gray-400 mb-4">
                Are you sure you want to delete{" "}
                <span className="font-bold text-white">
                  {selectedWilaya.name}
                </span>
                ?
              </p>
              {(selectedWilaya._count?.restaurants || 0) > 0 && (
                <div className="bg-red-500/10 border border-red-500 rounded-xl p-4 text-red-400 text-sm">
                  Cannot delete: {selectedWilaya._count?.restaurants}{" "}
                  restaurants in this wilaya. Please reassign or delete them
                  first.
                </div>
              )}
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedWilaya(null);
                }}
                disabled={actionLoading}
                className="flex-1 px-6 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={
                  actionLoading || (selectedWilaya._count?.restaurants || 0) > 0
                }
                className="flex-1 px-6 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
