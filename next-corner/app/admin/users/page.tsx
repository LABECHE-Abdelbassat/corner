"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaKey,
  FaCopy,
  FaCheck,
  FaTimes,
  FaSortUp,
  FaSortDown,
} from "react-icons/fa";

// Fake data
const fakeUsers = [
  {
    id: "u1",
    username: "ahmed_pizza",
    restaurant: "Pizza Palace",
    restaurantId: "rest1",
    role: "Owner",
    wilaya: "Tiaret",
    email: "ahmed@example.com",
    status: "active",
    createdDate: "2024-01-15",
  },
  {
    id: "u2",
    username: "karim_burger",
    restaurant: "Burger House",
    restaurantId: "rest2",
    role: "Owner",
    wilaya: "Tiaret",
    email: "karim@example.com",
    status: "active",
    createdDate: "2024-02-20",
  },
  {
    id: "u3",
    username: "manager_tiaret",
    restaurant: "-",
    restaurantId: null,
    role: "Manager",
    wilaya: "Tiaret",
    email: "manager.tiaret@admin.com",
    status: "active",
    createdDate: "2024-01-01",
  },
  {
    id: "u4",
    username: "fatima_bella",
    restaurant: "Bella Vista",
    restaurantId: "rest6",
    role: "Owner",
    wilaya: "Sidi Bel Abbès",
    email: "fatima@example.com",
    status: "active",
    createdDate: "2024-01-22",
  },
  {
    id: "u5",
    username: "manager_sba",
    restaurant: "-",
    restaurantId: null,
    role: "Manager",
    wilaya: "Sidi Bel Abbès",
    email: "manager.sba@admin.com",
    status: "active",
    createdDate: "2024-01-01",
  },
];

const fakeRestaurants = [
  { id: "rest1", name: "Pizza Palace", wilaya: "Tiaret" },
  { id: "rest2", name: "Burger House", wilaya: "Tiaret" },
  { id: "rest6", name: "Bella Vista", wilaya: "Sidi Bel Abbès" },
];

const availableWilayas = ["Tiaret", "Sidi Bel Abbès"];

export default function UsersPage() {
  const router = useRouter();
  const [viewAsManager, setViewAsManager] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "Owner" | "Manager">(
    "all"
  );
  const [wilayaFilter, setWilayaFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newPassword, setNewPassword] = useState("");
  const [copied, setCopied] = useState(false);

  // Create user form
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    role: "Owner" as "Owner" | "Manager",
    restaurantId: "",
    wilaya: "",
  });

  // Filter users
  let filteredUsers = viewAsManager
    ? fakeUsers.filter((u) => u.wilaya === "Tiaret")
    : fakeUsers;

  if (searchQuery) {
    filteredUsers = filteredUsers.filter(
      (u) =>
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.restaurant.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  if (roleFilter !== "all") {
    filteredUsers = filteredUsers.filter((u) => u.role === roleFilter);
  }

  if (wilayaFilter.length > 0) {
    filteredUsers = filteredUsers.filter((u) =>
      wilayaFilter.includes(u.wilaya)
    );
  }

  if (statusFilter !== "all") {
    filteredUsers = filteredUsers.filter((u) => u.status === statusFilter);
  }

  const toggleWilaya = (wilaya: string) => {
    if (wilayaFilter.includes(wilaya)) {
      setWilayaFilter(wilayaFilter.filter((w) => w !== wilaya));
    } else {
      setWilayaFilter([...wilayaFilter, wilaya]);
    }
  };

  const handleResetPassword = (user: any) => {
    const generatedPassword = Math.random()
      .toString(36)
      .slice(-8)
      .toUpperCase();
    setNewPassword(generatedPassword);
    setSelectedUser(user);
    setShowResetPasswordModal(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(newPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateUser = () => {
    console.log("Create user:", newUser);
    // API call here
    setShowCreateModal(false);
    setNewUser({
      username: "",
      password: "",
      role: "Owner",
      restaurantId: "",
      wilaya: "",
    });
  };

  const handleDeleteUser = () => {
    console.log("Delete user:", selectedUser);
    setShowDeleteModal(false);
    setSelectedUser(null);
  };

  return (
    <AdminLayout
      viewAsManager={viewAsManager}
      setViewAsManager={setViewAsManager}
      title="User Management"
      subtitle="Manage restaurant owners and managers"
    >
      <div className="p-4 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-400">
              {filteredUsers.length} users in system
            </h2>
          </div>
          {!viewAsManager && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#FFCE18] to-[#ffd94d] text-black font-black text-lg hover:scale-110 transition-all shadow-2xl flex items-center gap-2"
            >
              <FaPlus /> Create User
            </button>
          )}
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
                  placeholder="Search by username, email, or restaurant..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#FFCE18] focus:outline-none"
                />
              </div>
            </div>

            {/* Role Filter */}
            <div>
              <label className="block text-white font-bold mb-2 text-sm">
                Role
              </label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#FFCE18] focus: outline-none appearance-none cursor-pointer"
              >
                <option value="all">All Roles</option>
                <option value="Owner">Owner</option>
                <option value="Manager">Manager</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-white font-bold mb-2 text-sm">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#FFCE18] focus:outline-none appearance-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Wilaya Multi-Select */}
          {!viewAsManager && (
            <div className="mt-4">
              <label className="block text-white font-bold mb-2 text-sm">
                Wilayas
              </label>
              <div className="flex gap-2 flex-wrap">
                {availableWilayas.map((wilaya) => (
                  <button
                    key={wilaya}
                    onClick={() => toggleWilaya(wilaya)}
                    className={`px-4 py-2 rounded-xl font-bold transition-all ${
                      wilayaFilter.includes(wilaya)
                        ? "bg-[#FFCE18]/20 border-2 border-[#FFCE18] text-[#FFCE18]"
                        : "bg-white/5 border-2 border-white/10 text-white hover:bg-white/10"
                    }`}
                  >
                    {wilaya}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-white font-bold">
                    Username
                  </th>
                  <th className="text-left p-4 text-white font-bold">
                    Restaurant
                  </th>
                  <th className="text-left p-4 text-white font-bold">Role</th>
                  <th className="text-left p-4 text-white font-bold">Wilaya</th>
                  <th className="text-left p-4 text-white font-bold">Status</th>
                  <th className="text-right p-4 text-white font-bold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-all"
                  >
                    <td className="p-4">
                      <div className="text-white font-bold">
                        {user.username}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="p-4 text-white">{user.restaurant}</td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-bold ${
                          user.role === "Owner"
                            ? "bg-purple-500/20 text-purple-400"
                            : "bg-blue-500/20 text-blue-400"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-bold">
                        {user.wilaya}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 w-fit ${
                          user.status === "active"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {user.status === "active" ? (
                          <FaCheckCircle />
                        ) : (
                          <FaTimesCircle />
                        )}
                        {user.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleResetPassword(user)}
                          className="p-2 rounded-lg bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-all"
                          title="Reset Password"
                        >
                          <FaKey />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
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
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gradient-to-b from-gray-900 to-black rounded-3xl border border-white/10 w-full max-w-md p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-white">
                Create New User
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg"
              >
                <FaTimes className="text-white" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white font-bold mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) =>
                    setNewUser({ ...newUser, username: e.target.value })
                  }
                  placeholder="username"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#FFCE18] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-white font-bold mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  placeholder="password"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#FFCE18] focus: outline-none"
                />
              </div>

              <div>
                <label className="block text-white font-bold mb-2">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({
                      ...newUser,
                      role: e.target.value as "Owner" | "Manager",
                      restaurantId: "",
                      wilaya: "",
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#FFCE18] focus:outline-none"
                >
                  <option value="Owner">Owner</option>
                  <option value="Manager">Manager</option>
                </select>
              </div>

              {newUser.role === "Owner" && (
                <div>
                  <label className="block text-white font-bold mb-2">
                    Assign Restaurant
                  </label>
                  <select
                    value={newUser.restaurantId}
                    onChange={(e) =>
                      setNewUser({ ...newUser, restaurantId: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus: border-[#FFCE18] focus:outline-none"
                  >
                    <option value="">Select Restaurant</option>
                    {fakeRestaurants.map((rest) => (
                      <option key={rest.id} value={rest.id}>
                        {rest.name} ({rest.wilaya})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {newUser.role === "Manager" && (
                <div>
                  <label className="block text-white font-bold mb-2">
                    Assign Wilaya
                  </label>
                  <select
                    value={newUser.wilaya}
                    onChange={(e) =>
                      setNewUser({ ...newUser, wilaya: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus: border-[#FFCE18] focus:outline-none"
                  >
                    <option value="">Select Wilaya</option>
                    {availableWilayas.map((wilaya) => (
                      <option key={wilaya} value={wilaya}>
                        {wilaya}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-6 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateUser}
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-[#FFCE18] to-[#ffd94d] text-black font-bold hover:scale-105 transition-all"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gradient-to-b from-gray-900 to-black rounded-3xl border-2 border-yellow-500 w-full max-w-md p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaKey className="text-3xl text-yellow-400" />
              </div>
              <h3 className="text-2xl font-black text-white mb-2">
                Password Reset
              </h3>
              <p className="text-gray-400 mb-6">
                New password for{" "}
                <span className="font-bold text-white">
                  {selectedUser?.username}
                </span>
              </p>
            </div>

            <div className="bg-white/5 rounded-xl p-4 mb-6">
              <label className="block text-gray-400 text-sm mb-2">
                New Password
              </label>
              <div className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/10">
                <span className="text-white font-mono font-bold text-lg">
                  {newPassword}
                </span>
                <button
                  onClick={copyToClipboard}
                  className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all"
                >
                  {copied ? <FaCheck /> : <FaCopy />}
                </button>
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
              <p className="text-yellow-400 text-sm">
                ⚠️ Make sure to save this password. It will not be shown again.
              </p>
            </div>

            <button
              onClick={() => setShowResetPasswordModal(false)}
              className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-[#FFCE18] to-[#ffd94d] text-black font-bold hover:scale-105 transition-all"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gradient-to-b from-gray-900 to-black rounded-3xl border-2 border-red-500 w-full max-w-md p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTrash className="text-3xl text-red-400" />
              </div>
              <h3 className="text-2xl font-black text-white mb-2">
                Delete User
              </h3>
              <p className="text-gray-400">
                Are you sure you want to delete{" "}
                <span className="font-bold text-white">
                  {selectedUser?.username}
                </span>
                ?
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
                onClick={handleDeleteUser}
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
