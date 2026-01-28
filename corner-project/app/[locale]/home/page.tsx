"use client";

import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaUtensils,
  FaEye,
  FaListAlt,
  FaArrowLeft,
  FaSpinner,
} from "react-icons/fa";
import { useRouter } from "next/navigation";

// Fix Leaflet default icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow. png",
});

// ==================== INTERFACES ====================
interface Wilaya {
  id: string;
  name: string;
  code: string;
  restaurantCount: number;
  lat: number | null;
  lng: number | null;
  gradient: string | null;
}

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  address: string | null;
  phone: string | null;
  lat: number | null;
  lng: number | null;
  openingHours: string | null;
  currency: string;
  status: string;
}

// ==================== CUSTOM MAP ICON ====================
const createCustomIcon = () => {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background: linear-gradient(135deg, #FFCE18 0%, #ffd94d 100%);
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(255, 206, 24, 0.4);
        position: relative;
      ">
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(45deg);
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
        "></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

function MapUpdater({
  center,
  zoom,
}: {
  center: [number, number];
  zoom?: number;
}) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom || 13, { animate: true });
  }, [center, zoom, map]);
  return null;
}

// Default gradients if not provided
const defaultGradients = [
  "from-blue-500 to-cyan-500",
  "from-purple-500 to-pink-500",
  "from-green-500 to-emerald-500",
  "from-orange-500 to-red-500",
  "from-yellow-500 to-orange-500",
];

export default function HomePage() {
  const router = useRouter();

  // State
  const [step, setStep] = useState<"wilaya-select" | "loading" | "home">(
    "wilaya-select"
  );
  const [loadingWilayas, setLoadingWilayas] = useState(true);
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [selectedWilaya, setSelectedWilaya] = useState<Wilaya | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>(
    []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [mapCenter, setMapCenter] = useState<[number, number]>([36.0, 3.0]);
  const [mapZoom, setMapZoom] = useState(13);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<
    string | null
  >(null);

  // Refs for markers
  const markerRefs = useRef<{ [key: string]: L.Marker }>({});

  // ==================== FETCH WILAYAS ====================
  useEffect(() => {
    fetchWilayas();
  }, []);

  const fetchWilayas = async () => {
    try {
      setLoadingWilayas(true);
      const response = await fetch("/api/admin/wilayas");
      const data = await response.json();

      if (data.success) {
        const wilayasList = data.data.wilayas
          .map((w: any, index: number) => ({
            id: String(w.id || ""),
            name: String(w.name || ""),
            code: String(w.code || ""),
            restaurantCount: Number(w._count?.restaurants || 0),
            lat: w.lat ? Number(w.lat) : null,
            lng: w.lng ? Number(w.lng) : null,
            gradient:
              w.gradient || defaultGradients[index % defaultGradients.length],
          }))
          .filter((w: Wilaya) => w.restaurantCount > 0);

        setWilayas(wilayasList);
      }
    } catch (err) {
      console.error("Fetch wilayas error:", err);
    } finally {
      setLoadingWilayas(false);
    }
  };

  // ==================== FETCH RESTAURANTS ====================
  const fetchRestaurants = async (wilayaName: string) => {
    try {
      const response = await fetch(
        `/api/restaurants/by-wilaya/${encodeURIComponent(
          wilayaName
        )}? status=ACTIVE`
      );
      const data = await response.json();

      if (data.success) {
        const restaurantsList = data.data.restaurants.map((r: any) => ({
          id: String(r.id || ""),
          name: String(r.name || ""),
          slug: String(r.slug || ""),
          logo: r.logo ? String(r.logo) : null,
          description: r.description ? String(r.description) : null,
          address: r.address ? String(r.address) : null,
          phone: r.phone ? String(r.phone) : null,
          lat: r.lat ? Number(r.lat) : null,
          lng: r.lng ? Number(r.lng) : null,
          openingHours: r.openingHours ? String(r.openingHours) : null,
          currency: String(r.currency || "DZD"),
          status: String(r.status || "INACTIVE"),
        }));

        setRestaurants(restaurantsList);
        setFilteredRestaurants(restaurantsList);

        const wilayaData = data.data.wilaya;
        if (wilayaData?.lat && wilayaData?.lng) {
          setMapCenter([Number(wilayaData.lat), Number(wilayaData.lng)]);
        } else {
          const firstWithCoords = restaurantsList.find(
            (r: Restaurant) => r.lat && r.lng
          );
          if (firstWithCoords) {
            setMapCenter([firstWithCoords.lat!, firstWithCoords.lng!]);
          }
        }
      }
    } catch (err) {
      console.error("Fetch restaurants error:", err);
    }
  };

  // ==================== TRACK MAP CLICK ====================
  const trackMapClick = async (restaurantId: string) => {
    try {
      await fetch(`/api/restaurants/${restaurantId}/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "map_click" }),
      });
    } catch (err) {
      console.error("Track map click error:", err);
    }
  };

  // ==================== ZOOM TO RESTAURANT ====================
  const zoomToRestaurant = (restaurant: Restaurant) => {
    if (restaurant.lat && restaurant.lng) {
      setMapCenter([restaurant.lat, restaurant.lng]);
      setMapZoom(16); // Closer zoom for individual restaurant
      setSelectedRestaurantId(restaurant.id);

      // Scroll to map FIRST (before opening popup)
      const mapElement = document.querySelector(".map-container");
      if (mapElement) {
        mapElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }

      // Open the marker popup after scrolling + delay
      setTimeout(() => {
        const marker = markerRefs.current[restaurant.id];
        if (marker) {
          marker.openPopup();
        }
      }, 800); // Increased delay to account for scroll

      // Track map click
      trackMapClick(restaurant.id);
    }
  };

  // ==================== HANDLE WILAYA SELECTION ====================
  const handleWilayaSelect = async (wilaya: Wilaya) => {
    setSelectedWilaya(wilaya);
    setStep("loading");

    if (wilaya.lat && wilaya.lng) {
      setMapCenter([wilaya.lat, wilaya.lng]);
    }

    await fetchRestaurants(wilaya.name);

    setTimeout(() => {
      setStep("home");
    }, 1000);
  };

  // ==================== HANDLE SEARCH ====================
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredRestaurants(restaurants);
      setMapZoom(13); // Reset zoom
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = restaurants.filter(
      (rest) =>
        rest.name.toLowerCase().includes(query) ||
        (rest.description && rest.description.toLowerCase().includes(query)) ||
        (rest.address && rest.address.toLowerCase().includes(query))
    );
    setFilteredRestaurants(filtered);
  };

  useEffect(() => {
    if (step === "home") {
      if (searchQuery === "") {
        setFilteredRestaurants(restaurants);
        setMapZoom(13);
      }
    }
  }, [searchQuery, restaurants, step]);

  // ==================== CHANGE WILAYA ====================
  const handleChangeWilaya = () => {
    setStep("wilaya-select");
    setSelectedWilaya(null);
    setSearchQuery("");
    setRestaurants([]);
    setFilteredRestaurants([]);
    setMapZoom(13);
  };

  // ==================== WILAYA SELECTION SCREEN ====================
  if (step === "wilaya-select") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
        <div className="fixed inset-0 z-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FFCE18] opacity-10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#FFCE18] opacity-10 rounded-full blur-3xl animate-float-delayed"></div>
        </div>

        <div className="relative z-10 w-full max-w-5xl">
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#FFCE18] to-[#ffd94d] flex items-center justify-center shadow-2xl">
                <span className="text-4xl font-black text-black">C</span>
              </div>
            </div>
            <h1 className="text-6xl font-black text-white mb-4">
              Welcome to <span className="text-[#FFCE18]">Corner</span>
            </h1>
            <p className="text-2xl text-gray-400">
              Select your wilaya to discover restaurants
            </p>
          </div>

          {loadingWilayas ? (
            <div className="text-center py-20">
              <FaSpinner className="w-16 h-16 text-[#FFCE18] animate-spin mx-auto mb-4" />
              <p className="text-white text-xl">Loading wilayas...</p>
            </div>
          ) : wilayas.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-white text-xl mb-4">
                No wilayas available yet
              </p>
              <p className="text-gray-400">Please check back later</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in-up">
              {wilayas.map((wilaya) => (
                <button
                  key={wilaya.id}
                  onClick={() => handleWilayaSelect(wilaya)}
                  className="group relative backdrop-blur-xl bg-white/5 rounded-3xl p-10 border-2 border-white/10 hover:border-[#FFCE18] transition-all duration-500 transform hover:scale-105 hover:-translate-y-2"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${wilaya.gradient} opacity-0 group-hover:opacity-10 rounded-3xl transition-all duration-500`}
                  ></div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div
                        className={`px-4 py-2 rounded-full bg-gradient-to-r ${wilaya.gradient} text-white font-bold text-sm`}
                      >
                        {wilaya.code}
                      </div>
                      <div className="text-4xl group-hover:scale-110 transition-transform">
                        📍
                      </div>
                    </div>

                    <h3 className="text-4xl font-black text-white mb-3 group-hover:text-[#FFCE18] transition-colors">
                      {wilaya.name}
                    </h3>

                    <div className="flex items-center justify-between text-gray-400">
                      <div className="flex items-center gap-2">
                        <FaUtensils className="text-[#FFCE18]" />
                        <span className="font-semibold">
                          {wilaya.restaurantCount} Restaurant
                          {wilaya.restaurantCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="text-[#FFCE18] group-hover:translate-x-2 transition-transform">
                        →
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div
            className="text-center mt-12 animate-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            <button
              onClick={() => router.push("/login")}
              className="px-8 py-4 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all"
            >
              Restaurant Owner? Sign In
            </button>
          </div>
        </div>

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
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          . animate-float {
            animation: float 6s ease-in-out infinite;
          }
          .animate-float-delayed {
            animation: float-delayed 8s ease-in-out infinite;
          }
          .animate-fade-in {
            animation: fade-in 0.8s ease-out;
          }
          .animate-fade-in-up {
            animation: fade-in-up 1s ease-out;
          }
        `}</style>
      </div>
    );
  }

  // ==================== LOADING SCREEN ====================
  if (step === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#FFCE18] to-[#ffd94d] flex items-center justify-center mb-8 mx-auto animate-pulse">
            <FaMapMarkerAlt className="text-4xl text-black" />
          </div>
          <h2 className="text-3xl font-black text-white mb-4">
            Loading {selectedWilaya?.name}...
          </h2>
          <div className="flex items-center justify-center gap-2">
            <div className="w-3 h-3 bg-[#FFCE18] rounded-full animate-bounce"></div>
            <div
              className="w-3 h-3 bg-[#FFCE18] rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-3 h-3 bg-[#FFCE18] rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== HOME SCREEN ====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-black/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleChangeWilaya}
                className="p-3 rounded-xl bg-white/10 hover: bg-white/20 transition-all"
                title="Change Wilaya"
              >
                <FaArrowLeft className="text-white" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FFCE18] to-[#ffd94d] flex items-center justify-center shadow-xl">
                  <span className="text-2xl font-black text-black">C</span>
                </div>
                <div>
                  <h1 className="text-xl font-black text-white flex items-center gap-2">
                    <FaMapMarkerAlt className="text-[#FFCE18]" />
                    {selectedWilaya?.name}
                  </h1>
                  <p className="text-xs text-gray-400">
                    {filteredRestaurants.length} restaurant
                    {filteredRestaurants.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => router.push("/login")}
              className="px-6 py-2 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all"
            >
              Sign In
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-8 animate-fade-in">
          <div className="max-w-3xl mx-auto flex gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search restaurants..."
                className="w-full pl-16 pr-6 py-5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#FFCE18] focus:outline-none text-lg"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-8 py-5 rounded-2xl bg-gradient-to-r from-[#FFCE18] to-[#ffd94d] text-black font-black text-lg hover:scale-105 transition-all shadow-2xl"
            >
              Search
            </button>
          </div>
        </div>

        {/* Search Results */}
        {searchQuery && (
          <div className="mb-8 animate-fade-in">
            <h3 className="text-2xl font-bold text-white mb-4">
              {filteredRestaurants.length > 0
                ? `Found ${filteredRestaurants.length} result${
                    filteredRestaurants.length !== 1 ? "s" : ""
                  }`
                : "No results found"}
            </h3>
            {filteredRestaurants.length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRestaurants.map((rest) => (
                  <div
                    key={rest.id}
                    className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10 hover:bg-white/10 hover:border-[#FFCE18] transition-all cursor-pointer group"
                    onClick={() => zoomToRestaurant(rest)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-xl font-bold text-white group-hover:text-[#FFCE18] transition-colors">
                        {rest.name}
                      </h4>
                      <span className="text-2xl">🍽️</span>
                    </div>
                    {rest.description && (
                      <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                        {rest.description}
                      </p>
                    )}
                    {rest.address && (
                      <div className="flex items-center gap-2 text-[#FFCE18] text-sm">
                        <FaMapMarkerAlt />
                        <span className="line-clamp-1">{rest.address}</span>
                      </div>
                    )}
                    <div className="mt-3 text-sm text-gray-500">
                      Click to view on map
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Map */}
        <div className="backdrop-blur-xl bg-white/5 rounded-3xl p-6 border border-white/10 animate-fade-in-up map-container scroll-mt-14">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-white">Map View</h3>
            <div className="px-4 py-2 rounded-full bg-[#FFCE18]/20 text-[#FFCE18] font-bold text-sm">
              {filteredRestaurants.filter((r) => r.lat && r.lng).length}{" "}
              location
              {filteredRestaurants.filter((r) => r.lat && r.lng).length !== 1
                ? "s"
                : ""}
            </div>
          </div>

          <div className="h-[600px] rounded-2xl overflow-hidden border-2 border-white/10">
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              className="h-full w-full"
              zoomControl={true}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              <MapUpdater center={mapCenter} zoom={mapZoom} />

              {filteredRestaurants
                .filter((rest) => rest.lat && rest.lng)
                .map((rest) => (
                  <Marker
                    key={rest.id}
                    position={[rest.lat!, rest.lng!]}
                    icon={createCustomIcon()}
                    ref={(ref) => {
                      if (ref) {
                        markerRefs.current[rest.id] = ref;
                      }
                    }}
                    eventHandlers={{
                      click: () => {
                        trackMapClick(rest.id);
                      },
                    }}
                  >
                    <Popup className="custom-popup">
                      <div className="p-4 min-w-[280px]">
                        <h4 className="text-xl font-bold text-gray-900 mb-2">
                          {rest.name}
                        </h4>
                        {rest.description && (
                          <p className="text-sm text-gray-600 mb-3">
                            {rest.description}
                          </p>
                        )}
                        <div className="text-xs text-gray-500 mb-4 space-y-2">
                          {rest.address && (
                            <div className="flex items-center gap-2">
                              <FaMapMarkerAlt className="text-[#FFCE18]" />
                              {rest.address}
                            </div>
                          )}
                          {rest.phone && (
                            <div className="flex items-center gap-2">
                              <FaUtensils className="text-[#FFCE18]" />
                              {rest.phone}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              trackMapClick(rest.id);
                              router.push(`/restaurant/${rest.slug}`);
                            }}
                            className="flex-1 px-4 py-3 rounded-xl bg-gray-900 text-white font-bold hover:bg-gray-800 transition-all text-sm flex items-center justify-center gap-2"
                          >
                            <FaEye /> Info
                          </button>
                          <button
                            onClick={() => {
                              trackMapClick(rest.id);
                              router.push(`/menu/${rest.slug}?source=map`);
                            }}
                            className="flex-1 px-4 py-3 rounded-xl bg-[#FFCE18] text-black font-bold hover:bg-[#ffd94d] transition-all text-sm flex items-center justify-center gap-2"
                          >
                            <FaListAlt /> Menu
                          </button>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
            </MapContainer>
          </div>
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
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }
      `}</style>

      <style jsx global>{`
        .leaflet-popup-content-wrapper {
          background: white;
          border-radius: 16px;
          padding: 0;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        }
        .leaflet-popup-content {
          margin: 0;
        }
        .leaflet-popup-tip {
          background: white;
        }
        .custom-marker {
          background: transparent;
          border: none;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
