"use client";

import React, { useState } from "react";
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
} from "react-icons/fa";

// Fake data
const fakeWilayas = [
  {
    id: "tiaret",
    name: "Tiaret",
    code: "14",
    lat: 35.3709,
    lng: 1.3219,
    manager: "Mohamed Amine",
    managerId: "u3",
    restaurantCount: 5,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    id: "sidi-bel-abbes",
    name: "Sidi Bel Abbès",
    code: "22",
    lat: 35.2106,
    lng: -0.63,
    manager: "Fatima Zohra",
    managerId: "u5",
    restaurantCount: 4,
    gradient: "from-purple-500 to-pink-500",
  },
];

const availableManagers = [
  { id: "u3", name: "Mohamed Amine", username: "manager_tiaret" },
  { id: "u5", name: "Fatima Zohra", username: "manager_sba" },
  { id: "u6", name: "Karim Mansouri", username: "manager_new" },
];

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
  const [wilayas, setWilayas] = useState(fakeWilayas);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedWilaya, setSelectedWilaya] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    lat: "",
    lng: "",
    managerId: "",
    gradient: "from-blue-500 to-cyan-500",
  });

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

  const openEditModal = (wilaya: any) => {
    setSelectedWilaya(wilaya);
    setFormData({
      name: wilaya.name,
      code: wilaya.code,
      lat: wilaya.lat.toString(),
      lng: wilaya.lng.toString(),
      managerId: wilaya.managerId,
      gradient: wilaya.gradient,
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (wilaya: any) => {
    setSelectedWilaya(wilaya);
    setShowDeleteModal(true);
  };

  const handleAdd = () => {
    if (
      !formData.name ||
      !formData.code ||
      !formData.lat ||
      !formData.lng ||
      !formData.managerId
    ) {
      alert("Please fill all fields");
      return;
    }

    const manager = availableManagers.find((m) => m.id === formData.managerId);
    const newWilaya = {
      id: formData.name.toLowerCase().replace(/\s+/g, "-"),
      name: formData.name,
      code: formData.code,
      lat: parseFloat(formData.lat),
      lng: parseFloat(formData.lng),
      manager: manager?.name || "",
      managerId: formData.managerId,
      restaurantCount: 0,
      gradient: formData.gradient,
    };

    setWilayas([...wilayas, newWilaya]);
    setShowAddModal(false);
    console.log("Add wilaya:", newWilaya);
  };

  const handleEdit = () => {
    if (
      !formData.name ||
      !formData.code ||
      !formData.lat ||
      !formData.lng ||
      !formData.managerId
    ) {
      alert("Please fill all fields");
      return;
    }

    const manager = availableManagers.find((m) => m.id === formData.managerId);
    const updatedWilaya = {
      ...selectedWilaya,
      name: formData.name,
      code: formData.code,
      lat: parseFloat(formData.lat),
      lng: parseFloat(formData.lng),
      manager: manager?.name || "",
      managerId: formData.managerId,
      gradient: formData.gradient,
    };

    setWilayas(
      wilayas.map((w) => (w.id === selectedWilaya.id ? updatedWilaya : w))
    );
    setShowEditModal(false);
    console.log("Edit wilaya:", updatedWilaya);
  };

  const handleDelete = () => {
    if (selectedWilaya.restaurantCount > 0) {
      alert(
        `Cannot delete:  ${selectedWilaya.restaurantCount} restaurants in this wilaya`
      );
      return;
    }

    setWilayas(wilayas.filter((w) => w.id !== selectedWilaya.id));
    setShowDeleteModal(false);
    console.log("Delete wilaya:", selectedWilaya);
  };

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
        <div className="grid md:grid-cols-2 gap-12 p-4 lg:grid-cols-3">
          {wilayas.map((wilaya) => (
            <div
              key={wilaya.id}
              className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10 hover: scale-105 transition-all"
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
                    disabled={wilaya.restaurantCount > 0}
                    className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    title={
                      wilaya.restaurantCount > 0
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
                    <div className="text-white font-bold">{wilaya.manager}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-400">
                  <FaStore className="text-[#FFCE18]" />
                  <div>
                    <div className="text-sm text-gray-500">Restaurants</div>
                    <div className="text-white font-bold">
                      {wilaya.restaurantCount}
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
          ))}
        </div>
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
                  Assign Manager *
                </label>
                <select
                  value={formData.managerId}
                  onChange={(e) =>
                    setFormData({ ...formData, managerId: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#FFCE18] focus:outline-none"
                >
                  <option value="">Select Manager</option>
                  {availableManagers.map((manager) => (
                    <option key={manager.id} value={manager.id}>
                      {manager.name} (@{manager.username})
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
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-6 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="flex-1 px-6 py-4 rounded-xl bg-gradient-to-r from-[#FFCE18] to-[#ffd94d] text-black font-black text-lg hover: scale-105 transition-all"
              >
                Add Wilaya
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Wilaya Modal */}
      {showEditModal && (
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
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#FFCE18] focus:outline-none"
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
                  Assign Manager *
                </label>
                <select
                  value={formData.managerId}
                  onChange={(e) =>
                    setFormData({ ...formData, managerId: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#FFCE18] focus:outline-none"
                >
                  {availableManagers.map((manager) => (
                    <option key={manager.id} value={manager.id}>
                      {manager.name} (@{manager.username})
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
                className="flex-1 px-6 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleEdit}
                className="flex-1 px-6 py-4 rounded-xl bg-gradient-to-r from-[#FFCE18] to-[#ffd94d] text-black font-black text-lg hover:scale-105 transition-all"
              >
                Save Changes
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
              {selectedWilaya.restaurantCount > 0 && (
                <div className="bg-red-500/10 border border-red-500 rounded-xl p-4 text-red-400 text-sm">
                  Cannot delete: {selectedWilaya.restaurantCount} restaurants in
                  this wilaya
                </div>
              )}
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedWilaya(null);
                }}
                className="flex-1 px-6 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={selectedWilaya.restaurantCount > 0}
                className="flex-1 px-6 py-3 rounded-xl bg-red-500 text-white font-bold hover: bg-red-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
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
