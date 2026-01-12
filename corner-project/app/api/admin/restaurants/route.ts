// src/app/api/admin/restaurants/route. ts

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireSuperAdmin, hashPassword } from "@/lib/auth";
import { createRestaurantSchema } from "@/lib/validators";
import { generateUniqueSlug } from "@/lib/utils";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
} from "@/lib/api-response";

// ==================== GET /api/admin/restaurants ====================
// List all restaurants with filtering
export async function GET(request: NextRequest) {
  try {
    // Check if user is super admin
    await requireSuperAdmin();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const wilayaId = searchParams.get("wilayaId");
    const status = searchParams.get("status");
    const packageType = searchParams.get("package");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const includeStats = searchParams.get("includeStats") === "true";

    // Build where clause
    const where: any = {};

    if (wilayaId) {
      where.wilayaId = wilayaId;
    }

    if (status && ["ACTIVE", "INACTIVE"].includes(status)) {
      where.status = status;
    }

    if (packageType && ["BASIC", "PRO", "PREMIUM"].includes(packageType)) {
      where.package = packageType;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch restaurants
    const [restaurants, total] = await Promise.all([
      prisma.restaurant.findMany({
        where,
        include: {
          wilaya: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          owner: {
            select: {
              id: true,
              username: true,
              email: true,
              status: true,
            },
          },
          stats: includeStats,
          _count: {
            select: {
              categories: true,
              products: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.restaurant.count({ where }),
    ]);

    return successResponse({
      restaurants,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + restaurants.length < total,
      },
    });
  } catch (error: any) {
    console.error("❌ Get restaurants error:", error);

    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return errorResponse(error.message, 403);
    }

    return errorResponse("Internal server error", 500);
  }
}

// ==================== POST /api/admin/restaurants ====================
// Create restaurant with owner account
export async function POST(request: NextRequest) {
  try {
    // Check if user is super admin
    const currentUser = await requireSuperAdmin();

    const body = await request.json();

    // Validate input
    const validation = createRestaurantSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten().fieldErrors);
    }

    const {
      name,
      wilayaId,
      address,
      phone,
      description,
      openingHours,
      logo,
      lat,
      lng,
      currency,
      package: packageType,
      ownerName,
      ownerEmail,
    } = validation.data;

    // Check if wilaya exists
    const wilaya = await prisma.wilaya.findUnique({
      where: { id: wilayaId },
    });

    if (!wilaya) {
      return errorResponse("Wilaya not found", 404);
    }

    // Generate unique slug
    const slug = await generateUniqueSlug(name, async (slug) => {
      const existing = await prisma.restaurant.findUnique({
        where: { slug },
      });
      return !!existing;
    });

    // Generate owner username from restaurant name
    let ownerUsername = await generateUniqueSlug(name, async () => false);
    ownerUsername = `owner_${ownerUsername}`;

    // Check if owner username exists
    let counter = 1;
    let finalOwnerUsername = ownerUsername;
    while (
      await prisma.user.findUnique({ where: { username: finalOwnerUsername } })
    ) {
      finalOwnerUsername = `${ownerUsername}_${counter}`;
      counter++;
    }

    // Generate random password for owner
    const randomPassword =
      Math.random().toString(36).slice(-8) +
      Math.random().toString(36).slice(-8);
    const hashedPassword = await hashPassword(randomPassword);

    // Create restaurant and owner in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create restaurant first
      const restaurant = await tx.restaurant.create({
        data: {
          name,
          slug,
          wilayaId,
          address: address || null,
          phone: phone || null,
          description: description || null,
          openingHours: openingHours || null,
          logo: logo || null,
          lat: lat || null,
          lng: lng || null,
          currency: currency || "DZD",
          package: packageType || "BASIC",
          status: "ACTIVE",
        },
      });

      // Create owner user
      const owner = await tx.user.create({
        data: {
          username: finalOwnerUsername,
          password: hashedPassword,
          email: ownerEmail || null,
          role: "OWNER",
          status: "ACTIVE",
          restaurantId: restaurant.id,
        },
      });

      // Create restaurant stats
      await tx.restaurantStats.create({
        data: {
          restaurantId: restaurant.id,
          totalViews: 0,
          totalScans: 0,
          totalMapClicks: 0,
          todayViews: 0,
          todayScans: 0,
          todayMapClicks: 0,
          lastResetDate: new Date(),
        },
      });

      // Log activity
      await tx.activity.create({
        data: {
          type: "RESTAURANT_CREATED",
          description: `Restaurant ${name} created in ${wilaya.name}`,
          userId: currentUser.id,
          restaurantId: restaurant.id,
          metadata: {
            restaurantName: name,
            slug,
            wilayaName: wilaya.name,
            ownerUsername: finalOwnerUsername,
          },
        },
      });

      return { restaurant, owner };
    });

    // Fetch complete restaurant data
    const completeRestaurant = await prisma.restaurant.findUnique({
      where: { id: result.restaurant.id },
      include: {
        wilaya: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        owner: {
          select: {
            id: true,
            username: true,
            email: true,
            status: true,
          },
        },
        stats: true,
      },
    });

    return successResponse(
      {
        restaurant: completeRestaurant,
        ownerCredentials: {
          username: finalOwnerUsername,
          password: randomPassword,
          message: "Save these credentials!  Password will not be shown again.",
        },
        message: "Restaurant and owner account created successfully",
      },
      201
    );
  } catch (error: any) {
    console.error("❌ Create restaurant error:", error);

    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return errorResponse(error.message, 403);
    }

    return errorResponse("Internal server error", 500);
  }
}
