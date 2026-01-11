"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Please enter username and password");
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      // If username is "admin", go to admin dashboard
      if (username.toLowerCase() === "admin") {
        router.push("/admin/dashboard");
      } else {
        // Otherwise go to restaurant dashboard
        router.push("/restaurant-admin/dashboard");
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FFCE18] opacity-10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#FFCE18] opacity-10 rounded-full blur-3xl animate-float-delayed"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FFCE18] to-[#ffd94d] flex items-center justify-center shadow-2xl">
              <span className="text-3xl font-black text-black">C</span>
            </div>
          </div>
          <h1 className="text-4xl font-black text-white mb-2">
            Welcome to <span className="text-[#FFCE18]">Corner</span>
          </h1>
          <p className="text-gray-400">Sign in to your account</p>
        </div>

        {/* Login Card */}
        <div className="backdrop-blur-xl bg-white/5 rounded-3xl p-8 border border-white/10 shadow-2xl animate-fade-in-up">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-white font-bold mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <FaUser />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#FFCE18] focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-white font-bold mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <FaLock />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-12 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus: border-[#FFCE18] focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-500 rounded-xl p-4 text-red-400 text-sm animate-shake">
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-[#FFCE18] to-[#ffd94d] text-black font-black text-lg hover:scale-105 transition-all disabled:opacity-50 disabled: cursor-not-allowed shadow-xl"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-3 border-black border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Forgot password?{" "}
              <button className="text-[#FFCE18] font-bold hover:underline">
                Contact Support
              </button>
            </p>
          </div>
        </div>

        {/* Demo Credentials */}
        <div
          className="mt-6 backdrop-blur-xl bg-white/5 rounded-2xl p-4 border border-white/10 animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          <p className="text-xs text-gray-400 text-center mb-2">
            Demo Credentials:{" "}
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white/5 rounded-lg p-2">
              <p className="text-gray-500">Admin: </p>
              <p className="text-[#FFCE18] font-bold">admin / admin123</p>
            </div>
            <div className="bg-white/5 rounded-lg p-2">
              <p className="text-gray-500">Restaurant:</p>
              <p className="text-[#FFCE18] font-bold">restaurant1 / rest123</p>
            </div>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        @keyframes float-delayed {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(20px);
          }
        }
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
            transform: translateY(20px);
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
        . animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }
        .animate-shake {
          animation: shake 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
