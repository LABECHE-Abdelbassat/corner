"use client";

import React, { useState, useEffect } from "react";
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
  FaSpinner,
} from "react-icons/fa";

// ==================== TYPES ====================
type UserRole = "SUPER_ADMIN" | "MANAGER" | "OWNER";
type UserStatus = "ACTIVE" | "INACTIVE";

interface User {
  id: string;
  username: string;
  email: string | null;
  role: UserRole;
  status: UserStatus;
  restaurantId: string | null;
  wilayaId: string | null;
  createdAt: string;
  updatedAt: string;
  restaurant?: {
    wilaya: any;
    id: string;
    name: string;
    slug: string;
  } | null;
  managedWilaya?: {
    id: string;
    name: string;
    code: string;
  } | null;
}

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  wilayaId: string;
  wilaya: {
    name: string;
  };
}

interface Wilaya {
  id: string;
  name: string;
  code: string;
  manager?: {
    id: string;
    username: string;
  } | null;
}

export default function UsersPage() {
  const router = useRouter();
  const [viewAsManager, setViewAsManager] = useState(false);

  // Data states
  const [users, setUsers] = useState<User[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
  const [wilayaFilter, setWilayaFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | UserStatus>("all");

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Create user form
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    email: "",
    role: "OWNER" as UserRole,
    restaurantId: "",
    wilayaId: "",
  });

  // ==================== FETCH DATA ====================
  useEffect(() => {
    fetchUsers();
    fetchRestaurants();
    fetchWilayas();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/users", {
        credentials: "include",
      });
      const data = await response.json();

      if (data.success) {
        setUsers(data.data.users);
      } else {
        setError(data.error || "Failed to fetch users");
      }
    } catch (err) {
      setError("Network error");
      console.error("Fetch users error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRestaurants = async () => {
    try {
      const response = await fetch("/api/admin/restaurants", {
        credentials: "include",
      });
      const data = await response.json();

      if (data.success) {
        // Only show restaurants without owners
        const availableRestaurants = data.data.restaurants.filter(
          (r: any) => !r.owner
        );
        setRestaurants(availableRestaurants);
      }
    } catch (err) {
      console.error("Fetch restaurants error:", err);
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

  // ==================== FILTER USERS ====================
  const filteredUsers = users.filter((user) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        user.username.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.restaurant?.name.toLowerCase().includes(query) ||
        user.managedWilaya?.name.toLowerCase().includes(query);

      if (!matchesSearch) return false;
    }

    // Role filter
    if (roleFilter !== "all" && user.role !== roleFilter) {
      return false;
    }

    // Wilaya filter
    if (wilayaFilter.length > 0) {
      const userWilaya =
        user.restaurant?.wilaya?.name || user.managedWilaya?.name;
      if (!userWilaya || !wilayaFilter.includes(userWilaya)) {
        return false;
      }
    }

    // Status filter
    if (statusFilter !== "all" && user.status !== statusFilter) {
      return false;
    }

    return true;
  });

  // ==================== ACTIONS ====================
  const handleCreateUser = async () => {
    if (!newUser.username || !newUser.password) {
      alert("Username and password are required");
      return;
    }

    if (newUser.role === "OWNER" && !newUser.restaurantId) {
      alert("Please select a restaurant for the owner");
      return;
    }

    if (newUser.role === "MANAGER" && !newUser.wilayaId) {
      alert("Please select a wilaya for the manager");
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username: newUser.username,
          password: newUser.password,
          email: newUser.email || undefined,
          role: newUser.role,
          restaurantId: newUser.restaurantId || undefined,
          wilayaId: newUser.wilayaId || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("User created successfully!");
        setShowCreateModal(false);
        setNewUser({
          username: "",
          password: "",
          email: "",
          role: "OWNER",
          restaurantId: "",
          wilayaId: "",
        });
        fetchUsers();
        fetchRestaurants(); // Refresh to update available restaurants
        fetchWilayas(); // Refresh to update available wilayas
      } else {
        alert(data.error || "Failed to create user");
      }
    } catch (err) {
      alert("Network error");
      console.error("Create user error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPassword = async (user: User) => {
    const generatedPassword =
      Math.random().toString(36).slice(-8) +
      Math.random().toString(36).slice(-8);

    try {
      setActionLoading(true);
      const response = await fetch(
        `/api/admin/users/${user.id}/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ newPassword: generatedPassword }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setNewPassword(generatedPassword);
        setSelectedUser(user);
        setShowResetPasswordModal(true);
      } else {
        alert(data.error || "Failed to reset password");
      }
    } catch (err) {
      alert("Network error");
      console.error("Reset password error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      setActionLoading(true);
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        alert("User deleted successfully!");
        setShowDeleteModal(false);
        setSelectedUser(null);
        fetchUsers();
        fetchRestaurants(); // Refresh to update available restaurants
        fetchWilayas(); // Refresh to update available wilayas
      } else {
        alert(data.error || "Failed to delete user");
      }
    } catch (err) {
      alert("Network error");
      console.error("Delete user error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(newPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleWilaya = (wilayaName: string) => {
    if (wilayaFilter.includes(wilayaName)) {
      setWilayaFilter(wilayaFilter.filter((w) => w !== wilayaName));
    } else {
      setWilayaFilter([...wilayaFilter, wilayaName]);
    }
  };

  // Get available wilayas (without managers)
  const availableWilayas = wilayas.filter((w) => !w.manager);

  // ==================== RENDER ====================
  if (loading) {
    return (
      <AdminLayout
        viewAsManager={viewAsManager}
        setViewAsManager={setViewAsManager}
        title="User Management"
        subtitle="Manage restaurant owners and managers"
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
        title="User Management"
        subtitle="Manage restaurant owners and managers"
      >
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-2xl font-bold text-white mb-2">Error</h3>
            <p className="text-gray-400">{error}</p>
            <button
              onClick={() => {
                setError("");
                fetchUsers();
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
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#FFCE18] focus: outline-none"
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
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="MANAGER">Manager</option>
                <option value="OWNER">Owner</option>
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
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          {/* Wilaya Multi-Select */}
          {!viewAsManager && wilayas.length > 0 && (
            <div className="mt-4">
              <label className="block text-white font-bold mb-2 text-sm">
                Wilayas
              </label>
              <div className="flex gap-2 flex-wrap">
                {wilayas.map((wilaya) => (
                  <button
                    key={wilaya.id}
                    onClick={() => toggleWilaya(wilaya.name)}
                    className={`px-4 py-2 rounded-xl font-bold transition-all ${
                      wilayaFilter.includes(wilaya.name)
                        ? "bg-[#FFCE18]/20 border-2 border-[#FFCE18] text-[#FFCE18]"
                        : "bg-white/5 border-2 border-white/10 text-white hover:bg-white/10"
                    }`}
                  >
                    {wilaya.name}
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
                    Restaurant / Wilaya
                  </th>
                  <th className="text-left p-4 text-white font-bold">Role</th>
                  <th className="text-left p-4 text-white font-bold">Status</th>
                  <th className="text-right p-4 text-white font-bold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-400">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-all"
                    >
                      <td className="p-4">
                        <div className="text-white font-bold">
                          {user.username}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email || "No email"}
                        </div>
                      </td>
                      <td className="p-4 text-white">
                        {user.restaurant ? (
                          <div>
                            <div className="font-bold">
                              {user.restaurant.name}
                            </div>
                            <div className="text-sm text-gray-400">
                              {user.restaurant.wilaya?.name || "N/A"}
                            </div>
                          </div>
                        ) : user.managedWilaya ? (
                          <div>
                            <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-bold">
                              {user.managedWilaya.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-bold ${
                            user.role === "SUPER_ADMIN"
                              ? "bg-red-500/20 text-red-400"
                              : user.role === "MANAGER"
                              ? "bg-blue-500/20 text-blue-400"
                              : "bg-purple-500/20 text-purple-400"
                          }`}
                        >
                          {user.role === "SUPER_ADMIN"
                            ? "Super Admin"
                            : user.role === "MANAGER"
                            ? "Manager"
                            : "Owner"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 w-fit ${
                            user.status === "ACTIVE"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {user.status === "ACTIVE" ? (
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
                            disabled={actionLoading}
                            className="p-2 rounded-lg bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-all disabled:opacity-50"
                            title="Reset Password"
                          >
                            <FaKey />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowDeleteModal(true);
                            }}
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
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gradient-to-b from-gray-900 to-black rounded-3xl border border-white/10 w-full max-w-md p-8 max-h-[90vh] overflow-y-auto">
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
                  Username *
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
                  Password *
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  placeholder="password (min 6 characters)"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#FFCE18] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-white font-bold mb-2">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  placeholder="email@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#FFCE18] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-white font-bold mb-2">
                  Role *
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({
                      ...newUser,
                      role: e.target.value as UserRole,
                      restaurantId: "",
                      wilayaId: "",
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#FFCE18] focus:outline-none"
                >
                  <option value="OWNER">Owner</option>
                  <option value="MANAGER">Manager</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>

              {newUser.role === "OWNER" && (
                <div>
                  <label className="block text-white font-bold mb-2">
                    Assign Restaurant *
                  </label>
                  <select
                    value={newUser.restaurantId}
                    onChange={(e) =>
                      setNewUser({ ...newUser, restaurantId: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#FFCE18] focus:outline-none"
                  >
                    <option value="">Select Restaurant</option>
                    {restaurants.map((rest) => (
                      <option key={rest.id} value={rest.id}>
                        {rest.name} ({rest.wilaya.name})
                      </option>
                    ))}
                  </select>
                  {restaurants.length === 0 && (
                    <p className="text-yellow-400 text-sm mt-2">
                      ⚠️ No restaurants available without owners
                    </p>
                  )}
                </div>
              )}

              {newUser.role === "MANAGER" && (
                <div>
                  <label className="block text-white font-bold mb-2">
                    Assign Wilaya *
                  </label>
                  <select
                    value={newUser.wilayaId}
                    onChange={(e) =>
                      setNewUser({ ...newUser, wilayaId: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#FFCE18] focus:outline-none"
                  >
                    <option value="">Select Wilaya</option>
                    {availableWilayas.map((wilaya) => (
                      <option key={wilaya.id} value={wilaya.id}>
                        {wilaya.name}
                      </option>
                    ))}
                  </select>
                  {availableWilayas.length === 0 && (
                    <p className="text-yellow-400 text-sm mt-2">
                      ⚠️ No wilayas available without managers
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                disabled={actionLoading}
                className="flex-1 px-6 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateUser}
                disabled={actionLoading}
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-[#FFCE18] to-[#ffd94d] text-black font-bold hover:scale-105 transition-all disabled: opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create"
                )}
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
              onClick={() => {
                setShowResetPasswordModal(false);
                setNewPassword("");
                setSelectedUser(null);
              }}
              className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-[#FFCE18] to-[#ffd94d] text-black font-bold hover: scale-105 transition-all"
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
              <p className="text-red-400 text-sm mt-2">
                This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedUser(null);
                }}
                disabled={actionLoading}
                className="flex-1 px-6 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={actionLoading}
                className="flex-1 px-6 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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
