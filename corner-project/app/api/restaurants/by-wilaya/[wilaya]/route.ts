// src/app/api/restaurants/by-wilaya/[wilaya]/route.ts

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
} from "@/lib/api-response";

// ==================== GET /api/restaurants/by-wilaya/[wilaya] ====================
// Get restaurants by wilaya (Public endpoint for home page)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ wilaya: string }> }
) {
  try {
    const { wilaya } = await params;

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status") || "ACTIVE"; // Default to active only
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Find wilaya by name or code
    const wilayaRecord = await prisma.wilaya.findFirst({
      where: {
        OR: [
          { name: { equals: wilaya, mode: "insensitive" } },
          { code: wilaya },
        ],
      },
    });

    if (!wilayaRecord) {
      return notFoundResponse("Wilaya not found");
    }

    // Build where clause
    const where: any = {
      wilayaId: wilayaRecord.id,
    };

    // Filter by status (public users should only see ACTIVE)
    if (status === "ACTIVE" || status === "INACTIVE") {
      where.status = status;
    }

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch restaurants
    const [restaurants, total] = await Promise.all([
      prisma.restaurant.findMany({
        where,
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
          lat: true,
          lng: true,
          status: true,
          package: true,
          createdAt: true,
          wilaya: {
            select: {
              id: true,
              name: true,
              code: true,
              lat: true,
              lng: true,
              gradient: true,
            },
          },
          stats: {
            select: {
              totalViews: true,
              totalScans: true,
            },
          },
          _count: {
            select: {
              categories: true,
              products: true,
            },
          },
        },
        orderBy: [{ createdAt: "desc" }, { name: "asc" }],
        skip,
        take: limit,
      }),
      prisma.restaurant.count({ where }),
    ]);

    return successResponse({
      wilaya: {
        id: wilayaRecord.id,
        name: wilayaRecord.name,
        code: wilayaRecord.code,
        lat: wilayaRecord.lat,
        lng: wilayaRecord.lng,
        gradient: wilayaRecord.gradient,
      },
      restaurants,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + restaurants.length < total,
      },
    });
  } catch (error) {
    console.error("❌ Get restaurants by wilaya error:", error);
    return errorResponse("Internal server error", 500);
  }
}
