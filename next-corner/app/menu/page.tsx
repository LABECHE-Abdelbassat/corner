"use client";

import React, { useState, useMemo } from "react";
import {
  FaSearch,
  FaTimes,
  FaShoppingCart,
  FaPlus,
  FaMinus,
  FaPhone,
  FaWhatsapp,
  FaMapMarkerAlt,
  FaClock,
  FaChevronRight,
  FaCheckCircle,
  FaInfoCircle,
  FaTag,
  FaArrowLeft,
} from "react-icons/fa";

// Empty menu data object - you'll fill this with your data
const menuData = {
  restaurant: {
    _id: "rest123456789",
    name: "Corner Test Restaurant",
    logo: "/corner-logo.svg",
    description:
      "Restaurant offering all types of options and add-ons to test the system",
    currency: "DZ",
    isOpen: true,
  },
  categories: [
    {
      _id: "cat001",
      name: "Appetizers",
      description: "Delicious appetizers to start your meal",
      image: "https://example.com/images/appetizers.jpg",
      order: 1,
    },
    {
      _id: "cat002",
      name: "Burgers",
      description: "Variety of burgers",
      image: "https://example.com/images/burgers.jpg",
      order: 2,
    },
    {
      _id: "cat003",
      name: "Pizza",
      description: "Fresh pizza with daily prepared dough",
      image: "https://example.com/images/pizza.jpg",
      order: 3,
    },
    {
      _id: "cat004",
      name: "Sandwiches",
      description: "Delicious and varied sandwiches",
      image: "https://example.com/images/sandwiches.jpg",
      order: 4,
    },
    {
      _id: "cat005",
      name: "Main Courses",
      description: "Special main dishes",
      image: "https://example.com/images/main_courses.jpg",
      order: 5,
    },
    {
      _id: "cat006",
      name: "Drinks",
      description: "Selection of cold and hot beverages",
      image: "https://example.com/images/drinks.jpg",
      order: 6,
    },
    {
      _id: "cat007",
      name: "Desserts",
      description: "Delicious desserts to finish your meal",
      image: "https://example.com/images/desserts.jpg",
      order: 7,
    },
    {
      _id: "cat008",
      name: "Meals",
      description: "Complete meals at special prices",
      image: "https://example.com/images/meals.jpg",
      order: 8,
    },
  ],
  products: [
    // Simple products without options
    {
      _id: "prod001",
      categoryId: "cat001",
      name: "Green Salad",
      description: "Fresh salad with special dressing",
      image:
        "https://media.istockphoto.com/id/520410807/photo/cheeseburger.jpg?s=612x612&w=0&k=20&c=fG_OrCzR5HkJGI8RXBk76NwxxTasMb1qpTVlEM0oyg4=",
      price: 4.99,
      hasOptions: false,
      hasAddons: false,
      hasVariants: false,
      isAvailable: true,
      tags: ["Vegetarian", "Healthy"],
      allergens: ["Nuts"],
    },
    {
      _id: "prod002",
      categoryId: "cat001",
      name: "Hummus",
      description: "Seasoned hummus with olive oil and lemon",
      image: "/images/hero-right1.png",
      price: 3.99,
      hasOptions: false,
      hasAddons: false,
      hasVariants: false,
      isAvailable: true,
      tags: ["Vegetarian"],
      allergens: ["Sesame"],
    },

    // Product with different sizes and non-proportional prices
    {
      _id: "prod003",
      categoryId: "cat001",
      name: "Chicken Nuggets",
      description: "Crispy fried chicken pieces",
      image: "/images/hero-right1.png",
      price: 0,
      hasOptions: false,
      hasAddons: false,
      hasVariants: true,
      variants: [
        {
          _id: "var001",
          name: "6 Pieces",
          price: 6.0,
          isDefault: true,
        },
        {
          _id: "var002",
          name: "12 Pieces",
          price: 10.0,
          isDefault: false,
        },
        {
          _id: "var003",
          name: "18 Pieces",
          price: 14.0,
          isDefault: false,
        },
      ],
      isAvailable: true,
      tags: [],
      allergens: ["Wheat", "Chicken"],
    },

    // Product with required options (like tacos)
    {
      _id: "prod004",
      categoryId: "cat004",
      name: "Tacos",
      description: "Tacos prepared in authentic Mexican style",
      image: "/images/hero-right1.png",
      price: 7.99,
      hasOptions: true,
      options: [
        {
          groupId: "opt001",
          groupName: "Type of Meat",
          required: true,
          multipleSelection: false,
          minSelections: 1,
          maxSelections: 1,
          items: [
            {
              _id: "item001",
              name: "Chicken",
              priceAdjustment: 0,
              isDefault: true,
            },
            {
              _id: "item002",
              name: "Beef",
              priceAdjustment: 1.5,
              isDefault: false,
            },
            {
              _id: "item003",
              name: "Grilled Meat",
              priceAdjustment: 2.0,
              isDefault: false,
            },
          ],
        },
        {
          groupId: "opt002",
          groupName: "Vegetables",
          required: false,
          multipleSelection: true,
          minSelections: 0,
          maxSelections: 5,
          items: [
            {
              _id: "item004",
              name: "Tomato",
              priceAdjustment: 0,
              isDefault: true,
            },
            {
              _id: "item005",
              name: "Lettuce",
              priceAdjustment: 0,
              isDefault: true,
            },
            {
              _id: "item006",
              name: "Onion",
              priceAdjustment: 0,
              isDefault: false,
            },
            {
              _id: "item007",
              name: "Hot Pepper",
              priceAdjustment: 0.5,
              isDefault: false,
            },
            {
              _id: "item008",
              name: "Avocado",
              priceAdjustment: 1.0,
              isDefault: false,
            },
          ],
        },
        {
          groupId: "opt003",
          groupName: "Sauce",
          required: true,
          multipleSelection: true,
          minSelections: 1,
          maxSelections: 2,
          items: [
            {
              _id: "item009",
              name: "Hot Sauce",
              priceAdjustment: 0,
              isDefault: false,
            },
            {
              _id: "item010",
              name: "Ranch Sauce",
              priceAdjustment: 0,
              isDefault: true,
            },
            {
              _id: "item011",
              name: "Garlic Sauce",
              priceAdjustment: 0,
              isDefault: false,
            },
          ],
        },
      ],
      hasAddons: false,
      hasVariants: false,
      isAvailable: true,
      tags: [],
      allergens: ["Wheat", "Dairy"],
    },

    // Product with options and addons
    {
      _id: "prod005",
      categoryId: "cat002",
      name: "Beef Burger",
      description: "Charcoal-grilled beef burger",
      image: "/images/hero-right1.png",
      price: 8.99,
      hasOptions: true,
      options: [
        {
          groupId: "opt004",
          groupName: "Cooking Level",
          required: true,
          multipleSelection: false,
          minSelections: 1,
          maxSelections: 1,
          items: [
            {
              _id: "item012",
              name: "Medium",
              priceAdjustment: 0,
              isDefault: true,
            },
            {
              _id: "item013",
              name: "Medium Well",
              priceAdjustment: 0,
              isDefault: false,
            },
            {
              _id: "item014",
              name: "Well Done",
              priceAdjustment: 0,
              isDefault: false,
            },
          ],
        },
      ],
      hasAddons: true,
      addons: [
        {
          groupId: "add001",
          groupName: "Add-ons",
          required: false,
          multipleSelection: true,
          minSelections: 0,
          maxSelections: 5,
          items: [
            {
              _id: "addon001",
              name: "Extra Cheese",
              priceAdjustment: 1.0,
              isDefault: false,
            },
            {
              _id: "addon002",
              name: "Bacon",
              priceAdjustment: 2.0,
              isDefault: false,
            },
            {
              _id: "addon003",
              name: "Fried Egg",
              priceAdjustment: 1.5,
              isDefault: false,
            },
            {
              _id: "addon004",
              name: "Avocado",
              priceAdjustment: 1.5,
              isDefault: false,
            },
            {
              _id: "addon005",
              name: "Sautéed Mushrooms",
              priceAdjustment: 1.0,
              isDefault: false,
            },
          ],
        },
      ],
      hasVariants: false,
      isAvailable: true,
      tags: ["Popular"],
      allergens: ["Wheat", "Dairy"],
    },

    // Pizza with different sizes and addons
    {
      _id: "prod006",
      categoryId: "cat003",
      name: "Margherita Pizza",
      description: "Classic pizza with tomato sauce and mozzarella cheese",
      image: "/images/hero-right1.png",
      price: 0,
      hasOptions: false,
      hasAddons: true,
      addons: [
        {
          groupId: "add002",
          groupName: "Pizza Toppings",
          required: false,
          multipleSelection: true,
          minSelections: 0,
          maxSelections: 10,
          items: [
            {
              _id: "addon006",
              name: "Bell Pepper",
              priceAdjustment: 1.0,
              isDefault: false,
            },
            {
              _id: "addon007",
              name: "Olives",
              priceAdjustment: 1.0,
              isDefault: false,
            },
            {
              _id: "addon008",
              name: "Mushrooms",
              priceAdjustment: 1.0,
              isDefault: false,
            },
            {
              _id: "addon009",
              name: "Onion",
              priceAdjustment: 0.75,
              isDefault: false,
            },
            {
              _id: "addon010",
              name: "Pepperoni",
              priceAdjustment: 2.0,
              isDefault: false,
            },
            {
              _id: "addon011",
              name: "Chicken",
              priceAdjustment: 2.0,
              isDefault: false,
            },
            {
              _id: "addon012",
              name: "Extra Cheese",
              priceAdjustment: 1.5,
              isDefault: false,
            },
          ],
        },
      ],
      hasVariants: true,
      variants: [
        {
          _id: "var004",
          name: "Small (8 inch)",
          price: 9.99,
          isDefault: false,
        },
        {
          _id: "var005",
          name: "Medium (12 inch)",
          price: 14.99,
          isDefault: true,
        },
        {
          _id: "var006",
          name: "Large (16 inch)",
          price: 18.99,
          isDefault: false,
        },
        {
          _id: "var007",
          name: "Family (20 inch)",
          price: 22.99,
          isDefault: false,
        },
      ],
      isAvailable: true,
      tags: ["Italian", "Vegetarian"],
      allergens: ["Wheat", "Dairy"],
    },

    // Main courses with side dish options
    {
      _id: "prod007",
      categoryId: "cat005",
      name: "Grilled Steak",
      description: "Grilled beef steak with mushroom sauce",
      image: "/images/hero-right1.png",
      price: 24.99,
      hasOptions: true,
      options: [
        {
          groupId: "opt005",
          groupName: "Cooking Level",
          required: true,
          multipleSelection: false,
          minSelections: 1,
          maxSelections: 1,
          items: [
            {
              _id: "item015",
              name: "Rare",
              priceAdjustment: 0,
              isDefault: false,
            },
            {
              _id: "item016",
              name: "Medium Rare",
              priceAdjustment: 0,
              isDefault: true,
            },
            {
              _id: "item017",
              name: "Medium",
              priceAdjustment: 0,
              isDefault: false,
            },
            {
              _id: "item018",
              name: "Medium Well",
              priceAdjustment: 0,
              isDefault: false,
            },
            {
              _id: "item019",
              name: "Well Done",
              priceAdjustment: 0,
              isDefault: false,
            },
          ],
        },
        {
          groupId: "opt006",
          groupName: "Side Dish",
          required: true,
          multipleSelection: false,
          minSelections: 1,
          maxSelections: 1,
          items: [
            {
              _id: "item020",
              name: "French Fries",
              priceAdjustment: 0,
              isDefault: true,
            },
            {
              _id: "item021",
              name: "Mashed Potatoes",
              priceAdjustment: 0,
              isDefault: false,
            },
            {
              _id: "item022",
              name: "Saffron Rice",
              priceAdjustment: 0,
              isDefault: false,
            },
            {
              _id: "item023",
              name: "Grilled Vegetables",
              priceAdjustment: 0,
              isDefault: false,
            },
          ],
        },
        {
          groupId: "opt007",
          groupName: "Sauce",
          required: false,
          multipleSelection: false,
          minSelections: 0,
          maxSelections: 1,
          items: [
            {
              _id: "item024",
              name: "Mushroom Sauce",
              priceAdjustment: 0,
              isDefault: true,
            },
            {
              _id: "item025",
              name: "Pepper Sauce",
              priceAdjustment: 0,
              isDefault: false,
            },
            {
              _id: "item026",
              name: "Garlic Sauce",
              priceAdjustment: 0,
              isDefault: false,
            },
            {
              _id: "item027",
              name: "No Sauce",
              priceAdjustment: 0,
              isDefault: false,
            },
          ],
        },
      ],
      hasAddons: false,
      hasVariants: false,
      isAvailable: true,
      tags: ["Meat"],
      allergens: ["Dairy"],
    },

    // Drinks with different sizes
    {
      _id: "prod008",
      categoryId: "cat006",
      name: "Coca Cola",
      description: "Refreshing soft drink",
      image: "/images/hero-right1.png",
      price: 0,
      hasOptions: false,
      hasAddons: false,
      hasVariants: true,
      variants: [
        {
          _id: "var008",
          name: "Small (250ml)",
          price: 1.99,
          isDefault: false,
        },
        {
          _id: "var009",
          name: "Medium (400ml)",
          price: 2.49,
          isDefault: true,
        },
        {
          _id: "var010",
          name: "Large (600ml)",
          price: 2.99,
          isDefault: false,
        },
      ],
      isAvailable: true,
      tags: ["Cold Drink"],
      allergens: [],
    },

    // Hot drink with options
    {
      _id: "prod009",
      categoryId: "cat006",
      name: "Latte Coffee",
      description: "Espresso coffee with steamed milk",
      image: "/images/hero-right1.png",
      price: 3.99,
      hasOptions: true,
      options: [
        {
          groupId: "opt008",
          groupName: "Milk Type",
          required: true,
          multipleSelection: false,
          minSelections: 1,
          maxSelections: 1,
          items: [
            {
              _id: "item028",
              name: "Whole Milk",
              priceAdjustment: 0,
              isDefault: true,
            },
            {
              _id: "item029",
              name: "Low Fat Milk",
              priceAdjustment: 0,
              isDefault: false,
            },
            {
              _id: "item030",
              name: "Almond Milk",
              priceAdjustment: 0.75,
              isDefault: false,
            },
            {
              _id: "item031",
              name: "Soy Milk",
              priceAdjustment: 0.75,
              isDefault: false,
            },
            {
              _id: "item032",
              name: "Coconut Milk",
              priceAdjustment: 0.75,
              isDefault: false,
            },
          ],
        },
        {
          groupId: "opt009",
          groupName: "Flavor",
          required: false,
          multipleSelection: false,
          minSelections: 0,
          maxSelections: 1,
          items: [
            {
              _id: "item033",
              name: "Vanilla",
              priceAdjustment: 0.5,
              isDefault: false,
            },
            {
              _id: "item034",
              name: "Caramel",
              priceAdjustment: 0.5,
              isDefault: false,
            },
            {
              _id: "item035",
              name: "Hazelnut",
              priceAdjustment: 0.5,
              isDefault: false,
            },
            {
              _id: "item036",
              name: "No Flavor",
              priceAdjustment: 0,
              isDefault: true,
            },
          ],
        },
      ],
      hasAddons: true,
      addons: [
        {
          groupId: "add003",
          groupName: "Add-ons",
          required: false,
          multipleSelection: true,
          minSelections: 0,
          maxSelections: 3,
          items: [
            {
              _id: "addon013",
              name: "Extra Shot",
              priceAdjustment: 0.5,
              isDefault: false,
            },
            {
              _id: "addon014",
              name: "Whipped Cream",
              priceAdjustment: 0.75,
              isDefault: false,
            },
            {
              _id: "addon015",
              name: "Cinnamon Sprinkle",
              priceAdjustment: 0,
              isDefault: false,
            },
          ],
        },
      ],
      hasVariants: false,
      isAvailable: true,
      tags: ["Hot Drink"],
      allergens: ["Dairy"],
    },

    // Simple desserts
    {
      _id: "prod010",
      categoryId: "cat007",
      name: "Cheesecake",
      description: "Baked cheesecake with strawberry sauce",
      image: "/images/hero-right1.png",
      price: 5.99,
      hasOptions: false,
      hasAddons: false,
      hasVariants: false,
      isAvailable: true,
      tags: ["Dessert"],
      allergens: ["Wheat", "Dairy", "Eggs"],
    },

    // Complete meal (Combo)
    {
      _id: "prod011",
      categoryId: "cat008",
      name: "Burger Meal",
      description: "Beef burger + fries + soft drink",
      image: "/images/hero-right1.png",
      price: 12.99,
      hasOptions: true,
      options: [
        {
          groupId: "opt010",
          groupName: "Burger Type",
          required: true,
          multipleSelection: false,
          minSelections: 1,
          maxSelections: 1,
          items: [
            {
              _id: "item037",
              name: "Classic Beef Burger",
              priceAdjustment: 0,
              isDefault: true,
            },
            {
              _id: "item038",
              name: "Chicken Burger",
              priceAdjustment: 0,
              isDefault: false,
            },
            {
              _id: "item039",
              name: "Beef Burger with Cheese",
              priceAdjustment: 1.0,
              isDefault: false,
            },
          ],
        },
        {
          groupId: "opt011",
          groupName: "Fries Size",
          required: true,
          multipleSelection: false,
          minSelections: 1,
          maxSelections: 1,
          items: [
            {
              _id: "item040",
              name: "Small",
              priceAdjustment: 0,
              isDefault: false,
            },
            {
              _id: "item041",
              name: "Medium",
              priceAdjustment: 0,
              isDefault: true,
            },
            {
              _id: "item042",
              name: "Large",
              priceAdjustment: 1.0,
              isDefault: false,
            },
          ],
        },
        {
          groupId: "opt012",
          groupName: "Drink",
          required: true,
          multipleSelection: false,
          minSelections: 1,
          maxSelections: 1,
          items: [
            {
              _id: "item043",
              name: "Coca Cola",
              priceAdjustment: 0,
              isDefault: true,
            },
            {
              _id: "item044",
              name: "Sprite",
              priceAdjustment: 0,
              isDefault: false,
            },
            {
              _id: "item045",
              name: "Fanta",
              priceAdjustment: 0,
              isDefault: false,
            },
            {
              _id: "item046",
              name: "Orange Juice",
              priceAdjustment: 1.0,
              isDefault: false,
            },
          ],
        },
      ],
      hasAddons: true,
      addons: [
        {
          groupId: "add004",
          groupName: "Meal Add-ons",
          required: false,
          multipleSelection: true,
          minSelections: 0,
          maxSelections: 3,
          items: [
            {
              _id: "addon016",
              name: "Extra Sauce",
              priceAdjustment: 0.5,
              isDefault: false,
            },
            {
              _id: "addon017",
              name: "Upgrade to Seasoned Fries",
              priceAdjustment: 1.5,
              isDefault: false,
            },
            {
              _id: "addon018",
              name: "Onion Rings",
              priceAdjustment: 2.5,
              isDefault: false,
            },
          ],
        },
      ],
      hasVariants: false,
      isAvailable: true,
      tags: ["Complete Meal"],
      allergens: ["Wheat", "Dairy"],
    },

    // Family meal (for sharing)
    {
      _id: "prod012",
      categoryId: "cat008",
      name: "Family Meal",
      description:
        "Complete meal for 4 people - includes 4 burgers + 2 family fries + 4 drinks",
      image: "/images/hero-right1.png",
      price: 39.99,
      hasOptions: true,
      options: [
        {
          groupId: "opt013",
          groupName: "Burger Types",
          required: true,
          multipleSelection: true,
          minSelections: 4,
          maxSelections: 4,
          items: [
            {
              _id: "item047",
              name: "Classic Beef Burger",
              priceAdjustment: 0,
              isDefault: true,
            },
            {
              _id: "item048",
              name: "Chicken Burger",
              priceAdjustment: 0,
              isDefault: false,
            },
            {
              _id: "item049",
              name: "Beef Burger with Cheese",
              priceAdjustment: 1.0,
              isDefault: false,
            },
            {
              _id: "item050",
              name: "Mushroom & Cheese Burger",
              priceAdjustment: 1.0,
              isDefault: false,
            },
          ],
        },
        {
          groupId: "opt014",
          groupName: "Drinks",
          required: true,
          multipleSelection: true,
          minSelections: 4,
          maxSelections: 4,
          items: [
            {
              _id: "item051",
              name: "Coca Cola",
              priceAdjustment: 0,
              isDefault: true,
            },
            {
              _id: "item052",
              name: "Sprite",
              priceAdjustment: 0,
              isDefault: false,
            },
            {
              _id: "item053",
              name: "Fanta",
              priceAdjustment: 0,
              isDefault: false,
            },
            {
              _id: "item054",
              name: "Orange Juice",
              priceAdjustment: 1.0,
              isDefault: false,
            },
          ],
        },
      ],
      hasAddons: true,
      addons: [
        {
          groupId: "add005",
          groupName: "Extra Add-ons",
          required: false,
          multipleSelection: true,
          minSelections: 0,
          maxSelections: 5,
          items: [
            {
              _id: "addon019",
              name: "Extra Onion Rings",
              priceAdjustment: 3.99,
              isDefault: false,
            },
            {
              _id: "addon020",
              name: "Coleslaw Salad",
              priceAdjustment: 2.99,
              isDefault: false,
            },
            {
              _id: "addon021",
              name: "Family Green Salad",
              priceAdjustment: 4.99,
              isDefault: false,
            },
            {
              _id: "addon022",
              name: "Garlic Bread",
              priceAdjustment: 3.99,
              isDefault: false,
            },
            {
              _id: "addon023",
              name: "Extra Sauce (4 pieces)",
              priceAdjustment: 1.99,
              isDefault: false,
            },
          ],
        },
      ],
      hasVariants: false,
      isAvailable: true,
      tags: ["Family Meal", "Sharing"],
      allergens: ["Wheat", "Dairy"],
    },
  ],
  promotions: [
    {
      _id: "promo001",
      name: "15% off orders over $30",
      description: "Get 15% discount when you order $30 or more",
      discountType: "percentage",
      discountValue: 15,
      minimumOrderValue: 30.0,
      isActive: true,
    },
    {
      _id: "promo002",
      name: "2 for 1 Pizza every Tuesday",
      description: "Buy one pizza, get the second free every Tuesday",
      discountType: "bogo",
      discountValue: 100,
      isActive: true,
      daysAvailable: [2],
    },
  ],
};

interface CartItem {
  productId: string;
  name: string;
  basePrice: number;
  quantity: number;
  selectedVariant?: any;
  selectedOptions: any[];
  selectedAddons: any[];
  totalPrice: number;
  image?: string;
}

export default function menu() {
  // State Management
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [productQuantity, setProductQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedOptions, setSelectedOptions] = useState<any>({});
  const [selectedAddons, setSelectedAddons] = useState<any>({});

  // Filter products by category and search
  const filteredProducts = useMemo(() => {
    let filtered = menuData.products;

    if (selectedCategory) {
      filtered = filtered.filter((p: any) => p.categoryId === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter((p: any) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [selectedCategory, searchQuery]);

  // Calculate product price with selections
  const calculatePrice = () => {
    let price = selectedProduct?.price || 0;

    // Variant price
    if (selectedVariant) {
      price = selectedVariant.price;
    }

    // Options price adjustments
    Object.values(selectedOptions).forEach((option: any) => {
      if (Array.isArray(option)) {
        option.forEach((opt: any) => {
          price += opt.priceAdjustment || 0;
        });
      } else if (option) {
        price += option.priceAdjustment || 0;
      }
    });

    // Addons price adjustments
    Object.values(selectedAddons).forEach((addon: any) => {
      if (Array.isArray(addon)) {
        addon.forEach((add: any) => {
          price += add.priceAdjustment || 0;
        });
      } else if (addon) {
        price += addon.priceAdjustment || 0;
      }
    });

    return price * productQuantity;
  };

  // Open product modal
  const openProductModal = (product: any) => {
    setSelectedProduct(product);
    setProductQuantity(1);
    setSelectedOptions({});
    setSelectedAddons({});

    // Set default variant
    if (product.hasVariants) {
      const defaultVariant = product.variants.find((v: any) => v.isDefault);
      setSelectedVariant(defaultVariant || product.variants[0]);
    } else {
      setSelectedVariant(null);
    }

    // Set default options
    if (product.hasOptions) {
      const defaults: any = {};
      product.options.forEach((optGroup: any) => {
        const defaultItems = optGroup.items.filter(
          (item: any) => item.isDefault
        );
        if (optGroup.multipleSelection) {
          defaults[optGroup.groupId] = defaultItems;
        } else {
          defaults[optGroup.groupId] = defaultItems[0] || null;
        }
      });
      setSelectedOptions(defaults);
    }

    // Set default addons
    if (product.hasAddons) {
      const defaults: any = {};
      product.addons.forEach((addonGroup: any) => {
        const defaultItems = addonGroup.items.filter(
          (item: any) => item.isDefault
        );
        if (addonGroup.multipleSelection) {
          defaults[addonGroup.groupId] = defaultItems;
        } else {
          defaults[addonGroup.groupId] = defaultItems[0] || null;
        }
      });
      setSelectedAddons(defaults);
    }
  };

  // Close product modal
  const closeProductModal = () => {
    setSelectedProduct(null);
    setProductQuantity(1);
    setSelectedVariant(null);
    setSelectedOptions({});
    setSelectedAddons({});
  };

  // Add to cart
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

  // Calculate cart total
  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.totalPrice, 0);
  }, [cart]);

  // Handle option selection
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

  // Handle addon selection
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

  // Check if option is selected
  const isOptionSelected = (groupId: string, itemId: string) => {
    const selected = selectedOptions[groupId];
    if (Array.isArray(selected)) {
      return selected.some((i: any) => i._id === itemId);
    }
    return selected?._id === itemId;
  };

  // Check if addon is selected
  const isAddonSelected = (groupId: string, itemId: string) => {
    const selected = selectedAddons[groupId];
    if (Array.isArray(selected)) {
      return selected.some((i: any) => i._id === itemId);
    }
    return selected?._id === itemId;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Restaurant Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-black/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Restaurant Info */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {menuData.restaurant.logo && (
                <img
                  src={menuData.restaurant.logo}
                  alt={menuData.restaurant.name}
                  className="w-16 h-16 rounded-full p-2 border-2 border-[#FFCE18]"
                />
              )}
              <div>
                <h1 className="text-2xl font-black text-white">
                  {menuData.restaurant.name || "Restaurant Name"}
                </h1>
                <p className="text-sm text-gray-400">
                  {menuData.restaurant.description || "Delicious food"}
                </p>
                {menuData.restaurant.isOpen && (
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
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus: border-[#FFCE18] focus:outline-none transition-all"
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
            {menuData.categories.map((category: any) => (
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
          <div className="grid grid-cols-1 md: grid-cols-2 lg: grid-cols-3 gap-6">
            {filteredProducts.map((product: any) => (
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
                      <div className="absolute top-2 right-2 flex gap-2">
                        {product.tags.map((tag: string, idx: number) => (
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
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 h-7">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2 h-10">
                    {product.description}
                  </p>

                  {/* Price */}
                  <div className="flex items-center justify-between">
                    <div>
                      {product.hasVariants ? (
                        <div className="text-[#FFCE18] font-black text-xl">
                          From ${product.variants[0]?.price.toFixed(2)}
                        </div>
                      ) : (
                        <div className="text-[#FFCE18] font-black text-xl">
                          ${product.price.toFixed(2)}
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
              <p className="text-gray-400 mb-6">
                {selectedProduct.description}
              </p>

              {/* Variants */}
              {selectedProduct.hasVariants && (
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
                          ${variant.price.toFixed(2)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Options */}
              {selectedProduct.hasOptions &&
                selectedProduct.options.map((optGroup: any) => (
                  <div key={optGroup.groupId} className="mb-6">
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
                          optGroup.groupId,
                          item._id
                        );
                        return (
                          <button
                            key={item._id}
                            onClick={() =>
                              handleOptionSelect(
                                optGroup.groupId,
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
                                +${item.priceAdjustment.toFixed(2)}
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
                selectedProduct.addons.map((addonGroup: any) => (
                  <div key={addonGroup.groupId} className="mb-6">
                    <h3 className="text-lg font-bold text-white mb-3">
                      {addonGroup.groupName}
                      {addonGroup.required && (
                        <span className="text-red-500">*</span>
                      )}
                    </h3>
                    <div className="space-y-2">
                      {addonGroup.items.map((item: any) => {
                        const isSelected = isAddonSelected(
                          addonGroup.groupId,
                          item._id
                        );
                        return (
                          <button
                            key={item._id}
                            onClick={() =>
                              handleAddonSelect(
                                addonGroup.groupId,
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
                                +${item.priceAdjustment.toFixed(2)}
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
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#FFCE18] to-[#ffd94d] text-black font-bold text-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between px-6"
              >
                <span>Add to Cart</span>
                <span>${calculatePrice().toFixed(2)}</span>
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
                            ${item.totalPrice.toFixed(2)}
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
                        ${cartTotal.toFixed(2)}
                      </span>
                    </div>
                    <button className="w-full py-4 rounded-xl bg-gradient-to-r from-[#FFCE18] to-[#ffd94d] text-black font-bold text-lg hover:scale-105 transition-all flex items-center justify-center gap-2">
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
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        .animate-slide-in-right {
          animation:  slide-in-right 0.3s ease-out;
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
