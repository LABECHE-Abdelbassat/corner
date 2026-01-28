"use client";

import React, { JSX, useState } from "react";
import {
  FaPlus,
  FaTrash,
  FaEdit,
  FaSave,
  FaCheck,
  FaTimes,
  FaArrowUp,
  FaArrowDown,
  FaCopy,
  FaUtensils,
  FaHamburger,
  FaPizzaSlice,
  FaBreadSlice,
  FaDrumstickBite,
  FaCoffee,
  FaIceCream,
  FaConciergeBell,
  FaImage,
  FaInfoCircle,
  FaPhone,
  FaClock,
  FaMapMarkerAlt,
  FaArrowLeft,
} from "react-icons/fa";
import { IoRestaurantOutline, IoClose } from "react-icons/io5";
import { useRouter } from "next/navigation";

// ==================== INTERFACES ====================
interface Restaurant {
  _id: string;
  name: string;
  logo: string;
  description: string;
  currency: string;
  isOpen: boolean;
  phone: string;
  address: string;
  openingHours: string;
}

interface Category {
  _id: string;
  name: string;
  description: string;
  image: string;
  order: number;
}

interface OptionItem {
  _id: string;
  name: string;
  priceAdjustment: number;
  isDefault: boolean;
}

interface OptionGroup {
  groupId: string;
  groupName: string;
  required: boolean;
  multipleSelection: boolean;
  minSelections: number;
  maxSelections: number;
  items: OptionItem[];
}

interface AddonItem {
  _id: string;
  name: string;
  priceAdjustment: number;
  isDefault: boolean;
}

interface AddonGroup {
  groupId: string;
  groupName: string;
  required: boolean;
  multipleSelection: boolean;
  minSelections: number;
  maxSelections: number;
  items: AddonItem[];
}

interface Variant {
  _id: string;
  name: string;
  price: number;
  isDefault: boolean;
}

interface Product {
  _id: string;
  categoryId: string;
  name: string;
  description: string;
  image: string;
  price: number;
  hasOptions: boolean;
  hasAddons: boolean;
  hasVariants: boolean;
  isAvailable: boolean;
  tags: string[];
  allergens: string[];
  options?: OptionGroup[];
  addons?: AddonGroup[];
  variants?: Variant[];
}

interface Promotion {
  _id: string;
  name: string;
  description: string;
  discountType: "percentage" | "fixed" | "delivery" | "bogo";
  discountValue: number;
  minimumOrderValue: number;
  isActive: boolean;
  daysAvailable: number[];
}

interface Alert {
  show: boolean;
  type: "success" | "error" | "";
  message: string;
}

type ProductTab = "basic" | "variants" | "options" | "addons" | "tags";

// ==================== COMPONENT ====================
export default function MenuManager() {
  const router = useRouter();

  // State
  const [restaurant, setRestaurant] = useState<Restaurant>({
    _id: `rest${Date.now()}`,
    name: "",
    logo: "",
    description: "",
    currency: "DZD",
    isOpen: true,
    phone: "",
    address: "",
    openingHours: "Mon-Fri: 10:00-22:00",
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [currentPromotion, setCurrentPromotion] = useState<Promotion | null>(
    null
  );
  const [currentVariant, setCurrentVariant] = useState<Variant | null>(null);
  const [currentOptionGroup, setCurrentOptionGroup] =
    useState<OptionGroup | null>(null);
  const [currentAddonGroup, setCurrentAddonGroup] = useState<AddonGroup | null>(
    null
  );

  const [productOptions, setProductOptions] = useState<OptionGroup[]>([]);
  const [productAddons, setProductAddons] = useState<AddonGroup[]>([]);
  const [productVariants, setProductVariants] = useState<Variant[]>([]);

  const [showCategoryModal, setShowCategoryModal] = useState<boolean>(false);
  const [showProductModal, setShowProductModal] = useState<boolean>(false);
  const [showPromotionModal, setShowPromotionModal] = useState<boolean>(false);
  const [showVariantModal, setShowVariantModal] = useState<boolean>(false);
  const [showOptionGroupModal, setShowOptionGroupModal] =
    useState<boolean>(false);
  const [showAddonGroupModal, setShowAddonGroupModal] =
    useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  const [productTab, setProductTab] = useState<ProductTab>("basic");
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [alert, setAlert] = useState<Alert>({
    show: false,
    type: "",
    message: "",
  });

  const showAlert = (type: "success" | "error", message: string): void => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: "", message: "" }), 3000);
  };

  // Category Functions
  const openCategoryModal = (category: Category | null = null): void => {
    setCurrentCategory(
      category || {
        _id: `cat${Date.now()}`,
        name: "",
        description: "",
        image: "",
        order: categories.length + 1,
      }
    );
    setShowCategoryModal(true);
  };

  const saveCategory = (): void => {
    if (!currentCategory?.name) {
      showAlert("error", "Category name is required");
      return;
    }
    if (categories.some((c) => c._id === currentCategory._id)) {
      setCategories(
        categories.map((c) =>
          c._id === currentCategory._id ? currentCategory : c
        )
      );
      showAlert("success", "Category updated");
    } else {
      setCategories([...categories, currentCategory]);
      showAlert("success", "Category added");
    }
    setShowCategoryModal(false);
  };

  const deleteCategory = (categoryId: string): void => {
    const productsInCategory = products.filter(
      (p) => p.categoryId === categoryId
    );
    if (productsInCategory.length > 0) {
      showAlert(
        "error",
        `Cannot delete:  ${productsInCategory.length} products in this category`
      );
      return;
    }
    setConfirmAction(() => () => {
      setCategories(categories.filter((c) => c._id !== categoryId));
      showAlert("success", "Category deleted");
      setShowConfirmModal(false);
    });
    setShowConfirmModal(true);
  };

  const moveCategoryOrder = (
    categoryId: string,
    direction: "up" | "down"
  ): void => {
    const idx = categories.findIndex((c) => c._id === categoryId);
    if (
      (direction === "up" && idx === 0) ||
      (direction === "down" && idx === categories.length - 1)
    )
      return;
    const newCats = [...categories];
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    [newCats[idx], newCats[targetIdx]] = [newCats[targetIdx], newCats[idx]];
    newCats.forEach((cat, i) => (cat.order = i + 1));
    setCategories(newCats);
  };

  // Product Functions
  const openProductModal = (product: Product | null = null): void => {
    if (product) {
      setCurrentProduct({ ...product });
      setProductOptions(product.options || []);
      setProductAddons(product.addons || []);
      setProductVariants(product.variants || []);
    } else {
      setCurrentProduct({
        _id: `prod${Date.now()}`,
        categoryId: categories[0]?._id || "",
        name: "",
        description: "",
        image: "",
        price: 0,
        hasOptions: false,
        hasAddons: false,
        hasVariants: false,
        isAvailable: true,
        tags: [],
        allergens: [],
      });
      setProductOptions([]);
      setProductAddons([]);
      setProductVariants([]);
    }
    setProductTab("basic");
    setShowProductModal(true);
  };

  const saveProduct = (): void => {
    if (!currentProduct?.name || !currentProduct?.categoryId) {
      showAlert("error", "Name and category required");
      return;
    }
    const productToSave: Product = { ...currentProduct };
    if (currentProduct.hasOptions && productOptions.length > 0)
      productToSave.options = [...productOptions];
    if (currentProduct.hasAddons && productAddons.length > 0)
      productToSave.addons = [...productAddons];
    if (currentProduct.hasVariants && productVariants.length > 0) {
      productToSave.variants = [...productVariants];
      productToSave.price = 0;
    }

    if (products.some((p) => p._id === currentProduct._id)) {
      setProducts(
        products.map((p) => (p._id === currentProduct._id ? productToSave : p))
      );
      showAlert("success", "Product updated");
    } else {
      setProducts([...products, productToSave]);
      showAlert("success", "Product added");
    }
    setShowProductModal(false);
  };

  const deleteProduct = (productId: string): void => {
    setConfirmAction(() => () => {
      setProducts(products.filter((p) => p._id !== productId));
      showAlert("success", "Product deleted");
      setShowConfirmModal(false);
    });
    setShowConfirmModal(true);
  };

  const cloneProduct = (product: Product): void => {
    setProducts([
      ...products,
      { ...product, _id: `prod${Date.now()}`, name: `${product.name} (copy)` },
    ]);
    showAlert("success", "Product duplicated");
  };

  // Variant Functions
  const openVariantModal = (variant: Variant | null = null): void => {
    setCurrentVariant(
      variant || {
        _id: `var${Date.now()}`,
        name: "",
        price: 0,
        isDefault: productVariants.length === 0,
      }
    );
    setShowVariantModal(true);
  };

  const saveVariant = (): void => {
    if (!currentVariant?.name) {
      showAlert("error", "Variant name required");
      return;
    }
    if (productVariants.some((v) => v._id === currentVariant._id)) {
      setProductVariants(
        productVariants.map((v) =>
          v._id === currentVariant._id ? currentVariant : v
        )
      );
    } else {
      setProductVariants([...productVariants, currentVariant]);
    }
    setShowVariantModal(false);
  };

  const deleteVariant = (variantId: string): void => {
    setProductVariants(productVariants.filter((v) => v._id !== variantId));
  };

  // Option Group Functions
  const openOptionGroupModal = (
    optionGroup: OptionGroup | null = null
  ): void => {
    setCurrentOptionGroup(
      optionGroup || {
        groupId: `opt${Date.now()}`,
        groupName: "",
        required: false,
        multipleSelection: false,
        minSelections: 0,
        maxSelections: 1,
        items: [],
      }
    );
    setShowOptionGroupModal(true);
  };

  const saveOptionGroup = (): void => {
    if (
      !currentOptionGroup?.groupName ||
      currentOptionGroup.items.length === 0
    ) {
      showAlert("error", "Group name and at least one option required");
      return;
    }
    if (
      productOptions.some((og) => og.groupId === currentOptionGroup.groupId)
    ) {
      setProductOptions(
        productOptions.map((og) =>
          og.groupId === currentOptionGroup.groupId ? currentOptionGroup : og
        )
      );
    } else {
      setProductOptions([...productOptions, currentOptionGroup]);
    }
    setShowOptionGroupModal(false);
  };

  const deleteOptionGroup = (groupId: string): void => {
    setProductOptions(productOptions.filter((og) => og.groupId !== groupId));
  };

  const addOptionItem = (): void => {
    if (!currentOptionGroup) return;
    setCurrentOptionGroup({
      ...currentOptionGroup,
      items: [
        ...currentOptionGroup.items,
        {
          _id: `item${Date.now()}`,
          name: "",
          priceAdjustment: 0,
          isDefault: false,
        },
      ],
    });
  };

  const removeOptionItem = (itemId: string): void => {
    if (!currentOptionGroup) return;
    setCurrentOptionGroup({
      ...currentOptionGroup,
      items: currentOptionGroup.items.filter((item) => item._id !== itemId),
    });
  };

  const updateOptionItem = (
    itemId: string,
    field: keyof OptionItem,
    value: string | number | boolean
  ): void => {
    if (!currentOptionGroup) return;
    setCurrentOptionGroup({
      ...currentOptionGroup,
      items: currentOptionGroup.items.map((item) =>
        item._id === itemId ? { ...item, [field]: value } : item
      ),
    });
  };

  // Addon Group Functions
  const openAddonGroupModal = (addonGroup: AddonGroup | null = null): void => {
    setCurrentAddonGroup(
      addonGroup || {
        groupId: `add${Date.now()}`,
        groupName: "",
        required: false,
        multipleSelection: true,
        minSelections: 0,
        maxSelections: 5,
        items: [],
      }
    );
    setShowAddonGroupModal(true);
  };

  const saveAddonGroup = (): void => {
    if (!currentAddonGroup?.groupName || currentAddonGroup.items.length === 0) {
      showAlert("error", "Group name and at least one addon required");
      return;
    }
    if (productAddons.some((ag) => ag.groupId === currentAddonGroup.groupId)) {
      setProductAddons(
        productAddons.map((ag) =>
          ag.groupId === currentAddonGroup.groupId ? currentAddonGroup : ag
        )
      );
    } else {
      setProductAddons([...productAddons, currentAddonGroup]);
    }
    setShowAddonGroupModal(false);
  };

  const deleteAddonGroup = (groupId: string): void => {
    setProductAddons(productAddons.filter((ag) => ag.groupId !== groupId));
  };

  const addAddonItem = (): void => {
    if (!currentAddonGroup) return;
    setCurrentAddonGroup({
      ...currentAddonGroup,
      items: [
        ...currentAddonGroup.items,
        {
          _id: `addon${Date.now()}`,
          name: "",
          priceAdjustment: 0,
          isDefault: false,
        },
      ],
    });
  };

  const removeAddonItem = (itemId: string): void => {
    if (!currentAddonGroup) return;
    setCurrentAddonGroup({
      ...currentAddonGroup,
      items: currentAddonGroup.items.filter((item) => item._id !== itemId),
    });
  };

  const updateAddonItem = (
    itemId: string,
    field: keyof AddonItem,
    value: string | number | boolean
  ): void => {
    if (!currentAddonGroup) return;
    setCurrentAddonGroup({
      ...currentAddonGroup,
      items: currentAddonGroup.items.map((item) =>
        item._id === itemId ? { ...item, [field]: value } : item
      ),
    });
  };

  // Promotion Functions
  const openPromotionModal = (promotion: Promotion | null = null): void => {
    setCurrentPromotion(
      promotion || {
        _id: `promo${Date.now()}`,
        name: "",
        description: "",
        discountType: "percentage",
        discountValue: 0,
        minimumOrderValue: 0,
        isActive: true,
        daysAvailable: [],
      }
    );
    setShowPromotionModal(true);
  };

  const savePromotion = (): void => {
    if (!currentPromotion?.name) {
      showAlert("error", "Promotion name required");
      return;
    }
    if (promotions.some((p) => p._id === currentPromotion._id)) {
      setPromotions(
        promotions.map((p) =>
          p._id === currentPromotion._id ? currentPromotion : p
        )
      );
      showAlert("success", "Promotion updated");
    } else {
      setPromotions([...promotions, currentPromotion]);
      showAlert("success", "Promotion added");
    }
    setShowPromotionModal(false);
  };

  const deletePromotion = (promotionId: string): void => {
    setConfirmAction(() => () => {
      setPromotions(promotions.filter((p) => p._id !== promotionId));
      showAlert("success", "Promotion deleted");
      setShowConfirmModal(false);
    });
    setShowConfirmModal(true);
  };

  const togglePromotionDay = (day: number): void => {
    if (!currentPromotion) return;
    const days = currentPromotion.daysAvailable.includes(day)
      ? currentPromotion.daysAvailable.filter((d) => d !== day)
      : [...currentPromotion.daysAvailable, day];
    setCurrentPromotion({ ...currentPromotion, daysAvailable: days });
  };

  // Tag/Allergen Functions
  const addTag = (tag: string): void => {
    if (!currentProduct) return;
    if (tag && !currentProduct.tags.includes(tag)) {
      setCurrentProduct({
        ...currentProduct,
        tags: [...currentProduct.tags, tag],
      });
    }
  };

  const removeTag = (tag: string): void => {
    if (!currentProduct) return;
    setCurrentProduct({
      ...currentProduct,
      tags: currentProduct.tags.filter((t) => t !== tag),
    });
  };

  const addAllergen = (allergen: string): void => {
    if (!currentProduct) return;
    if (allergen && !currentProduct.allergens.includes(allergen)) {
      setCurrentProduct({
        ...currentProduct,
        allergens: [...currentProduct.allergens, allergen],
      });
    }
  };

  const removeAllergen = (allergen: string): void => {
    if (!currentProduct) return;
    setCurrentProduct({
      ...currentProduct,
      allergens: currentProduct.allergens.filter((a) => a !== allergen),
    });
  };

  // Helper Functions
  const formatPrice = (price: number): string =>
    `${parseFloat(price.toString()).toFixed(2)} ${restaurant.currency}`;

  const getCategoryIcon = (name: string): JSX.Element => {
    const n = name.toLowerCase();
    if (n.includes("burger")) return <FaHamburger />;
    if (n.includes("pizza")) return <FaPizzaSlice />;
    if (n.includes("sandwich")) return <FaBreadSlice />;
    if (n.includes("drink") || n.includes("coffee")) return <FaCoffee />;
    if (n.includes("dessert")) return <FaIceCream />;
    if (n.includes("meal")) return <FaConciergeBell />;
    if (n.includes("main")) return <FaDrumstickBite />;
    return <FaUtensils />;
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
        setRestaurant({ ...restaurant, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const saveMenu = (): void => {
    if (!restaurant.name || categories.length === 0 || products.length === 0) {
      showAlert(
        "error",
        "Restaurant name, at least 1 category and 1 product required"
      );
      return;
    }
    const menuData = { restaurant, categories, products, promotions };
    console.log("Menu & Restaurant Info saved:", menuData);
    showAlert("success", "Menu & Restaurant Info saved successfully!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Alert */}
      {alert.show && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div
            className={`px-6 py-4 rounded-xl backdrop-blur-xl border-2 shadow-2xl ${
              alert.type === "success"
                ? "bg-green-500/20 border-green-500 text-green-100"
                : "bg-red-500/20 border-red-500 text-red-100"
            }`}
          >
            {alert.type === "success" ? (
              <FaCheck className="inline mr-2" />
            ) : (
              <FaTimes className="inline mr-2" />
            )}
            {alert.message}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-black/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/restaurant-admin/dashboard")}
                className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all"
                title="Back to Dashboard"
              >
                <FaArrowLeft className="text-white" />
              </button>
              <div>
                <h1 className="text-3xl font-black text-white">
                  Menu & Info Manager
                </h1>
                <p className="text-gray-400">
                  Manage your restaurant information and menu
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Restaurant Info */}
        <div className="backdrop-blur-xl bg-white/5 rounded-3xl p-8 border border-white/10 mb-8">
          <h2 className="text-3xl font-black text-white mb-6 flex items-center gap-3">
            <IoRestaurantOutline className="text-[#FFCE18]" />
            Restaurant Information
          </h2>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-bold mb-2">
                    Restaurant Name *
                  </label>
                  <input
                    type="text"
                    value={restaurant.name}
                    onChange={(e) =>
                      setRestaurant({ ...restaurant, name: e.target.value })
                    }
                    placeholder="Enter restaurant name"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#FFCE18] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-white font-bold mb-2">
                    Currency
                  </label>
                  <input
                    type="text"
                    value={restaurant.currency}
                    onChange={(e) =>
                      setRestaurant({ ...restaurant, currency: e.target.value })
                    }
                    placeholder="DZD, USD, EUR..."
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#FFCE18] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white font-bold mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={restaurant.description}
                  onChange={(e) =>
                    setRestaurant({
                      ...restaurant,
                      description: e.target.value,
                    })
                  }
                  placeholder="Brief description of your restaurant"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#FFCE18] focus:outline-none"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-bold mb-2 flex items-center gap-2">
                    <FaPhone className="text-[#FFCE18]" /> Phone Number
                  </label>
                  <input
                    type="tel"
                    value={restaurant.phone}
                    onChange={(e) =>
                      setRestaurant({ ...restaurant, phone: e.target.value })
                    }
                    placeholder="+213 XXX XXX XXX"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#FFCE18] focus: outline-none"
                  />
                </div>
                <div>
                  <label className="block text-white font-bold mb-2 flex items-center gap-2">
                    <FaClock className="text-[#FFCE18]" /> Opening Hours
                  </label>
                  <input
                    type="text"
                    value={restaurant.openingHours}
                    onChange={(e) =>
                      setRestaurant({
                        ...restaurant,
                        openingHours: e.target.value,
                      })
                    }
                    placeholder="Mon-Fri:  10:00-22:00"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#FFCE18] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white font-bold mb-2 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-[#FFCE18]" /> Address
                </label>
                <input
                  type="text"
                  value={restaurant.address}
                  onChange={(e) =>
                    setRestaurant({ ...restaurant, address: e.target.value })
                  }
                  placeholder="15 Rue de la Liberté, Tiaret"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#FFCE18] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-white font-bold mb-2">
                  Status
                </label>
                <button
                  onClick={() =>
                    setRestaurant({ ...restaurant, isOpen: !restaurant.isOpen })
                  }
                  className={`w-full px-4 py-3 rounded-xl font-bold transition-all ${
                    restaurant.isOpen
                      ? "bg-green-500/20 border-2 border-green-500 text-green-100"
                      : "bg-red-500/20 border-2 border-red-500 text-red-100"
                  }`}
                >
                  {restaurant.isOpen ? "Open" : "Closed"}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-white font-bold mb-2">Logo</label>
              {logoPreview || restaurant.logo ? (
                <div className="relative group">
                  <img
                    src={logoPreview || restaurant.logo}
                    alt="Logo"
                    className="w-full h-64 object-cover rounded-xl border-2 border-white/10"
                  />
                  <button
                    onClick={() => {
                      setLogoPreview(null);
                      setRestaurant({ ...restaurant, logo: "" });
                    }}
                    className="absolute top-2 right-2 p-2 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FaTrash />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => document.getElementById("logo-input")?.click()}
                  className="h-64 rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center cursor-pointer hover:border-[#FFCE18] transition-all"
                >
                  <FaImage className="w-12 h-12 text-gray-500 mb-2" />
                  <span className="text-gray-400">Upload Logo</span>
                </div>
              )}
              <input
                id="logo-input"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="backdrop-blur-xl bg-white/5 rounded-3xl p-8 border border-white/10 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-black text-white">Categories</h2>
            <button
              onClick={() => openCategoryModal()}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#FFCE18] to-[#ffd94d] text-black font-bold hover:scale-105 transition-all flex items-center gap-2"
            >
              <FaPlus /> Add Category
            </button>
          </div>
          {categories.length === 0 ? (
            <div className="text-center py-20">
              <IoRestaurantOutline className="w-20 h-20 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-6">No categories yet</p>
              <button
                onClick={() => openCategoryModal()}
                className="px-6 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all"
              >
                Add Category
              </button>
            </div>
          ) : (
            <div className="grid md: grid-cols-2 lg:grid-cols-3 gap-4">
              {categories
                .sort((a, b) => a.order - b.order)
                .map((cat) => (
                  <div
                    key={cat._id}
                    className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FFCE18] to-[#ffd94d] flex items-center justify-center text-black text-2xl">
                        {getCategoryIcon(cat.name)}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => moveCategoryOrder(cat._id, "up")}
                          disabled={cat.order === 1}
                          className="p-2 rounded-lg bg-white/10 hover: bg-white/20 disabled:opacity-30"
                        >
                          <FaArrowUp className="text-white" />
                        </button>
                        <button
                          onClick={() => moveCategoryOrder(cat._id, "down")}
                          disabled={cat.order === categories.length}
                          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30"
                        >
                          <FaArrowDown className="text-white" />
                        </button>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {cat.name}
                    </h3>
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                      {cat.description || "No description"}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {
                          products.filter((p) => p.categoryId === cat._id)
                            .length
                        }{" "}
                        products
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openCategoryModal(cat)}
                          className="p-2 rounded-lg bg-blue-500/20 text-blue-400"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => deleteCategory(cat._id)}
                          className="p-2 rounded-lg bg-red-500/20 text-red-400"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Products */}
        <div className="backdrop-blur-xl bg-white/5 rounded-3xl p-8 border border-white/10 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-black text-white">Products</h2>
            <button
              onClick={() => openProductModal()}
              disabled={categories.length === 0}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#FFCE18] to-[#ffd94d] text-black font-bold hover:scale-105 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <FaPlus /> Add Product
            </button>
          </div>
          {categories.length === 0 ? (
            <div className="bg-yellow-500/10 border-2 border-yellow-500/30 rounded-2xl p-6">
              <FaInfoCircle className="inline text-yellow-400 mr-2" />
              <span className="text-yellow-400 font-semibold">
                Please add categories first
              </span>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <FaPizzaSlice className="w-20 h-20 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-6">No products yet</p>
              <button
                onClick={() => openProductModal()}
                className="px-6 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20"
              >
                Add Product
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {categories
                .sort((a, b) => a.order - b.order)
                .map((cat) => {
                  const catProds = products.filter(
                    (p) => p.categoryId === cat._id
                  );
                  if (catProds.length === 0) return null;
                  return (
                    <div key={cat._id}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="text-2xl text-[#FFCE18]">
                          {getCategoryIcon(cat.name)}
                        </div>
                        <h3 className="text-2xl font-bold text-white">
                          {cat.name}
                        </h3>
                        <span className="text-sm text-gray-500">
                          ({catProds.length})
                        </span>
                      </div>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {catProds.map((prod) => (
                          <div
                            key={prod._id}
                            className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10"
                          >
                            <h4 className="text-xl font-bold text-white mb-2 line-clamp-1 h-7">
                              {prod.name}
                            </h4>
                            <p className="text-sm text-gray-400 mb-4 line-clamp-2 h-10">
                              {prod.description || "No description"}
                            </p>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {prod.hasVariants && (
                                <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold">
                                  Variants
                                </span>
                              )}
                              {prod.hasOptions && (
                                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold">
                                  Options
                                </span>
                              )}
                              {prod.hasAddons && (
                                <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold">
                                  Addons
                                </span>
                              )}
                              {!prod.isAvailable && (
                                <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-bold">
                                  Unavailable
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-2xl font-black text-[#FFCE18]">
                                {prod.hasVariants
                                  ? "Multi"
                                  : formatPrice(prod.price)}
                              </span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => openProductModal(prod)}
                                  className="p-2 rounded-lg bg-blue-500/20 text-blue-400"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  onClick={() => cloneProduct(prod)}
                                  className="p-2 rounded-lg bg-purple-500/20 text-purple-400"
                                >
                                  <FaCopy />
                                </button>
                                <button
                                  onClick={() => deleteProduct(prod._id)}
                                  className="p-2 rounded-lg bg-red-500/20 text-red-400"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Promotions */}
        <div className="backdrop-blur-xl bg-white/5 rounded-3xl p-8 border border-white/10 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-black text-white">Promotions</h2>
            <button
              onClick={() => openPromotionModal()}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#FFCE18] to-[#ffd94d] text-black font-bold hover:scale-105 transition-all flex items-center gap-2"
            >
              <FaPlus /> Add Promotion
            </button>
          </div>
          {promotions.length === 0 ? (
            <div className="text-center py-20">
              <FaCheck className="w-20 h-20 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-6">No promotions yet</p>
              <button
                onClick={() => openPromotionModal()}
                className="px-6 py-3 rounded-xl bg-white/10 text-white font-bold"
              >
                Add Promotion
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {promotions.map((promo) => (
                <div
                  key={promo._id}
                  className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">
                      {promo.name}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        promo.isActive
                          ? "bg-green-500/20 text-green-400"
                          : "bg-gray-500/20 text-gray-400"
                      }`}
                    >
                      {promo.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-4">
                    {promo.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {promo.discountType === "percentage"
                        ? `${promo.discountValue}%`
                        : formatPrice(promo.discountValue)}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openPromotionModal(promo)}
                        className="p-2 rounded-lg bg-blue-500/20 text-blue-400"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => deletePromotion(promo._id)}
                        className="p-2 rounded-lg bg-red-500/20 text-red-400"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <button
            onClick={() => router.push("/restaurant-admin/dashboard")}
            className="px-8 py-4 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={saveMenu}
            className="px-12 py-4 rounded-xl bg-gradient-to-r from-[#FFCE18] to-[#ffd94d] text-black font-black text-lg hover:scale-105 transition-all flex items-center gap-3 shadow-2xl"
          >
            <FaSave /> Save All Changes
          </button>
        </div>
      </div>

      {/* CATEGORY MODAL */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gradient-to-b from-gray-900 to-black rounded-3xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-900/90 backdrop-blur-xl border-b border-white/10 p-6 flex items-center justify-between">
              <h3 className="text-2xl font-black text-white">
                {categories.some((c) => c._id === currentCategory?._id)
                  ? "Edit Category"
                  : "Add Category"}
              </h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-all"
              >
                <IoClose className="w-6 h-6 text-white" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-white font-bold mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={currentCategory?.name || ""}
                  onChange={(e) =>
                    currentCategory &&
                    setCurrentCategory({
                      ...currentCategory,
                      name: e.target.value,
                    })
                  }
                  placeholder="Enter category name"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#FFCE18] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-white font-bold mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={currentCategory?.description || ""}
                  onChange={(e) =>
                    currentCategory &&
                    setCurrentCategory({
                      ...currentCategory,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe this category"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#FFCE18] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-white font-bold mb-2">
                  Image URL
                </label>
                <input
                  type="text"
                  value={currentCategory?.image || ""}
                  onChange={(e) =>
                    currentCategory &&
                    setCurrentCategory({
                      ...currentCategory,
                      image: e.target.value,
                    })
                  }
                  placeholder="Enter image URL"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#FFCE18] focus:outline-none"
                />
              </div>
            </div>
            <div className="sticky bottom-0 bg-gray-900/90 backdrop-blur-xl border-t border-white/10 p-6 flex gap-4">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="flex-1 px-6 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={saveCategory}
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-[#FFCE18] to-[#ffd94d] text-black font-bold hover:scale-105 transition-all"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT MODAL */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gradient-to-b from-gray-900 to-black rounded-3xl border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-900/90 backdrop-blur-xl border-b border-white/10 p-6 flex items-center justify-between">
              <h3 className="text-2xl font-black text-white">
                {products.some((p) => p._id === currentProduct?._id)
                  ? "Edit Product"
                  : "Add Product"}
              </h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg"
              >
                <IoClose className="w-6 h-6 text-white" />
              </button>
            </div>

            <div className="border-b border-white/10 px-6">
              <div className="flex gap-2 overflow-x-auto">
                {["basic", "variants", "options", "addons", "tags"].map(
                  (tab) => (
                    <button
                      key={tab}
                      onClick={() => {
                        if (tab === "variants" && !currentProduct?.hasVariants)
                          return;
                        if (tab === "options" && !currentProduct?.hasOptions)
                          return;
                        if (tab === "addons" && !currentProduct?.hasAddons)
                          return;
                        setProductTab(tab as ProductTab);
                      }}
                      className={`px-6 py-3 font-bold border-b-2 transition-all capitalize ${
                        productTab === tab
                          ? "border-[#FFCE18] text-[#FFCE18]"
                          : "border-transparent text-gray-500 hover:text-white"
                      } ${
                        ((tab === "variants" && !currentProduct?.hasVariants) ||
                          (tab === "options" && !currentProduct?.hasOptions) ||
                          (tab === "addons" && !currentProduct?.hasAddons)) &&
                        "opacity-30 cursor-not-allowed"
                      }`}
                    >
                      {tab}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="p-6">
              {productTab === "basic" && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white font-bold mb-2">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        value={currentProduct?.name || ""}
                        onChange={(e) =>
                          currentProduct &&
                          setCurrentProduct({
                            ...currentProduct,
                            name: e.target.value,
                          })
                        }
                        placeholder="Product name"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#FFCE18] focus: outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-white font-bold mb-2">
                        Category *
                      </label>
                      <select
                        value={currentProduct?.categoryId || ""}
                        onChange={(e) =>
                          currentProduct &&
                          setCurrentProduct({
                            ...currentProduct,
                            categoryId: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#FFCE18] focus:outline-none"
                      >
                        <option value="">Select category</option>
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat._id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-white font-bold mb-2">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={currentProduct?.description || ""}
                      onChange={(e) =>
                        currentProduct &&
                        setCurrentProduct({
                          ...currentProduct,
                          description: e.target.value,
                        })
                      }
                      placeholder="Product description"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#FFCE18] focus:outline-none"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white font-bold mb-2">
                        Image URL
                      </label>
                      <input
                        type="text"
                        value={currentProduct?.image || ""}
                        onChange={(e) =>
                          currentProduct &&
                          setCurrentProduct({
                            ...currentProduct,
                            image: e.target.value,
                          })
                        }
                        placeholder="Image URL"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#FFCE18] focus: outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-white font-bold mb-2">
                        Price
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={currentProduct?.price || 0}
                        onChange={(e) =>
                          currentProduct &&
                          setCurrentProduct({
                            ...currentProduct,
                            price: parseFloat(e.target.value),
                          })
                        }
                        disabled={currentProduct?.hasVariants}
                        placeholder="Price"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#FFCE18] focus: outline-none disabled:opacity-50"
                      />
                      {currentProduct?.hasVariants && (
                        <p className="text-xs text-gray-500 mt-1">
                          Price set in variants
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <button
                      onClick={() =>
                        currentProduct &&
                        setCurrentProduct({
                          ...currentProduct,
                          hasVariants: !currentProduct.hasVariants,
                        })
                      }
                      className={`px-6 py-4 rounded-xl font-bold transition-all ${
                        currentProduct?.hasVariants
                          ? "bg-[#FFCE18]/20 border-2 border-[#FFCE18] text-[#FFCE18]"
                          : "bg-white/5 border-2 border-white/10 text-white hover: bg-white/10"
                      }`}
                    >
                      Has Variants
                    </button>
                    <button
                      onClick={() =>
                        currentProduct &&
                        setCurrentProduct({
                          ...currentProduct,
                          hasOptions: !currentProduct.hasOptions,
                        })
                      }
                      className={`px-6 py-4 rounded-xl font-bold transition-all ${
                        currentProduct?.hasOptions
                          ? "bg-[#FFCE18]/20 border-2 border-[#FFCE18] text-[#FFCE18]"
                          : "bg-white/5 border-2 border-white/10 text-white hover: bg-white/10"
                      }`}
                    >
                      Has Options
                    </button>
                    <button
                      onClick={() =>
                        currentProduct &&
                        setCurrentProduct({
                          ...currentProduct,
                          hasAddons: !currentProduct.hasAddons,
                        })
                      }
                      className={`px-6 py-4 rounded-xl font-bold transition-all ${
                        currentProduct?.hasAddons
                          ? "bg-[#FFCE18]/20 border-2 border-[#FFCE18] text-[#FFCE18]"
                          : "bg-white/5 border-2 border-white/10 text-white hover:bg-white/10"
                      }`}
                    >
                      Has Addons
                    </button>
                    <button
                      onClick={() =>
                        currentProduct &&
                        setCurrentProduct({
                          ...currentProduct,
                          isAvailable: !currentProduct.isAvailable,
                        })
                      }
                      className={`px-6 py-4 rounded-xl font-bold transition-all ${
                        currentProduct?.isAvailable
                          ? "bg-green-500/20 border-2 border-green-500 text-green-400"
                          : "bg-red-500/20 border-2 border-red-500 text-red-400"
                      }`}
                    >
                      {currentProduct?.isAvailable
                        ? "Available"
                        : "Unavailable"}
                    </button>
                  </div>
                </div>
              )}

              {productTab === "variants" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xl font-bold text-white">Variants</h4>
                    <button
                      onClick={() => openVariantModal()}
                      className="px-4 py-2 rounded-xl bg-[#FFCE18] text-black font-bold hover:scale-105 transition-all"
                    >
                      <FaPlus className="inline mr-2" /> Add Variant
                    </button>
                  </div>
                  {productVariants.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-400 mb-4">No variants added</p>
                      <button
                        onClick={() => openVariantModal()}
                        className="px-6 py-3 rounded-xl bg-white/10 text-white font-bold"
                      >
                        Add Variant
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {productVariants.map((variant) => (
                        <div
                          key={variant._id}
                          className="flex items-center justify-between bg-white/5 rounded-xl p-4 border border-white/10"
                        >
                          <div>
                            <span className="text-white font-bold">
                              {variant.name}
                            </span>
                            {variant.isDefault && (
                              <span className="ml-2 px-2 py-1 rounded-full bg-[#FFCE18]/20 text-[#FFCE18] text-xs font-bold">
                                Default
                              </span>
                            )}
                            <div className="text-[#FFCE18] font-bold">
                              {formatPrice(variant.price)}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => openVariantModal(variant)}
                              className="p-2 rounded-lg bg-blue-500/20 text-blue-400"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => deleteVariant(variant._id)}
                              disabled={productVariants.length <= 1}
                              className="p-2 rounded-lg bg-red-500/20 text-red-400 disabled:opacity-30"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {productTab === "options" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xl font-bold text-white">
                      Option Groups
                    </h4>
                    <button
                      onClick={() => openOptionGroupModal()}
                      className="px-4 py-2 rounded-xl bg-[#FFCE18] text-black font-bold hover:scale-105 transition-all"
                    >
                      <FaPlus className="inline mr-2" /> Add Group
                    </button>
                  </div>
                  {productOptions.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-400 mb-4">No option groups</p>
                      <button
                        onClick={() => openOptionGroupModal()}
                        className="px-6 py-3 rounded-xl bg-white/10 text-white font-bold"
                      >
                        Add Group
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {productOptions.map((og) => (
                        <div
                          key={og.groupId}
                          className="bg-white/5 rounded-xl p-6 border border-white/10"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h5 className="text-lg font-bold text-white">
                                {og.groupName}
                              </h5>
                              {og.required && (
                                <span className="text-xs text-red-400 font-bold">
                                  Required
                                </span>
                              )}
                              <p className="text-sm text-gray-500">
                                {og.multipleSelection
                                  ? `Multiple (${og.minSelections}-${og.maxSelections})`
                                  : "Single"}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => openOptionGroupModal(og)}
                                className="p-2 rounded-lg bg-blue-500/20 text-blue-400"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => deleteOptionGroup(og.groupId)}
                                className="p-2 rounded-lg bg-red-500/20 text-red-400"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {og.items.map((item) => (
                              <div
                                key={item._id}
                                className="flex items-center justify-between text-sm"
                              >
                                <span className="text-gray-300">
                                  {item.name}
                                </span>
                                {item.priceAdjustment > 0 && (
                                  <span className="text-[#FFCE18]">
                                    +{formatPrice(item.priceAdjustment)}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {productTab === "addons" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xl font-bold text-white">
                      Addon Groups
                    </h4>
                    <button
                      onClick={() => openAddonGroupModal()}
                      className="px-4 py-2 rounded-xl bg-[#FFCE18] text-black font-bold hover:scale-105 transition-all"
                    >
                      <FaPlus className="inline mr-2" /> Add Group
                    </button>
                  </div>
                  {productAddons.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-400 mb-4">No addon groups</p>
                      <button
                        onClick={() => openAddonGroupModal()}
                        className="px-6 py-3 rounded-xl bg-white/10 text-white font-bold"
                      >
                        Add Group
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {productAddons.map((ag) => (
                        <div
                          key={ag.groupId}
                          className="bg-white/5 rounded-xl p-6 border border-white/10"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h5 className="text-lg font-bold text-white">
                                {ag.groupName}
                              </h5>
                              <p className="text-sm text-gray-500">
                                Max: {ag.maxSelections}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => openAddonGroupModal(ag)}
                                className="p-2 rounded-lg bg-blue-500/20 text-blue-400"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => deleteAddonGroup(ag.groupId)}
                                className="p-2 rounded-lg bg-red-500/20 text-red-400"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {ag.items.map((item) => (
                              <div
                                key={item._id}
                                className="flex items-center justify-between text-sm"
                              >
                                <span className="text-gray-300">
                                  {item.name}
                                </span>
                                {item.priceAdjustment > 0 && (
                                  <span className="text-[#FFCE18]">
                                    +{formatPrice(item.priceAdjustment)}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {productTab === "tags" && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xl font-bold text-white mb-4">Tags</h4>
                    <input
                      type="text"
                      placeholder="Press Enter to add tag"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const target = e.target as HTMLInputElement;
                          addTag(target.value);
                          target.value = "";
                        }
                      }}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#FFCE18] focus:outline-none mb-4"
                    />
                    <div className="flex flex-wrap gap-2">
                      {currentProduct?.tags?.map((tag, i) => (
                        <div
                          key={i}
                          className="px-4 py-2 rounded-full bg-[#FFCE18]/20 text-[#FFCE18] font-bold flex items-center gap-2"
                        >
                          {tag}
                          <button onClick={() => removeTag(tag)}>
                            <FaTimes />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white mb-4">
                      Allergens
                    </h4>
                    <input
                      type="text"
                      placeholder="Press Enter to add allergen"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const target = e.target as HTMLInputElement;
                          addAllergen(target.value);
                          target.value = "";
                        }
                      }}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#FFCE18] focus:outline-none mb-4"
                    />
                    <div className="flex flex-wrap gap-2">
                      {currentProduct?.allergens?.map((allergen, i) => (
                        <div
                          key={i}
                          className="px-4 py-2 rounded-full bg-red-500/20 text-red-400 font-bold flex items-center gap-2"
                        >
                          {allergen}
                          <button onClick={() => removeAllergen(allergen)}>
                            <FaTimes />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-900/90 backdrop-blur-xl border-t border-white/10 p-6 flex gap-4">
              <button
                onClick={() => setShowProductModal(false)}
                className="flex-1 px-6 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={saveProduct}
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-[#FFCE18] to-[#ffd94d] text-black font-bold hover:scale-105 transition-all"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VARIANT MODAL */}
      {showVariantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gradient-to-b from-gray-900 to-black rounded-3xl border border-white/10 w-full max-w-md">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-2xl font-black text-white">
                {productVariants.some((v) => v._id === currentVariant?._id)
                  ? "Edit Variant"
                  : "Add Variant"}
              </h3>
              <button
                onClick={() => setShowVariantModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg"
              >
                <IoClose className="w-6 h-6 text-white" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-white font-bold mb-2">
                  Variant Name *
                </label>
                <input
                  type="text"
                  value={currentVariant?.name || ""}
                  onChange={(e) =>
                    currentVariant &&
                    setCurrentVariant({
                      ...currentVariant,
                      name: e.target.value,
                    })
                  }
                  placeholder="Small, Medium, Large..."
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#FFCE18] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-white font-bold mb-2">
                  Price *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={currentVariant?.price || 0}
                  onChange={(e) =>
                    currentVariant &&
                    setCurrentVariant({
                      ...currentVariant,
                      price: parseFloat(e.target.value),
                    })
                  }
                  placeholder="Price"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#FFCE18] focus:outline-none"
                />
              </div>
              <button
                onClick={() =>
                  currentVariant &&
                  setCurrentVariant({
                    ...currentVariant,
                    isDefault: !currentVariant.isDefault,
                  })
                }
                className={`w-full px-6 py-4 rounded-xl font-bold transition-all ${
                  currentVariant?.isDefault
                    ? "bg-[#FFCE18]/20 border-2 border-[#FFCE18] text-[#FFCE18]"
                    : "bg-white/5 border-2 border-white/10 text-white hover:bg-white/10"
                }`}
              >
                Default Variant
              </button>
            </div>
            <div className="p-6 border-t border-white/10 flex gap-4">
              <button
                onClick={() => setShowVariantModal(false)}
                className="flex-1 px-6 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={saveVariant}
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-[#FFCE18] to-[#ffd94d] text-black font-bold hover:scale-105 transition-all"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OPTION GROUP MODAL */}
      {showOptionGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gradient-to-b from-gray-900 to-black rounded-3xl border border-white/10 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-900/90 backdrop-blur-xl p-6 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-2xl font-black text-white">
                {productOptions.some(
                  (og) => og.groupId === currentOptionGroup?.groupId
                )
                  ? "Edit Option Group"
                  : "Add Option Group"}
              </h3>
              <button
                onClick={() => setShowOptionGroupModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg"
              >
                <IoClose className="w-6 h-6 text-white" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-white font-bold mb-2">
                  Group Name *
                </label>
                <input
                  type="text"
                  value={currentOptionGroup?.groupName || ""}
                  onChange={(e) =>
                    currentOptionGroup &&
                    setCurrentOptionGroup({
                      ...currentOptionGroup,
                      groupName: e.target.value,
                    })
                  }
                  placeholder="Size, Sauce, Toppings..."
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#FFCE18] focus:outline-none"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={() =>
                    currentOptionGroup &&
                    setCurrentOptionGroup({
                      ...currentOptionGroup,
                      required: !currentOptionGroup.required,
                    })
                  }
                  className={`px-6 py-4 rounded-xl font-bold transition-all ${
                    currentOptionGroup?.required
                      ? "bg-[#FFCE18]/20 border-2 border-[#FFCE18] text-[#FFCE18]"
                      : "bg-white/5 border-2 border-white/10 text-white hover:bg-white/10"
                  }`}
                >
                  Required
                </button>
                <button
                  onClick={() =>
                    currentOptionGroup &&
                    setCurrentOptionGroup({
                      ...currentOptionGroup,
                      multipleSelection: !currentOptionGroup.multipleSelection,
                    })
                  }
                  className={`px-6 py-4 rounded-xl font-bold transition-all ${
                    currentOptionGroup?.multipleSelection
                      ? "bg-[#FFCE18]/20 border-2 border-[#FFCE18] text-[#FFCE18]"
                      : "bg-white/5 border-2 border-white/10 text-white hover:bg-white/10"
                  }`}
                >
                  Multiple Selection
                </button>
              </div>

              {currentOptionGroup?.multipleSelection && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-bold mb-2">
                      Min Selections
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={currentOptionGroup?.minSelections || 0}
                      onChange={(e) =>
                        currentOptionGroup &&
                        setCurrentOptionGroup({
                          ...currentOptionGroup,
                          minSelections: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#FFCE18] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-bold mb-2">
                      Max Selections
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={currentOptionGroup?.maxSelections || 1}
                      onChange={(e) =>
                        currentOptionGroup &&
                        setCurrentOptionGroup({
                          ...currentOptionGroup,
                          maxSelections: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus: border-[#FFCE18] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-white">Options</h4>
                  <button
                    onClick={addOptionItem}
                    className="px-4 py-2 rounded-xl bg-[#FFCE18] text-black font-bold hover:scale-105 transition-all text-sm"
                  >
                    <FaPlus className="inline mr-2" /> Add Option
                  </button>
                </div>
                {currentOptionGroup?.items?.length === 0 ? (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-center text-yellow-400">
                    No options added. Add at least one option.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {currentOptionGroup?.items?.map((item) => (
                      <div
                        key={item._id}
                        className="bg-white/5 rounded-xl p-4 border border-white/10"
                      >
                        <div className="grid md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <label className="block text-white text-sm font-bold mb-2">
                              Name *
                            </label>
                            <input
                              type="text"
                              value={item.name || ""}
                              onChange={(e) =>
                                updateOptionItem(
                                  item._id,
                                  "name",
                                  e.target.value
                                )
                              }
                              placeholder="Option name"
                              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus: border-[#FFCE18] focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-white text-sm font-bold mb-2">
                              Price Adjustment
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.priceAdjustment || 0}
                              onChange={(e) =>
                                updateOptionItem(
                                  item._id,
                                  "priceAdjustment",
                                  parseFloat(e.target.value)
                                )
                              }
                              placeholder="0.00"
                              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus: border-[#FFCE18] focus:outline-none"
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() =>
                              updateOptionItem(
                                item._id,
                                "isDefault",
                                !item.isDefault
                              )
                            }
                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                              item.isDefault
                                ? "bg-[#FFCE18]/20 text-[#FFCE18]"
                                : "bg-white/5 text-white hover:bg-white/10"
                            }`}
                          >
                            {item.isDefault ? (
                              <FaCheck className="inline mr-2" />
                            ) : null}
                            Default
                          </button>
                          <button
                            onClick={() => removeOptionItem(item._id)}
                            disabled={currentOptionGroup.items.length <= 1}
                            className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 disabled:opacity-30"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="sticky bottom-0 bg-gray-900/90 backdrop-blur-xl p-6 border-t border-white/10 flex gap-4">
              <button
                onClick={() => setShowOptionGroupModal(false)}
                className="flex-1 px-6 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={saveOptionGroup}
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-[#FFCE18] to-[#ffd94d] text-black font-bold hover: scale-105 transition-all"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADDON GROUP MODAL */}
      {showAddonGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gradient-to-b from-gray-900 to-black rounded-3xl border border-white/10 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-900/90 backdrop-blur-xl p-6 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-2xl font-black text-white">
                {productAddons.some(
                  (ag) => ag.groupId === currentAddonGroup?.groupId
                )
                  ? "Edit Addon Group"
                  : "Add Addon Group"}
              </h3>
              <button
                onClick={() => setShowAddonGroupModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg"
              >
                <IoClose className="w-6 h-6 text-white" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-white font-bold mb-2">
                  Group Name *
                </label>
                <input
                  type="text"
                  value={currentAddonGroup?.groupName || ""}
                  onChange={(e) =>
                    currentAddonGroup &&
                    setCurrentAddonGroup({
                      ...currentAddonGroup,
                      groupName: e.target.value,
                    })
                  }
                  placeholder="Extras, Add-ons..."
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#FFCE18] focus:outline-none"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-bold mb-2">
                    Min Selections
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={currentAddonGroup?.minSelections || 0}
                    onChange={(e) =>
                      currentAddonGroup &&
                      setCurrentAddonGroup({
                        ...currentAddonGroup,
                        minSelections: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#FFCE18] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-white font-bold mb-2">
                    Max Selections
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={currentAddonGroup?.maxSelections || 5}
                    onChange={(e) =>
                      currentAddonGroup &&
                      setCurrentAddonGroup({
                        ...currentAddonGroup,
                        maxSelections: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#FFCE18] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-white">Addons</h4>
                  <button
                    onClick={addAddonItem}
                    className="px-4 py-2 rounded-xl bg-[#FFCE18] text-black font-bold hover: scale-105 transition-all text-sm"
                  >
                    <FaPlus className="inline mr-2" /> Add Addon
                  </button>
                </div>
                {currentAddonGroup?.items?.length === 0 ? (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-center text-yellow-400">
                    No addons added.Add at least one addon.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {currentAddonGroup?.items?.map((item) => (
                      <div
                        key={item._id}
                        className="bg-white/5 rounded-xl p-4 border border-white/10"
                      >
                        <div className="grid md: grid-cols-2 gap-4 mb-3">
                          <div>
                            <label className="block text-white text-sm font-bold mb-2">
                              Name *
                            </label>
                            <input
                              type="text"
                              value={item.name || ""}
                              onChange={(e) =>
                                updateAddonItem(
                                  item._id,
                                  "name",
                                  e.target.value
                                )
                              }
                              placeholder="Addon name"
                              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#FFCE18] focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-white text-sm font-bold mb-2">
                              Price Adjustment
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.priceAdjustment || 0}
                              onChange={(e) =>
                                updateAddonItem(
                                  item._id,
                                  "priceAdjustment",
                                  parseFloat(e.target.value)
                                )
                              }
                              placeholder="0.00"
                              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#FFCE18] focus:outline-none"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <button
                            onClick={() => removeAddonItem(item._id)}
                            disabled={currentAddonGroup.items.length <= 1}
                            className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 disabled:opacity-30"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="sticky bottom-0 bg-gray-900/90 backdrop-blur-xl p-6 border-t border-white/10 flex gap-4">
              <button
                onClick={() => setShowAddonGroupModal(false)}
                className="flex-1 px-6 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={saveAddonGroup}
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-[#FFCE18] to-[#ffd94d] text-black font-bold hover:scale-105 transition-all"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROMOTION MODAL */}
      {showPromotionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gradient-to-b from-gray-900 to-black rounded-3xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-900/90 backdrop-blur-xl p-6 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-2xl font-black text-white">
                {promotions.some((p) => p._id === currentPromotion?._id)
                  ? "Edit Promotion"
                  : "Add Promotion"}
              </h3>
              <button
                onClick={() => setShowPromotionModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg"
              >
                <IoClose className="w-6 h-6 text-white" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-white font-bold mb-2">
                  Promotion Name *
                </label>
                <input
                  type="text"
                  value={currentPromotion?.name || ""}
                  onChange={(e) =>
                    currentPromotion &&
                    setCurrentPromotion({
                      ...currentPromotion,
                      name: e.target.value,
                    })
                  }
                  placeholder="10% off, Free delivery..."
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#FFCE18] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-white font-bold mb-2">
                  Description *
                </label>
                <textarea
                  rows={2}
                  value={currentPromotion?.description || ""}
                  onChange={(e) =>
                    currentPromotion &&
                    setCurrentPromotion({
                      ...currentPromotion,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe this promotion"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#FFCE18] focus:outline-none"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-bold mb-2">
                    Discount Type
                  </label>
                  <select
                    value={currentPromotion?.discountType || "percentage"}
                    onChange={(e) =>
                      currentPromotion &&
                      setCurrentPromotion({
                        ...currentPromotion,
                        discountType: e.target.value as any,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#FFCE18] focus:outline-none"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount</option>
                    <option value="delivery">Free Delivery</option>
                    <option value="bogo">Buy 1 Get 1</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white font-bold mb-2">
                    Discount Value
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={currentPromotion?.discountValue || 0}
                    onChange={(e) =>
                      currentPromotion &&
                      setCurrentPromotion({
                        ...currentPromotion,
                        discountValue: parseFloat(e.target.value),
                      })
                    }
                    placeholder="Value"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#FFCE18] focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-white font-bold mb-2">
                  Minimum Order Value
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={currentPromotion?.minimumOrderValue || 0}
                  onChange={(e) =>
                    currentPromotion &&
                    setCurrentPromotion({
                      ...currentPromotion,
                      minimumOrderValue: parseFloat(e.target.value),
                    })
                  }
                  placeholder="0 = No minimum"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#FFCE18] focus: outline-none"
                />
              </div>
              <div>
                <label className="block text-white font-bold mb-3">
                  Available Days
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day, i) => (
                      <button
                        key={i}
                        onClick={() => togglePromotionDay(i)}
                        className={`px-4 py-3 rounded-xl font-bold transition-all ${
                          currentPromotion?.daysAvailable?.includes(i)
                            ? "bg-[#FFCE18]/20 border-2 border-[#FFCE18] text-[#FFCE18]"
                            : "bg-white/5 border-2 border-white/10 text-white hover:bg-white/10"
                        }`}
                      >
                        {day}
                      </button>
                    )
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Leave empty for all days
                </p>
              </div>
              <button
                onClick={() =>
                  currentPromotion &&
                  setCurrentPromotion({
                    ...currentPromotion,
                    isActive: !currentPromotion.isActive,
                  })
                }
                className={`w-full px-6 py-4 rounded-xl font-bold transition-all ${
                  currentPromotion?.isActive
                    ? "bg-green-500/20 border-2 border-green-500 text-green-400"
                    : "bg-red-500/20 border-2 border-red-500 text-red-400"
                }`}
              >
                {currentPromotion?.isActive ? "Active" : "Inactive"}
              </button>
            </div>
            <div className="sticky bottom-0 bg-gray-900/90 backdrop-blur-xl p-6 border-t border-white/10 flex gap-4">
              <button
                onClick={() => setShowPromotionModal(false)}
                className="flex-1 px-6 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={savePromotion}
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-[#FFCE18] to-[#ffd94d] text-black font-bold hover:scale-105 transition-all"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gradient-to-b from-gray-900 to-black rounded-3xl border border-white/10 w-full max-w-md">
            <div className="p-6 border-b border-white/10">
              <h3 className="text-2xl font-black text-white">Confirm Delete</h3>
            </div>
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaTrash className="w-8 h-8 text-red-400" />
                </div>
                <p className="text-gray-300">
                  Are you sure you want to delete this item? This action cannot
                  be undone.
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-white/10 flex gap-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-6 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction || (() => {})}
                className="flex-1 px-6 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STYLES */}
      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
