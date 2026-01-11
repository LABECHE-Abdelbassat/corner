"use client";

import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  FaClock,
  FaMapMarkerAlt,
  FaPhone,
  FaInstagram,
  FaFacebook,
  FaTiktok,
  FaStar,
  FaUtensils,
  FaMotorcycle,
  FaWifi,
  FaParking,
  FaCreditCard,
  FaListAlt,
  FaDirections,
  FaHeart,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaQuoteLeft,
  FaCheckCircle,
  FaAward,
  FaUsers,
  FaLeaf,
  FaFire,
} from "react-icons/fa";
import { useRouter } from "next/navigation";

// Fix Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Restaurant Data
const restaurantData = {
  id: "rest1",
  name: "Le Gourmet Palace",
  slogan: "Where Tradition Meets Excellence",
  tagline: "Authentic Algerian Cuisine in the Heart of Tiaret",
  description:
    "Experience the finest Algerian and Mediterranean cuisine crafted with passion and tradition. Every dish tells a story of our rich culinary heritage.",

  // Hero
  heroImage:
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920",

  // Why Choose Us
  whyChooseUs: [
    {
      icon: <FaAward />,
      title: "Award Winning",
      text: "Recognized for culinary excellence",
    },
    {
      icon: <FaLeaf />,
      title: "Fresh Ingredients",
      text: "Local & organic produce daily",
    },
    {
      icon: <FaFire />,
      title: "Master Chefs",
      text: "30+ years combined experience",
    },
    {
      icon: <FaUsers />,
      title: "Family Atmosphere",
      text: "Warm & welcoming ambiance",
    },
  ],

  // Featured Dishes
  featuredDishes: [
    {
      name: "Traditional Couscous",
      description: "Steamed semolina with tender lamb and seasonal vegetables",
      price: 1200,
      image: "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800",
      popular: true,
    },
    {
      name: "Grilled Lamb Chops",
      description: "Succulent lamb chops marinated in traditional spices",
      price: 1800,
      image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800",
      popular: true,
    },
    {
      name: "Mediterranean Seafood",
      description: "Fresh catch of the day with herbs and lemon",
      price: 2200,
      image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800",
      popular: false,
    },
    {
      name: "Mixed Grill Platter",
      description: "A selection of our finest grilled meats",
      price: 2500,
      image:
        "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=800",
      popular: true,
    },
  ],

  // Reviews
  reviews: [
    {
      name: "Ahmed Benali",
      rating: 5,
      text: "The best couscous I've ever had!  Authentic flavors and generous portions.",
      date: "2 weeks ago",
    },
    {
      name: "Fatima Yacine",
      rating: 5,
      text: "Amazing atmosphere and incredible food. The lamb chops are to die for!",
      date: "1 month ago",
    },
    {
      name: "Karim Mansouri",
      rating: 5,
      text: "A true gem in Tiaret. Every visit feels like coming home.",
      date: "3 weeks ago",
    },
  ],

  // Stats
  stats: [
    { number: "10K+", label: "Happy Customers" },
    { number: "15+", label: "Years Experience" },
    { number: "4.8", label: "Google Rating" },
    { number: "50+", label: "Menu Items" },
  ],

  // Delivery
  hasDelivery: true,
  deliveryPhones: ["05 55 12 34 56", "06 66 78 90 12"],
  deliveryZones: ["Centre Ville", "Hay El Nasr", "Sebaine", "Sériaïa"],

  // Social Media
  socialMedia: {
    instagram: { handle: "@legourmetpalace", followers: "12.5K" },
    facebook: { handle: "Le Gourmet Palace", followers: "8.3K" },
    tiktok: { handle: "@legourmet_tiaret", followers: "5.2K" },
  },

  // Locations
  locations: [
    {
      id: "loc1",
      address: "15 Rue de la Liberté, Centre Ville, Tiaret 14000",
      lat: 35.3709,
      lng: 1.3219,
      phone: "+213 46 XX XX XX",
    },
    {
      id: "loc2",
      address: "Boulevard Emir Abdelkader, Hay El Nasr, Tiaret 14000",
      lat: 35.375,
      lng: 1.318,
      phone: "+213 46 YY YY YY",
    },
  ],

  // Gallery
  gallery: [
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
    "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800",
    "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800",
    "https://images.unsplash.com/photo-1544148103-0773bf10d330?w=800",
  ],

  // Opening Hours (simplified)
  openingHours:
    "Mon-Thu: 11:00-23:00 | Fri-Sat: 12:00-00:00 | Sun: 12:00-22:00",
};

const createCustomIcon = () => {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background: #FFCE18;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(255, 206, 24, 0.4);
      ">
        <div style="
          position: absolute;
          top: 50%;
          left:  50%;
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

export default function RestaurantLandingPage({
  params,
}: {
  params: { restaurantId: string };
}) {
  const router = useRouter();
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-black/95 backdrop-blur-xl border-b border-white/10"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFCE18] to-[#ffd94d] flex items-center justify-center">
                <FaUtensils className="text-black" />
              </div>
              <span className="text-xl font-black text-white">
                {restaurantData.name}
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#about"
                className="text-white hover: text-[#FFCE18] font-semibold transition-colors"
              >
                About
              </a>
              <a
                href="#menu"
                className="text-white hover:text-[#FFCE18] font-semibold transition-colors"
              >
                Menu
              </a>
              <a
                href="#gallery"
                className="text-white hover:text-[#FFCE18] font-semibold transition-colors"
              >
                Gallery
              </a>
              <a
                href="#contact"
                className="text-white hover: text-[#FFCE18] font-semibold transition-colors"
              >
                Contact
              </a>
            </div>
            <button
              onClick={() => router.push(`/menu/${params.restaurantId}`)}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FFCE18] to-[#ffd94d] text-black font-bold hover:scale-105 transition-all"
            >
              View Menu
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${restaurantData.heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black"></div>
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl animate-fade-in-up">
          <h1 className="text-6xl md:text-7xl font-black text-white mb-4 leading-tight">
            {restaurantData.name}
          </h1>
          <p className="text-2xl md:text-3xl text-[#FFCE18] mb-6 font-semibold italic">
            {restaurantData.slogan}
          </p>
          <p className="text-xl text-gray-200 mb-12 max-w-2xl mx-auto">
            {restaurantData.tagline}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push(`/menu/${params.restaurantId}`)}
              className="px-10 py-5 rounded-xl bg-gradient-to-r from-[#FFCE18] to-[#ffd94d] text-black font-black text-lg hover:scale-110 transition-all shadow-2xl"
            >
              Explore Menu
            </button>
            <a
              href={`tel:${restaurantData.locations[0].phone}`}
              className="px-10 py-5 rounded-xl bg-white/10 backdrop-blur-xl border-2 border-white/20 text-white font-bold text-lg hover:bg-white/20 transition-all flex items-center justify-center gap-3"
            >
              <FaPhone /> Reserve Table
            </a>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="text-white text-sm">Scroll to explore</div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-gradient-to-r from-[#FFCE18] to-[#ffd94d] py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {restaurantData.stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl md:text-5xl font-black text-black mb-2">
                  {stat.number}
                </div>
                <div className="text-sm font-semibold text-black/70">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-white mb-4">Our Story</h2>
            <div className="w-20 h-1 bg-[#FFCE18] mx-auto mb-6"></div>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              {restaurantData.description}
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {restaurantData.whyChooseUs.map((item, idx) => (
              <div
                key={idx}
                className="group text-center p-8 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/10 hover:border-[#FFCE18] hover:scale-105"
              >
                <div className="text-5xl text-[#FFCE18] mb-4 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-400 text-sm">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Menu */}
      <section
        id="menu"
        className="py-24 bg-gradient-to-b from-black to-gray-900"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-white mb-4">
              Signature Dishes
            </h2>
            <div className="w-20 h-1 bg-[#FFCE18] mx-auto mb-6"></div>
            <p className="text-xl text-gray-400">
              Handcrafted with love and tradition
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {restaurantData.featuredDishes.map((dish, idx) => (
              <div
                key={idx}
                className="group relative rounded-2xl overflow-hidden hover: scale-105 transition-all duration-500 cursor-pointer"
              >
                <div className="aspect-square relative">
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                  {dish.popular && (
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[#FFCE18] text-black text-xs font-bold flex items-center gap-1">
                      <FaStar /> Popular
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl font-bold text-white mb-2">
                    {dish.name}
                  </h3>
                  <p className="text-sm text-gray-300 mb-3">
                    {dish.description}
                  </p>
                  <div className="text-2xl font-black text-[#FFCE18]">
                    {dish.price} DA
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => router.push(`/menu/${params.restaurantId}`)}
              className="px-10 py-4 rounded-xl bg-gradient-to-r from-[#FFCE18] to-[#ffd94d] text-black font-black text-lg hover: scale-110 transition-all inline-flex items-center gap-3"
            >
              View Full Menu <FaListAlt />
            </button>
          </div>
        </div>
      </section>

      {/* Delivery Section */}
      {restaurantData.hasDelivery && (
        <section className="py-24 bg-black">
          <div className="max-w-7xl mx-auto px-4">
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-3xl p-12 border border-green-500/30">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-green-500/20 border border-green-500 text-green-400 font-bold mb-6">
                    <FaMotorcycle /> Fast Delivery
                  </div>
                  <h2 className="text-4xl font-black text-white mb-4">
                    Order from Home
                  </h2>
                  <p className="text-gray-400 mb-6 text-lg">
                    We deliver to your doorstep. Call us now and enjoy our
                    delicious food at home!
                  </p>
                  <div className="space-y-3">
                    {restaurantData.deliveryPhones.map((phone, idx) => (
                      <a
                        key={idx}
                        href={`tel:${phone}`}
                        className="flex items-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover: border-green-500 transition-all group"
                      >
                        <div className="w-8 h-8 flex items-center justify-center">
                          <FaPhone className="text-white text-lg" />
                        </div>
                        <span className="text-white font-bold text-lg">
                          {phone}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white mb-4">
                    Delivery Zones
                  </h3>
                  {restaurantData.deliveryZones.map((zone, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 text-gray-300"
                    >
                      <FaCheckCircle className="text-green-400" />
                      <span>{zone}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Reviews */}
      <section className="py-24 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-white mb-4">
              What Our Guests Say
            </h2>
            <div className="w-20 h-1 bg-[#FFCE18] mx-auto"></div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {restaurantData.reviews.map((review, idx) => (
              <div
                key={idx}
                className="bg-white/5 rounded-2xl p-8 border border-white/10 hover:border-[#FFCE18] transition-all"
              >
                <FaQuoteLeft className="text-3xl text-[#FFCE18] mb-4" />
                <div className="flex gap-1 mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 italic">"{review.text}"</p>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">{review.name}</div>
                    <div className="text-sm text-gray-500">{review.date}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section id="gallery" className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-white mb-4">Gallery</h2>
            <div className="w-20 h-1 bg-[#FFCE18] mx-auto"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {restaurantData.gallery.map((photo, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedPhoto(idx)}
                className="aspect-square rounded-2xl overflow-hidden cursor-pointer group"
              >
                <img
                  src={photo}
                  alt={`Gallery ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location & Contact */}
      <section
        id="contact"
        className="py-24 bg-gradient-to-b from-black to-gray-900"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-white mb-4">Visit Us</h2>
            <div className="w-20 h-1 bg-[#FFCE18] mx-auto mb-6"></div>
            <p className="text-xl text-gray-400">
              {restaurantData.openingHours}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {restaurantData.locations.map((loc) => (
              <div
                key={loc.id}
                className="bg-white/5 rounded-2xl p-8 border border-white/10"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-[#FFCE18] flex items-center justify-center flex-shrink-0">
                    <FaMapMarkerAlt className="text-black" />
                  </div>
                  <div>
                    <p className="text-white font-semibold mb-2">
                      {loc.address}
                    </p>
                    <a
                      href={`tel:${loc.phone}`}
                      className="text-[#FFCE18] hover: underline flex items-center gap-2"
                    >
                      <FaPhone className="text-sm" /> {loc.phone}
                    </a>
                  </div>
                </div>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`}
                  target="_blank"
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-500/20 border border-blue-500 text-blue-400 font-bold hover:bg-blue-500/30 transition-all"
                >
                  <FaDirections /> Get Directions
                </a>
              </div>
            ))}
          </div>

          <div className="h-[400px] rounded-2xl overflow-hidden border border-white/10">
            <MapContainer
              center={[
                restaurantData.locations[0].lat,
                restaurantData.locations[0].lng,
              ]}
              zoom={13}
              className="h-full w-full"
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {restaurantData.locations.map((loc) => (
                <Marker
                  key={loc.id}
                  position={[loc.lat, loc.lng]}
                  icon={createCustomIcon()}
                >
                  <Popup>
                    <div className="p-2">
                      <p className="font-bold text-gray-900 mb-1">
                        {restaurantData.name}
                      </p>
                      <p className="text-sm text-gray-600">{loc.address}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      </section>

      {/* Social Media */}
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-white mb-4">
              Follow Our Journey
            </h2>
            <p className="text-gray-400">
              Stay connected for latest updates and special offers
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <a
              href="#"
              className="group bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-2xl p-8 border border-pink-500/30 hover:border-pink-500 transition-all text-center"
            >
              <FaInstagram className="text-6xl text-pink-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <div className="text-xl font-bold text-white mb-1">
                {restaurantData.socialMedia.instagram.handle}
              </div>
              <div className="text-3xl font-black text-pink-400">
                {restaurantData.socialMedia.instagram.followers}
              </div>
            </a>
            <a
              href="#"
              className="group bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-2xl p-8 border border-blue-500/30 hover:border-blue-500 transition-all text-center"
            >
              <FaFacebook className="text-6xl text-blue-400 mx-auto mb-4 group-hover: scale-110 transition-transform" />
              <div className="text-xl font-bold text-white mb-1">
                {restaurantData.socialMedia.facebook.handle}
              </div>
              <div className="text-3xl font-black text-blue-400">
                {restaurantData.socialMedia.facebook.followers}
              </div>
            </a>
            <a
              href="#"
              className="group bg-gradient-to-br from-gray-700/10 to-gray-800/10 rounded-2xl p-8 border border-gray-500/30 hover:border-gray-400 transition-all text-center"
            >
              <FaTiktok className="text-6xl text-gray-300 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <div className="text-xl font-bold text-white mb-1">
                {restaurantData.socialMedia.tiktok.handle}
              </div>
              <div className="text-3xl font-black text-gray-300">
                {restaurantData.socialMedia.tiktok.followers}
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FFCE18] to-[#ffd94d] flex items-center justify-center">
              <FaUtensils className="text-black" />
            </div>
            <span className="text-2xl font-black text-white">
              {restaurantData.name}
            </span>
          </div>
          <p className="text-gray-400 mb-6">{restaurantData.slogan}</p>
          <p className="text-gray-600 text-sm">
            © 2025 {restaurantData.name}.All rights reserved.
          </p>
        </div>
      </footer>

      {/* Photo Lightbox */}
      {selectedPhoto !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 right-4 p-4 rounded-full bg-white/10 hover:bg-white/20 transition-all"
          >
            <FaTimes className="text-white text-2xl" />
          </button>
          <img
            src={restaurantData.gallery[selectedPhoto]}
            alt="Gallery"
            className="max-w-full max-h-full rounded-2xl"
          />
        </div>
      )}

      <style jsx>{`
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
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out;
        }
      `}</style>
    </div>
  );
}
