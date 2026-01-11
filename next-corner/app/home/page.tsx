"use client";

import React, { useState, useEffect } from "react";
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
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Fake restaurant data
const fakeRestaurants = [
  // Tiaret Restaurants
  {
    id: "rest1",
    name: "Pizza Palace",
    description: "Best pizza in Tiaret",
    cuisine: "Italian",
    lat: 35.3709,
    lng: 1.3219,
    address: "Centre Ville, Tiaret",
    phone: "+213 XXX XXX XXX",
    wilaya: "Tiaret",
    dishes: ["Pizza Margherita", "Pizza Pepperoni", "Calzone"],
  },
  {
    id: "rest2",
    name: "Burger House",
    description: "Gourmet burgers & fries",
    cuisine: "American",
    lat: 35.375,
    lng: 1.318,
    address: "Hay El Nasr, Tiaret",
    phone: "+213 XXX XXX XXX",
    wilaya: "Tiaret",
    dishes: ["Cheese Burger", "Bacon Burger", "Chicken Burger"],
  },
  {
    id: "rest3",
    name: "Le Gourmet",
    description: "Fine dining experience",
    cuisine: "French",
    lat: 35.368,
    lng: 1.325,
    address: "Rue de la Liberté, Tiaret",
    phone: "+213 XXX XXX XXX",
    wilaya: "Tiaret",
    dishes: ["Coq au Vin", "Ratatouille", "Crème Brûlée"],
  },
  {
    id: "rest4",
    name: "Shawarma Corner",
    description: "Authentic Middle Eastern",
    cuisine: "Middle Eastern",
    lat: 35.373,
    lng: 1.328,
    address: "Boulevard Emir Abdelkader, Tiaret",
    phone: "+213 XXX XXX XXX",
    wilaya: "Tiaret",
    dishes: ["Chicken Shawarma", "Falafel", "Hummus"],
  },
  {
    id: "rest5",
    name: "Sushi Zen",
    description: "Fresh sushi daily",
    cuisine: "Japanese",
    lat: 35.369,
    lng: 1.32,
    address: "Quartier Administratif, Tiaret",
    phone: "+213 XXX XXX XXX",
    wilaya: "Tiaret",
    dishes: ["Sushi Roll", "Sashimi", "Maki"],
  },

  // Sidi Bel Abbès Restaurants
  {
    id: "rest6",
    name: "Bella Vista",
    description: "Italian cuisine with panoramic view",
    cuisine: "Italian",
    lat: 35.2106,
    lng: -0.63,
    address: "Centre Ville, Sidi Bel Abbès",
    phone: "+213 XXX XXX XXX",
    wilaya: "Sidi Bel Abbès",
    dishes: ["Pasta Carbonara", "Lasagna", "Tiramisu"],
  },
  {
    id: "rest7",
    name: "La Table du Chef",
    description: "Traditional Algerian & French fusion",
    cuisine: "Fusion",
    lat: 35.215,
    lng: -0.635,
    address: "Rue Larbi Ben M'hidi, Sidi Bel Abbès",
    phone: "+213 XXX XXX XXX",
    wilaya: "Sidi Bel Abbès",
    dishes: ["Couscous Royal", "Tajine", "Bourек"],
  },
  {
    id: "rest8",
    name: "Ocean Grill",
    description: "Fresh seafood daily",
    cuisine: "Seafood",
    lat: 35.208,
    lng: -0.628,
    address: "Boulevard de la République, Sidi Bel Abbès",
    phone: "+213 XXX XXX XXX",
    wilaya: "Sidi Bel Abbès",
    dishes: ["Grilled Fish", "Shrimp Platter", "Calamari"],
  },
  {
    id: "rest9",
    name: "Café Parisien",
    description: "Coffee & pastries",
    cuisine: "Café",
    lat: 35.213,
    lng: -0.632,
    address: "Place de la Mairie, Sidi Bel Abbès",
    phone: "+213 XXX XXX XXX",
    wilaya: "Sidi Bel Abbès",
    dishes: ["Croissant", "Macaron", "Espresso"],
  },
];

// Available wilayas
const availableWilayas = [
  {
    name: "Tiaret",
    code: "14",
    restaurantCount: 5,
    lat: 35.3709,
    lng: 1.3219,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    name: "Sidi Bel Abbès",
    code: "22",
    restaurantCount: 4,
    lat: 35.2106,
    lng: -0.63,
    gradient: "from-purple-500 to-pink-500",
  },
];

// Custom modern marker
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

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13, { animate: true });
  }, [center, map]);
  return null;
}

export default function HomePage() {
  const router = useRouter();
  const [step, setStep] = useState<"wilaya-select" | "loading" | "home">(
    "wilaya-select"
  );
  const [selectedWilaya, setSelectedWilaya] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredRestaurants, setFilteredRestaurants] =
    useState(fakeRestaurants);
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    35.3709, 1.3219,
  ]);

  // Handle wilaya selection
  const handleWilayaSelect = (wilayaName: string) => {
    setSelectedWilaya(wilayaName);
    setStep("loading");

    const wilaya = availableWilayas.find((w) => w.name === wilayaName);
    if (wilaya) {
      setMapCenter([wilaya.lat, wilaya.lng]);
    }

    // Filter restaurants by wilaya
    const filtered = fakeRestaurants.filter(
      (rest) => rest.wilaya === wilayaName
    );
    setFilteredRestaurants(filtered);

    // Simulate loading
    setTimeout(() => {
      setStep("home");
    }, 1500);
  };

  // Handle search
  const handleSearch = () => {
    if (!selectedWilaya) return;

    const wilayaRestaurants = fakeRestaurants.filter(
      (rest) => rest.wilaya === selectedWilaya
    );

    if (!searchQuery.trim()) {
      setFilteredRestaurants(wilayaRestaurants);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = wilayaRestaurants.filter(
      (rest) =>
        rest.name.toLowerCase().includes(query) ||
        rest.cuisine.toLowerCase().includes(query) ||
        rest.dishes.some((dish) => dish.toLowerCase().includes(query))
    );
    setFilteredRestaurants(filtered);
  };

  useEffect(() => {
    if (step === "home" && selectedWilaya) {
      if (searchQuery === "") {
        const wilayaRestaurants = fakeRestaurants.filter(
          (rest) => rest.wilaya === selectedWilaya
        );
        setFilteredRestaurants(wilayaRestaurants);
      }
    }
  }, [searchQuery, selectedWilaya, step]);

  // Change wilaya
  const handleChangeWilaya = () => {
    setStep("wilaya-select");
    setSelectedWilaya(null);
    setSearchQuery("");
    setFilteredRestaurants(fakeRestaurants);
  };

  // WILAYA SELECTION SCREEN
  if (step === "wilaya-select") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
        {/* Animated Background */}
        <div className="fixed inset-0 z-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FFCE18] opacity-10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#FFCE18] opacity-10 rounded-full blur-3xl animate-float-delayed"></div>
        </div>

        <div className="relative z-10 w-full max-w-5xl">
          {/* Header */}
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

          {/* Wilaya Cards */}
          <div className="grid md:grid-cols-2 gap-8 animate-fade-in-up">
            {availableWilayas.map((wilaya) => (
              <button
                key={wilaya.name}
                onClick={() => handleWilayaSelect(wilaya.name)}
                className="group relative backdrop-blur-xl bg-white/5 rounded-3xl p-10 border-2 border-white/10 hover:border-[#FFCE18] transition-all duration-500 transform hover:scale-105 hover:-translate-y-2"
              >
                {/* Gradient overlay */}
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
                        {wilaya.restaurantCount} Restaurants
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

          {/* Login Button */}
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
          .animate-float {
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

  // LOADING SCREEN
  if (step === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#FFCE18] to-[#ffd94d] flex items-center justify-center mb-8 mx-auto animate-pulse">
            <FaMapMarkerAlt className="text-4xl text-black" />
          </div>
          <h2 className="text-3xl font-black text-white mb-4">
            Loading {selectedWilaya}...
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

  // HOME SCREEN
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-black/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleChangeWilaya}
                className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all"
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
                    {selectedWilaya}
                  </h1>
                  <p className="text-xs text-gray-400">
                    {filteredRestaurants.length} restaurants
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
                placeholder="Search restaurants or dishes..."
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
                    onClick={() => setMapCenter([rest.lat, rest.lng])}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-xl font-bold text-white group-hover:text-[#FFCE18] transition-colors">
                        {rest.name}
                      </h4>
                      <span className="text-2xl">🍽️</span>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">
                      {rest.description}
                    </p>
                    <div className="flex items-center gap-2 text-[#FFCE18] text-sm">
                      <FaMapMarkerAlt />
                      {rest.address}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Map */}
        <div className="backdrop-blur-xl bg-white/5 rounded-3xl p-6 border border-white/10 animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-white">Map View</h3>
            <div className="px-4 py-2 rounded-full bg-[#FFCE18]/20 text-[#FFCE18] font-bold text-sm">
              {filteredRestaurants.length} location
              {filteredRestaurants.length !== 1 ? "s" : ""}
            </div>
          </div>

          <div className="h-[600px] rounded-2xl overflow-hidden border-2 border-white/10">
            <MapContainer
              center={mapCenter}
              zoom={13}
              className="h-full w-full"
              zoomControl={true}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              <MapUpdater center={mapCenter} />

              {filteredRestaurants.map((rest) => (
                <Marker
                  key={rest.id}
                  position={[rest.lat, rest.lng]}
                  icon={createCustomIcon()}
                >
                  <Popup className="custom-popup">
                    <div className="p-4 min-w-[280px]">
                      <h4 className="text-xl font-bold text-gray-900 mb-2">
                        {rest.name}
                      </h4>
                      <p className="text-sm text-gray-600 mb-3">
                        {rest.description}
                      </p>
                      <div className="text-xs text-gray-500 mb-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <FaMapMarkerAlt className="text-[#FFCE18]" />
                          {rest.address}
                        </div>
                        <div className="flex items-center gap-2">
                          <FaUtensils className="text-[#FFCE18]" />
                          {rest.cuisine}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push(`/restaurant/${rest.id}`)}
                          className="flex-1 px-4 py-3 rounded-xl bg-gray-900 text-white font-bold hover:bg-gray-800 transition-all text-sm flex items-center justify-center gap-2"
                        >
                          <FaEye /> Restaurant
                        </button>
                        <button
                          onClick={() => router.push(`/menu/${rest.id}`)}
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
      `}</style>
    </div>
  );
}
