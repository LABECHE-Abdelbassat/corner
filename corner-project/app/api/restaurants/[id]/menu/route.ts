// src/app/api/restaurants/[id]/menu/route.ts

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
} from "@/lib/api-response";
import { getCurrentUser } from "@/lib/auth";
import { menuSchema } from "@/lib/validators";
import { validationErrorResponse } from "@/lib/api-response";

// ==================== GET /api/restaurants/[id]/menu ====================
// Get restaurant menu (public endpoint) - accepts slug or id
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Try to find restaurant by slug first, then by id
    let restaurant = await prisma.restaurant.findUnique({
      where: { slug: id },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        description: true,
        address: true,
        phone: true,
        openingHours: true,
        currency: true,
        status: true,
        lat: true,
        lng: true,
      },
    });

    // If not found by slug, try by id
    if (!restaurant) {
      restaurant = await prisma.restaurant.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
          description: true,
          address: true,
          phone: true,
          openingHours: true,
          currency: true,
          status: true,
          lat: true,
          lng: true,
        },
      });
    }

    if (!restaurant) {
      return notFoundResponse("Restaurant not found");
    }

    // Get categories with products
    const categories = await prisma.category.findMany({
      where: { restaurantId: restaurant.id },
      select: {
        id: true,
        name: true,
        description: true,
        image: true,
        order: true,
      },
      orderBy: { order: "asc" },
    });

    // Get products with all details (only available products for public menu)
    const products = await prisma.product.findMany({
      where: {
        restaurantId: restaurant.id,
        isAvailable: true, // Only show available products
      },
      select: {
        id: true,
        categoryId: true,
        name: true,
        description: true,
        image: true,
        price: true,
        isAvailable: true,
        hasVariants: true,
        hasOptions: true,
        hasAddons: true,
        tags: true,
        allergens: true,
        variants: {
          select: {
            id: true,
            name: true,
            price: true,
            isDefault: true,
            order: true,
          },
          orderBy: { order: "asc" },
        },
        optionGroups: {
          select: {
            id: true,
            groupName: true,
            required: true,
            multipleSelection: true,
            minSelections: true,
            maxSelections: true,
            order: true,
            items: {
              select: {
                id: true,
                name: true,
                priceAdjustment: true,
                isDefault: true,
                order: true,
              },
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
        addonGroups: {
          select: {
            id: true,
            groupName: true,
            required: true,
            multipleSelection: true,
            minSelections: true,
            maxSelections: true,
            order: true,
            items: {
              select: {
                id: true,
                name: true,
                priceAdjustment: true,
                order: true,
              },
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });

    // Get active promotions
    const promotions = await prisma.promotion.findMany({
      where: {
        restaurantId: restaurant.id,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        discountType: true,
        discountValue: true,
        minimumOrderValue: true,
        isActive: true,
        daysAvailable: true,
        startDate: true,
        endDate: true,
      },
    });

    // Format response to match expected structure
    const menuData = {
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        slug: restaurant.slug,
        logo: restaurant.logo,
        description: restaurant.description,
        address: restaurant.address,
        phone: restaurant.phone,
        openingHours: restaurant.openingHours,
        currency: restaurant.currency,
        status: restaurant.status,
        lat: restaurant.lat,
        lng: restaurant.lng,
      },
      categories: categories.map((cat) => ({
        _id: cat.id,
        name: cat.name,
        description: cat.description,
        image: cat.image,
        order: cat.order,
      })),
      products: products.map((prod) => ({
        _id: prod.id,
        categoryId: prod.categoryId,
        name: prod.name,
        description: prod.description,
        image: prod.image,
        price: prod.price,
        isAvailable: prod.isAvailable,
        hasVariants: prod.hasVariants,
        hasOptions: prod.hasOptions,
        hasAddons: prod.hasAddons,
        tags: prod.tags,
        allergens: prod.allergens,
        variants: prod.variants.map((v) => ({
          _id: v.id,
          name: v.name,
          price: v.price,
          isDefault: v.isDefault,
          order: v.order,
        })),
        optionGroups: prod.optionGroups.map((og) => ({
          _id: og.id,
          groupName: og.groupName,
          required: og.required,
          multipleSelection: og.multipleSelection,
          minSelections: og.minSelections,
          maxSelections: og.maxSelections,
          order: og.order,
          items: og.items.map((item) => ({
            _id: item.id,
            name: item.name,
            priceAdjustment: item.priceAdjustment,
            isDefault: item.isDefault,
            order: item.order,
          })),
        })),
        addonGroups: prod.addonGroups.map((ag) => ({
          _id: ag.id,
          groupName: ag.groupName,
          required: ag.required,
          multipleSelection: ag.multipleSelection,
          minSelections: ag.minSelections,
          maxSelections: ag.maxSelections,
          order: ag.order,
          items: ag.items.map((item) => ({
            _id: item.id,
            name: item.name,
            priceAdjustment: item.priceAdjustment,
            order: item.order,
          })),
        })),
      })),
      promotions: promotions.map((promo) => ({
        _id: promo.id,
        name: promo.name,
        description: promo.description,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
        minimumOrderValue: promo.minimumOrderValue,
        isActive: promo.isActive,
        daysAvailable: promo.daysAvailable,
        startDate: promo.startDate,
        endDate: promo.endDate,
      })),
    };

    return successResponse(menuData);
  } catch (error) {
    console.error("❌ Get menu error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// ==================== PUT /api/restaurants/[id]/menu ====================
// Update restaurant menu (Owner only) - accepts slug or id
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return errorResponse("Unauthorized", 401);
    }

    // Try to find restaurant by slug first, then by id
    let restaurant = await prisma.restaurant.findUnique({
      where: { slug: id },
    });

    if (!restaurant) {
      restaurant = await prisma.restaurant.findUnique({
        where: { id },
      });
    }

    if (!restaurant) {
      return notFoundResponse("Restaurant not found");
    }

    // Check if user is owner of this restaurant or super admin
    if (currentUser.role !== "SUPER_ADMIN") {
      if (
        currentUser.role !== "OWNER" ||
        currentUser.restaurantId !== restaurant.id
      ) {
        return errorResponse(
          "Forbidden:  You can only edit your own restaurant menu",
          403
        );
      }
    }

    // Parse and validate menu data
    const body = await request.json();
    const validation = menuSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten().fieldErrors);
    }

    const menuData = validation.data;

    // Use transaction to update menu atomically
    await prisma.$transaction(async (tx) => {
      // Delete existing menu data
      await tx.addonItem.deleteMany({
        where: {
          addonGroup: {
            product: {
              restaurantId: restaurant.id,
            },
          },
        },
      });

      await tx.optionItem.deleteMany({
        where: {
          optionGroup: {
            product: {
              restaurantId: restaurant.id,
            },
          },
        },
      });

      await tx.addonGroup.deleteMany({
        where: {
          product: {
            restaurantId: restaurant.id,
          },
        },
      });

      await tx.optionGroup.deleteMany({
        where: {
          product: {
            restaurantId: restaurant.id,
          },
        },
      });

      await tx.variant.deleteMany({
        where: {
          product: {
            restaurantId: restaurant.id,
          },
        },
      });

      await tx.product.deleteMany({
        where: { restaurantId: restaurant.id },
      });

      await tx.category.deleteMany({
        where: { restaurantId: restaurant.id },
      });

      await tx.promotion.deleteMany({
        where: { restaurantId: restaurant.id },
      });

      // Update restaurant info
      await tx.restaurant.update({
        where: { id: restaurant.id },
        data: {
          name: menuData.restaurant.name,
          currency: menuData.restaurant.currency,
          description: menuData.restaurant.description,
        },
      });

      // Create categories
      for (const category of menuData.categories) {
        await tx.category.create({
          data: {
            id: category._id,
            restaurantId: restaurant.id,
            name: category.name,
            description: category.description,
            image: category.image,
            order: category.order,
          },
        });
      }

      // Create products
      for (const product of menuData.products) {
        await tx.product.create({
          data: {
            id: product._id,
            restaurantId: restaurant.id,
            categoryId: product.categoryId,
            name: product.name,
            description: product.description,
            image: product.image,
            price: product.price,
            isAvailable: product.isAvailable,
            hasVariants: product.hasVariants,
            hasOptions: product.hasOptions,
            hasAddons: product.hasAddons,
            tags: product.tags,
            allergens: product.allergens,
            searchText: `${product.name} ${
              product.description || ""
            } ${product.tags.join(" ")}`,
          },
        });

        // Create variants
        for (const variant of product.variants) {
          await tx.variant.create({
            data: {
              id: variant._id,
              productId: product._id,
              name: variant.name,
              price: variant.price,
              isDefault: variant.isDefault,
              order: variant.order,
            },
          });
        }

        // Create option groups
        for (const optionGroup of product.optionGroups) {
          await tx.optionGroup.create({
            data: {
              id: optionGroup._id,
              productId: product._id,
              groupName: optionGroup.groupName,
              required: optionGroup.required,
              multipleSelection: optionGroup.multipleSelection,
              minSelections: optionGroup.minSelections,
              maxSelections: optionGroup.maxSelections,
              order: optionGroup.order,
            },
          });

          // Create option items
          for (const item of optionGroup.items) {
            await tx.optionItem.create({
              data: {
                id: item._id,
                optionGroupId: optionGroup._id,
                name: item.name,
                priceAdjustment: item.priceAdjustment,
                isDefault: item.isDefault || false,
                order: item.order,
              },
            });
          }
        }

        // Create addon groups
        for (const addonGroup of product.addonGroups) {
          await tx.addonGroup.create({
            data: {
              id: addonGroup._id,
              productId: product._id,
              groupName: addonGroup.groupName,
              required: addonGroup.required,
              multipleSelection: addonGroup.multipleSelection,
              minSelections: addonGroup.minSelections,
              maxSelections: addonGroup.maxSelections,
              order: addonGroup.order,
            },
          });

          // Create addon items
          for (const item of addonGroup.items) {
            await tx.addonItem.create({
              data: {
                id: item._id,
                addonGroupId: addonGroup._id,
                name: item.name,
                priceAdjustment: item.priceAdjustment,
                order: item.order,
              },
            });
          }
        }
      }

      // Create promotions
      for (const promotion of menuData.promotions) {
        await tx.promotion.create({
          data: {
            id: promotion._id,
            restaurantId: restaurant.id,
            name: promotion.name,
            description: promotion.description,
            discountType: promotion.discountType,
            discountValue: promotion.discountValue,
            minimumOrderValue: promotion.minimumOrderValue,
            isActive: promotion.isActive,
            daysAvailable: promotion.daysAvailable,
            startDate: promotion.startDate
              ? new Date(promotion.startDate)
              : null,
            endDate: promotion.endDate ? new Date(promotion.endDate) : null,
          },
        });
      }

      // Log activity
      await tx.activity.create({
        data: {
          type: "MENU_UPDATED",
          description: `Menu updated for ${restaurant.name}`,
          userId: currentUser.id,
          restaurantId: restaurant.id,
          metadata: {
            categoriesCount: menuData.categories.length,
            productsCount: menuData.products.length,
            promotionsCount: menuData.promotions.length,
          },
        },
      });
    });

    return successResponse({
      message: "Menu updated successfully",
      stats: {
        categories: menuData.categories.length,
        products: menuData.products.length,
        promotions: menuData.promotions.length,
      },
    });
  } catch (error: any) {
    console.error("❌ Update menu error:", error);

    if (
      error.message === "Unauthorized" ||
      error.message.includes("Forbidden")
    ) {
      return errorResponse(error.message, 403);
    }

    return errorResponse("Internal server error", 500);
  }
}
