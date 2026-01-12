// src/app/admin/login/page.tsx

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FaShieldAlt, FaUser, FaLock, FaSpinner } from "react-icons/fa";

export default function AdminLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("🔄 Attempting login..."); // ← ADD THIS

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include", // ← IMPORTANT: Include cookies
      });

      const data = await response.json();
      console.log("📥 Response:", data); // ← ADD THIS

      if (!response.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      if (
        data.data.user.role !== "SUPER_ADMIN" &&
        data.data.user.role !== "MANAGER"
      ) {
        setError("Access denied.  Admin or Manager account required.");
        setLoading(false);
        return;
      }

      console.log("✅ Login successful, redirecting..."); // ← ADD THIS

      // ✅ FIX: Wait a bit for cookie to be set, then redirect
      await new Promise((resolve) => setTimeout(resolve, 100));

      // ✅ FIX:  Use window.location instead of router.push for hard navigation
      window.location.href = "/admin/dashboard";
    } catch (err) {
      console.error("❌ Network error:", err); // ← ADD THIS
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500 opacity-10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-500 opacity-10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 shadow-2xl mb-6">
            <FaShieldAlt className="text-4xl text-white" />
          </div>
          <h1 className="text-5xl font-black text-white mb-2">Admin Login</h1>
          <p className="text-xl text-gray-400">Platform Management Portal</p>
        </div>

        <div className="backdrop-blur-xl bg-white/5 rounded-3xl p-8 border border-white/10 animate-fade-in-up">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500 rounded-xl p-4 text-red-400 text-sm animate-shake">
                {error}
              </div>
            )}

            <div>
              <label className="block text-white font-bold mb-2">
                Username
              </label>
              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  placeholder="Enter your username"
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-red-500 focus:outline-none transition-all"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-white font-bold mb-2">
                Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-red-500 focus:outline-none transition-all"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-8 py-4 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-black text-lg hover:scale-105 transition-all shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Logging in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
            <p className="text-blue-400 text-sm font-bold mb-2">
              🧪 Test Credentials:
            </p>
            <div className="text-xs text-gray-400 space-y-1">
              <div>
                Super Admin: <span className="text-white">superadmin1</span> /{" "}
                <span className="text-white">admin123</span>
              </div>
              <div>
                Manager: <span className="text-white">manager_tiaret</span> /{" "}
                <span className="text-white">manager123</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={() => router.push("/")}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-10px);
          }
          75% {
            transform: translateX(10px);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out;
        }
        .animate-shake {
          animation: shake 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
