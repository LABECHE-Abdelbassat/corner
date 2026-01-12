// lib/validators.ts

import { z } from "zod";

// ==================== AUTH ====================
export const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const createUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(50),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  role: z.enum(["SUPER_ADMIN", "MANAGER", "OWNER"], {
    message: "Role must be SUPER_ADMIN, MANAGER, or OWNER",
  }),
  restaurantId: z.string().optional(),
  wilayaId: z.string().optional(),
});

export const updateUserSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  email: z.string().email().optional().or(z.literal("")),
  role: z.enum(["SUPER_ADMIN", "MANAGER", "OWNER"]).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  restaurantId: z.string().optional().nullable(),
  wilayaId: z.string().optional().nullable(),
});

export const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100),
});

// ==================== RESTAURANT ====================
export const createRestaurantSchema = z.object({
  name: z.string().min(3),
  wilayaId: z.string(),
  address: z.string().optional(),
  phone: z.string().optional(),
  description: z.string().optional(),
  openingHours: z.string().optional(),
  logo: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  currency: z.string().default("DZD"),
  package: z.enum(["BASIC", "PRO", "PREMIUM"]).default("BASIC"),
  ownerName: z.string().min(3),
  ownerEmail: z.string().email().optional(),
});

export const updateRestaurantSchema = z.object({
  name: z.string().min(3).optional(),
  wilayaId: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  description: z.string().optional(),
  openingHours: z.string().optional(),
  logo: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  currency: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  package: z.enum(["BASIC", "PRO", "PREMIUM"]).optional(),
});

// ==================== WILAYA ====================
export const createWilayaSchema = z.object({
  name: z.string().min(3),
  code: z.string().min(1),
  lat: z.number(),
  lng: z.number(),
  gradient: z.string().default("from-blue-500 to-cyan-500"),
  managerId: z.string().optional(),
});

export const updateWilayaSchema = z.object({
  name: z.string().min(3).optional(),
  code: z.string().min(1).optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  gradient: z.string().optional(),
  managerId: z.string().optional(),
});

// ==================== MENU ====================
export const menuItemSchema = z.object({
  _id: z.string(),
  name: z.string().min(1),
  priceAdjustment: z.number().default(0),
  isDefault: z.boolean().optional().default(false),
  order: z.number().default(0),
});

export const variantSchema = z.object({
  _id: z.string(),
  name: z.string().min(1),
  price: z.number().min(0),
  isDefault: z.boolean().default(false),
  order: z.number().default(0),
});

export const optionGroupSchema = z.object({
  _id: z.string(),
  groupName: z.string().min(1),
  required: z.boolean().default(false),
  multipleSelection: z.boolean().default(false),
  minSelections: z.number().default(0),
  maxSelections: z.number().default(1),
  order: z.number().default(0),
  items: z.array(menuItemSchema),
});

export const addonGroupSchema = z.object({
  _id: z.string(),
  groupName: z.string().min(1),
  required: z.boolean().default(false),
  multipleSelection: z.boolean().default(true),
  minSelections: z.number().default(0),
  maxSelections: z.number().default(5),
  order: z.number().default(0),
  items: z.array(menuItemSchema),
});

export const productSchema = z.object({
  _id: z.string(),
  categoryId: z.string(),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  price: z.number().min(0),
  isAvailable: z.boolean().default(true),
  hasVariants: z.boolean().default(false),
  hasOptions: z.boolean().default(false),
  hasAddons: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  allergens: z.array(z.string()).default([]),
  variants: z.array(variantSchema).default([]),
  optionGroups: z.array(optionGroupSchema).default([]),
  addonGroups: z.array(addonGroupSchema).default([]),
});

export const categorySchema = z.object({
  _id: z.string(),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  order: z.number().default(0),
});

export const promotionSchema = z.object({
  _id: z.string(),
  name: z.string().min(1),
  description: z.string(),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.number().min(0),
  minimumOrderValue: z.number().min(0).default(0),
  isActive: z.boolean().default(true),
  daysAvailable: z
    .array(z.number().min(0).max(6))
    .default([0, 1, 2, 3, 4, 5, 6]),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
});

export const menuSchema = z.object({
  restaurant: z.object({
    name: z.string().min(1),
    currency: z.string().default("DZD"),
    description: z.string().optional().nullable(),
  }),
  categories: z.array(categorySchema).default([]),
  products: z.array(productSchema).default([]),
  promotions: z.array(promotionSchema).default([]),
});

// ==================== TRACKING ====================
export const trackEventSchema = z.object({
  eventType: z.enum(["view", "scan", "map_click"]),
  metadata: z.record(z.string(), z.any()).optional(),
});
