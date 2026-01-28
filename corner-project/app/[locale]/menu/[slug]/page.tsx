"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  FaSearch,
  FaTimes,
  FaShoppingCart,
  FaPlus,
  FaMinus,
  FaWhatsapp,
  FaMapMarkerAlt,
  FaClock,
  FaCheckCircle,
  FaInfoCircle,
  FaArrowLeft,
  FaSpinner,
} from "react-icons/fa";
import { Restaurant } from "@/types/restaurant.types";
import { Category } from "@/types/category.types";
import { Product } from "@/types/product.types";
import { CartItem } from "@/types/cart-item.types";

export default function MenuPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = params?.slug as string;

  // Loading & Data State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // UI State
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);

  // Product Selection State
  const [productQuantity, setProductQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedOptions, setSelectedOptions] = useState<any>({});
  const [selectedAddons, setSelectedAddons] = useState<any>({});

  // ==================== FETCH DATA ====================
  useEffect(() => {
    if (slug) {
      fetchMenuData();
    }
  }, [slug]);

  const fetchMenuData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch restaurant and menu data
      const response = await fetch(`/api/restaurants/${slug}/menu`);
      const data = await response.json();

      if (!data.success) {
        setError(data.error || "Failed to load menu");
        return;
      }

      const menuData = data.data;

      // Set restaurant info
      setRestaurant({
        id: String(menuData.restaurant.id || ""),
        name: String(menuData.restaurant.name || ""),
        slug: String(menuData.restaurant.slug || ""),
        logo: menuData.restaurant.logo
          ? String(menuData.restaurant.logo)
          : null,
        description: menuData.restaurant.description
          ? String(menuData.restaurant.description)
          : null,
        currency: String(menuData.restaurant.currency || "DZD"),
        phone: menuData.restaurant.phone
          ? String(menuData.restaurant.phone)
          : null,
        address: menuData.restaurant.address
          ? String(menuData.restaurant.address)
          : null,
        openingHours: menuData.restaurant.openingHours
          ? String(menuData.restaurant.openingHours)
          : null,
        isOpen: menuData.restaurant.status === "ACTIVE",
      });

      // Set categories
      setCategories(
        menuData.categories.map((cat: any) => ({
          _id: String(cat._id || ""),
          name: String(cat.name || ""),
          description: cat.description ? String(cat.description) : null,
          image: cat.image ? String(cat.image) : null,
          order: Number(cat.order || 0),
        }))
      );

      // Set products
      setProducts(
        menuData.products.map((prod: any) => ({
          _id: String(prod._id || ""),
          categoryId: String(prod.categoryId || ""),
          name: String(prod.name || ""),
          description: prod.description ? String(prod.description) : null,
          image: prod.image ? String(prod.image) : null,
          price: Number(prod.price || 0),
          hasOptions: Boolean(prod.hasOptions),
          hasAddons: Boolean(prod.hasAddons),
          hasVariants: Boolean(prod.hasVariants),
          isAvailable: Boolean(prod.isAvailable),
          tags: Array.isArray(prod.tags) ? prod.tags.map(String) : [],
          allergens: Array.isArray(prod.allergens)
            ? prod.allergens.map(String)
            : [],
          variants: prod.variants || [],
          optionGroups: prod.optionGroups || [],
          addonGroups: prod.addonGroups || [],
        }))
      );

      // Track view based on source parameter
      trackView(menuData.restaurant.id);
    } catch (err) {
      console.error("Fetch menu error:", err);
      setError("Failed to load menu");
    } finally {
      setLoading(false);
    }
  };

  const trackView = async (restaurantId: string) => {
    try {
      // Check URL parameters for source
      const source = searchParams.get("source");
      const trackType = source === "qr" ? "scan" : "view";

      // Send tracking request
      await fetch(`/api/restaurants/${restaurantId}/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: trackType }),
      });

      // Clean URL by removing source parameter (optional, for better UX)
      if (source === "qr") {
        window.history.replaceState({}, "", `/menu/${slug}`);
      }
    } catch (err) {
      console.error("Track view error:", err);
    }
  };

  // ==================== FILTER PRODUCTS ====================
  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (selectedCategory) {
      filtered = filtered.filter((p) => p.categoryId === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [products, selectedCategory, searchQuery]);

  // ==================== CALCULATE PRICE ====================
  const calculatePrice = () => {
    if (!selectedProduct) return 0;

    let price = selectedProduct.price;

    // Variant price
    if (selectedVariant) {
      price = Number(selectedVariant.price || 0);
    }

    // Options price adjustments
    Object.values(selectedOptions).forEach((option: any) => {
      if (Array.isArray(option)) {
        option.forEach((opt: any) => {
          price += Number(opt.priceAdjustment || 0);
        });
      } else if (option) {
        price += Number(option.priceAdjustment || 0);
      }
    });

    // Addons price adjustments
    Object.values(selectedAddons).forEach((addon: any) => {
      if (Array.isArray(addon)) {
        addon.forEach((add: any) => {
          price += Number(add.priceAdjustment || 0);
        });
      } else if (addon) {
        price += Number(addon.priceAdjustment || 0);
      }
    });

    return price * productQuantity;
  };

  // ==================== PRODUCT MODAL ====================
  const openProductModal = (product: Product) => {
    setSelectedProduct(product);
    setProductQuantity(1);
    setSelectedOptions({});
    setSelectedAddons({});

    // Set default variant
    if (product.hasVariants && product.variants) {
      const defaultVariant = product.variants.find((v: any) => v.isDefault);
      setSelectedVariant(defaultVariant || product.variants[0]);
    } else {
      setSelectedVariant(null);
    }

    // Set default options
    if (product.hasOptions && product.optionGroups) {
      const defaults: any = {};
      product.optionGroups.forEach((optGroup: any) => {
        const defaultItems = optGroup.items.filter(
          (item: any) => item.isDefault
        );
        if (optGroup.multipleSelection) {
          defaults[optGroup._id] = defaultItems;
        } else {
          defaults[optGroup._id] = defaultItems[0] || null;
        }
      });
      setSelectedOptions(defaults);
    }

    // Set default addons
    if (product.hasAddons && product.addonGroups) {
      const defaults: any = {};
      product.addonGroups.forEach((addonGroup: any) => {
        const defaultItems = addonGroup.items.filter(
          (item: any) => item.isDefault
        );
        if (addonGroup.multipleSelection) {
          defaults[addonGroup._id] = defaultItems;
        } else {
          defaults[addonGroup._id] = defaultItems[0] || null;
        }
      });
      setSelectedAddons(defaults);
    }
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
    setProductQuantity(1);
    setSelectedVariant(null);
    setSelectedOptions({});
    setSelectedAddons({});
  };

  // ==================== CART ====================
  const addToCart = () => {
    if (!selectedProduct) return;

    const cartItem: CartItem = {
      productId: selectedProduct._id,
      name: selectedProduct.name,
      basePrice: selectedProduct.price,
      quantity: productQuantity,
      selectedVariant,
      selectedOptions: Object.values(selectedOptions),
      selectedAddons: Object.values(selectedAddons),
      totalPrice: calculatePrice(),
      image: selectedProduct.image,
    };

    setCart([...cart, cartItem]);
    closeProductModal();
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.totalPrice, 0);
  }, [cart]);

  const handleWhatsAppOrder = () => {
    if (!restaurant || cart.length === 0) return;

    let message = `🍽️ *New Order from ${restaurant.name}*\n\n`;

    cart.forEach((item, index) => {
      message += `${index + 1}. *${item.name}* (x${item.quantity})\n`;
      if (item.selectedVariant) {
        message += `   Size: ${item.selectedVariant.name}\n`;
      }
      if (item.selectedOptions.length > 0) {
        message += `   Options: ${item.selectedOptions
          .flat()
          .map((o: any) => o.name)
          .join(", ")}\n`;
      }
      if (item.selectedAddons.length > 0) {
        message += `   Addons: ${item.selectedAddons
          .flat()
          .map((a: any) => a.name)
          .join(", ")}\n`;
      }
      message += `   Price: ${item.totalPrice.toFixed(2)} ${
        restaurant.currency
      }\n\n`;
    });

    message += `*Total: ${cartTotal.toFixed(2)} ${restaurant.currency}*`;

    const phoneNumber = restaurant.phone?.replace(/[^0-9]/g, "") || "";
    const whatsappUrl = `https://wa.me/${phoneNumber}? text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  // ==================== OPTION/ADDON HANDLERS ====================
  const handleOptionSelect = (
    groupId: string,
    item: any,
    multipleSelection: boolean
  ) => {
    if (multipleSelection) {
      const current = selectedOptions[groupId] || [];
      const exists = current.find((i: any) => i._id === item._id);
      if (exists) {
        setSelectedOptions({
          ...selectedOptions,
          [groupId]: current.filter((i: any) => i._id !== item._id),
        });
      } else {
        setSelectedOptions({
          ...selectedOptions,
          [groupId]: [...current, item],
        });
      }
    } else {
      setSelectedOptions({
        ...selectedOptions,
        [groupId]: item,
      });
    }
  };

  const handleAddonSelect = (
    groupId: string,
    item: any,
    multipleSelection: boolean
  ) => {
    if (multipleSelection) {
      const current = selectedAddons[groupId] || [];
      const exists = current.find((i: any) => i._id === item._id);
      if (exists) {
        setSelectedAddons({
          ...selectedAddons,
          [groupId]: current.filter((i: any) => i._id !== item._id),
        });
      } else {
        setSelectedAddons({
          ...selectedAddons,
          [groupId]: [...current, item],
        });
      }
    } else {
      setSelectedAddons({
        ...selectedAddons,
        [groupId]: item,
      });
    }
  };

  const isOptionSelected = (groupId: string, itemId: string) => {
    const selected = selectedOptions[groupId];
    if (Array.isArray(selected)) {
      return selected.some((i: any) => i._id === itemId);
    }
    return selected?._id === itemId;
  };

  const isAddonSelected = (groupId: string, itemId: string) => {
    const selected = selectedAddons[groupId];
    if (Array.isArray(selected)) {
      return selected.some((i: any) => i._id === itemId);
    }
    return selected?._id === itemId;
  };

  // ==================== RENDER ====================
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="w-16 h-16 text-[#FFCE18] animate-spin mx-auto mb-4" />
          <p className="text-white text-xl font-bold">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-white mb-2">Menu Not Found</h2>
          <p className="text-gray-400 mb-6">
            {error || "This restaurant menu is not available"}
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 rounded-xl bg-[#FFCE18] text-black font-bold hover:scale-105 transition-all"
          >
            <FaArrowLeft className="inline mr-2" /> Go Home
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Restaurant Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-black/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Restaurant Info */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {restaurant.logo && (
                <img
                  src={restaurant.logo}
                  alt={restaurant.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#FFCE18]"
                />
              )}
              <div>
                <h1 className="text-2xl font-black text-white">
                  {restaurant.name}
                </h1>
                {restaurant.description && (
                  <p className="text-sm text-gray-400">
                    {restaurant.description}
                  </p>
                )}
                {restaurant.isOpen && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-400">Open Now</span>
                  </div>
                )}
              </div>
            </div>

            {/* Cart Icon */}
            <button
              onClick={() => setShowCart(true)}
              className="relative p-3 rounded-xl bg-[#FFCE18] text-black hover:scale-110 transition-transform"
            >
              <FaShoppingCart className="w-6 h-6" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#FFCE18] focus:outline-none transition-all"
            />
          </div>
        </div>
      </header>

      {/* Categories */}
      <div className="sticky top-[180px] z-30 backdrop-blur-xl bg-black/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-6 py-2 rounded-full font-bold whitespace-nowrap transition-all ${
                selectedCategory === null
                  ? "bg-[#FFCE18] text-black"
                  : "bg-white/5 text-white hover:bg-white/10"
              }`}
            >
              All
            </button>
            {categories
              .sort((a, b) => a.order - b.order)
              .map((category) => (
                <button
                  key={category._id}
                  onClick={() => setSelectedCategory(category._id)}
                  className={`px-6 py-2 rounded-full font-bold whitespace-nowrap transition-all ${
                    selectedCategory === category._id
                      ? "bg-[#FFCE18] text-black"
                      : "bg-white/5 text-white hover:bg-white/10"
                  }`}
                >
                  {category.name}
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                onClick={() => openProductModal(product)}
                className="group cursor-pointer backdrop-blur-xl bg-white/5 rounded-3xl overflow-hidden border border-white/10 hover: border-[#FFCE18]/50 transition-all hover:scale-105 hover:-translate-y-2"
              >
                {/* Product Image */}
                {product.image && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {!product.isAvailable && (
                      <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                        <span className="text-white font-bold">Sold Out</span>
                      </div>
                    )}
                    {product.tags && product.tags.length > 0 && (
                      <div className="absolute top-2 right-2 flex gap-2 flex-wrap">
                        {product.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 rounded-full bg-[#FFCE18] text-black text-xs font-bold"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Product Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">
                    {product.name}
                  </h3>
                  {product.description && (
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2 h-10">
                      {product.description}
                    </p>
                  )}

                  {/* Price */}
                  <div className="flex items-center justify-between">
                    <div>
                      {product.hasVariants &&
                      product.variants &&
                      product.variants.length > 0 ? (
                        <div className="text-[#FFCE18] font-black text-xl">
                          From {product.variants[0]?.price.toFixed(2)}{" "}
                          {restaurant.currency}
                        </div>
                      ) : (
                        <div className="text-[#FFCE18] font-black text-xl">
                          {product.price.toFixed(2)} {restaurant.currency}
                        </div>
                      )}
                    </div>
                    <button className="p-3 rounded-full bg-[#FFCE18] text-black hover:scale-110 transition-transform">
                      <FaPlus />
                    </button>
                  </div>

                  {/* Allergens */}
                  {product.allergens && product.allergens.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <FaInfoCircle />
                        <span>Contains: {product.allergens.join(", ")}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Product Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-gray-900 to-black rounded-t-3xl md:rounded-3xl border border-white/10 animate-slide-up">
            {/* Modal Header */}
            <div className="relative">
              {selectedProduct.image && (
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-full h-64 object-cover"
                />
              )}
              <button
                onClick={closeProductModal}
                className="absolute top-4 right-4 p-3 rounded-full bg-black/80 text-white hover:bg-black transition-all"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-6">
              {/* Product Title */}
              <h2 className="text-3xl font-black text-white mb-2">
                {selectedProduct.name}
              </h2>
              {selectedProduct.description && (
                <p className="text-gray-400 mb-6">
                  {selectedProduct.description}
                </p>
              )}

              {/* Variants */}
              {selectedProduct.hasVariants && selectedProduct.variants && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white mb-3">
                    Select Size <span className="text-red-500">*</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedProduct.variants.map((variant: any) => (
                      <button
                        key={variant._id}
                        onClick={() => setSelectedVariant(variant)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          selectedVariant?._id === variant._id
                            ? "border-[#FFCE18] bg-[#FFCE18]/10"
                            : "border-white/10 hover:border-white/30"
                        }`}
                      >
                        <div className="text-white font-bold">
                          {variant.name}
                        </div>
                        <div className="text-[#FFCE18] text-sm">
                          {variant.price.toFixed(2)} {restaurant.currency}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Options */}
              {selectedProduct.hasOptions &&
                selectedProduct.optionGroups &&
                selectedProduct.optionGroups.map((optGroup: any) => (
                  <div key={optGroup._id} className="mb-6">
                    <h3 className="text-lg font-bold text-white mb-3">
                      {optGroup.groupName}{" "}
                      {optGroup.required && (
                        <span className="text-red-500">*</span>
                      )}
                      {optGroup.multipleSelection && (
                        <span className="text-sm text-gray-400 ml-2">
                          (Select {optGroup.minSelections}-
                          {optGroup.maxSelections})
                        </span>
                      )}
                    </h3>
                    <div className="space-y-2">
                      {optGroup.items.map((item: any) => {
                        const isSelected = isOptionSelected(
                          optGroup._id,
                          item._id
                        );
                        return (
                          <button
                            key={item._id}
                            onClick={() =>
                              handleOptionSelect(
                                optGroup._id,
                                item,
                                optGroup.multipleSelection
                              )
                            }
                            className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                              isSelected
                                ? "border-[#FFCE18] bg-[#FFCE18]/10"
                                : "border-white/10 hover:border-white/30"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {isSelected && (
                                <FaCheckCircle className="text-[#FFCE18]" />
                              )}
                              <span className="text-white font-semibold">
                                {item.name}
                              </span>
                            </div>
                            {item.priceAdjustment > 0 && (
                              <span className="text-[#FFCE18] text-sm">
                                +{item.priceAdjustment.toFixed(2)}{" "}
                                {restaurant.currency}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

              {/* Addons */}
              {selectedProduct.hasAddons &&
                selectedProduct.addonGroups &&
                selectedProduct.addonGroups.map((addonGroup: any) => (
                  <div key={addonGroup._id} className="mb-6">
                    <h3 className="text-lg font-bold text-white mb-3">
                      {addonGroup.groupName}
                      {addonGroup.required && (
                        <span className="text-red-500">*</span>
                      )}
                    </h3>
                    <div className="space-y-2">
                      {addonGroup.items.map((item: any) => {
                        const isSelected = isAddonSelected(
                          addonGroup._id,
                          item._id
                        );
                        return (
                          <button
                            key={item._id}
                            onClick={() =>
                              handleAddonSelect(
                                addonGroup._id,
                                item,
                                addonGroup.multipleSelection
                              )
                            }
                            className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                              isSelected
                                ? "border-[#FFCE18] bg-[#FFCE18]/10"
                                : "border-white/10 hover:border-white/30"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {isSelected && (
                                <FaCheckCircle className="text-[#FFCE18]" />
                              )}
                              <span className="text-white font-semibold">
                                {item.name}
                              </span>
                            </div>
                            {item.priceAdjustment > 0 && (
                              <span className="text-[#FFCE18] text-sm">
                                +{item.priceAdjustment.toFixed(2)}{" "}
                                {restaurant.currency}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

              {/* Quantity */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white mb-3">Quantity</h3>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() =>
                      setProductQuantity(Math.max(1, productQuantity - 1))
                    }
                    className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all"
                  >
                    <FaMinus />
                  </button>
                  <span className="text-2xl font-black text-white w-12 text-center">
                    {productQuantity}
                  </span>
                  <button
                    onClick={() => setProductQuantity(productQuantity + 1)}
                    className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all"
                  >
                    <FaPlus />
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={addToCart}
                disabled={!selectedProduct.isAvailable}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#FFCE18] to-[#ffd94d] text-black font-bold text-lg hover:scale-105 transition-all disabled: opacity-50 disabled:cursor-not-allowed flex items-center justify-between px-6"
              >
                <span>Add to Cart</span>
                <span>
                  {calculatePrice().toFixed(2)} {restaurant.currency}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-gradient-to-b from-gray-900 to-black h-full overflow-y-auto border-l border-white/10 animate-slide-in-right">
            {/* Cart Header */}
            <div className="sticky top-0 backdrop-blur-xl bg-black/80 border-b border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-black text-white">Your Cart</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="p-2 rounded-full hover:bg-white/10 transition-all"
                >
                  <FaTimes className="text-white" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <FaShoppingCart className="text-[#FFCE18]" />
                <span className="text-gray-400">
                  {cart.length} {cart.length === 1 ? "item" : "items"}
                </span>
              </div>
            </div>

            {/* Cart Items */}
            <div className="p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-20">
                  <FaShoppingCart className="w-20 h-20 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Your cart is empty</p>
                </div>
              ) : (
                <>
                  {cart.map((item, index) => (
                    <div
                      key={index}
                      className="backdrop-blur-xl bg-white/5 rounded-2xl p-4 border border-white/10"
                    >
                      <div className="flex gap-4">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-20 h-20 rounded-xl object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-bold text-white mb-1">
                            {item.name}
                          </h3>
                          <p className="text-sm text-gray-400 mb-2">
                            Qty: {item.quantity}
                          </p>
                          <div className="text-[#FFCE18] font-bold">
                            {item.totalPrice.toFixed(2)} {restaurant.currency}
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            setCart(cart.filter((_, i) => i !== index))
                          }
                          className="text-red-400 hover:text-red-500"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Cart Total */}
                  <div className="backdrop-blur-xl bg-[#FFCE18]/10 rounded-2xl p-6 border-2 border-[#FFCE18]">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-white text-lg font-bold">
                        Total
                      </span>
                      <span className="text-[#FFCE18] text-3xl font-black">
                        {cartTotal.toFixed(2)} {restaurant.currency}
                      </span>
                    </div>
                    <button
                      onClick={handleWhatsAppOrder}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-[#FFCE18] to-[#ffd94d] text-black font-bold text-lg hover:scale-105 transition-all flex items-center justify-center gap-2"
                    >
                      <FaWhatsapp className="w-6 h-6" />
                      Order via WhatsApp
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Cart Button (Mobile) */}
      {!showCart && cart.length > 0 && (
        <button
          onClick={() => setShowCart(true)}
          className="md:hidden fixed bottom-6 right-6 p-4 rounded-full bg-gradient-to-r from-[#FFCE18] to-[#ffd94d] text-black shadow-2xl hover:scale-110 transition-transform z-40"
        >
          <div className="relative">
            <FaShoppingCart className="w-6 h-6" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {cart.length}
            </span>
          </div>
        </button>
      )}

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        @keyframes slide-in-right {
          from {
            transform:  translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        . animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        .scrollbar-hide: :-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style:  none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
