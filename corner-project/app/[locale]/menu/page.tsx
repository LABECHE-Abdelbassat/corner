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

import Navbar from "@/components/menu/navbar/Navbar";
import Panner from "@/components/menu/panner/Panner";
import Categories from "@/components/menu/categories/Categories";
import ProductList from "@/components/menu/product/ProductList";
import Location from "@/components/menu/location/Location";
import Footer from "@/components/menu/footer/Footer";

export default function menu() {
  return (
    <div className="menuPage">
      <Navbar />
      <Panner />
      <Categories />
      <ProductList />
      <Location />
      <Footer />
    </div>
  );
}
