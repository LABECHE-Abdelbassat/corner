// src/app/api/admin/wilayas/route. ts

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth";
import { createWilayaSchema } from "@/lib/validators";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
} from "@/lib/api-response";

// ==================== GET /api/admin/wilayas ====================
// List all wilayas with statistics
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const includeStats = searchParams.get("includeStats") === "true";

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
      ];
    }

    // Fetch wilayas
    const wilayas = await prisma.wilaya.findMany({
      where,
      include: {
        manager: {
          select: {
            id: true,
            username: true,
            email: true,
            status: true,
          },
        },
        restaurants: includeStats
          ? {
              select: {
                id: true,
                name: true,
                status: true,
              },
            }
          : false,
        _count: {
          select: {
            restaurants: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    // Add statistics if requested
    const wilayasWithStats = includeStats
      ? wilayas.map((wilaya) => ({
          ...wilaya,
          stats: {
            totalRestaurants: wilaya._count.restaurants,
            activeRestaurants:
              wilaya.restaurants?.filter((r) => r.status === "ACTIVE").length ||
              0,
            inactiveRestaurants:
              wilaya.restaurants?.filter((r) => r.status === "INACTIVE")
                .length || 0,
            hasManager: !!wilaya.manager,
          },
        }))
      : wilayas;

    return successResponse({
      wilayas: wilayasWithStats,
      total: wilayas.length,
    });
  } catch (error: any) {
    console.error("❌ Get wilayas error:", error);

    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return errorResponse(error.message, 403);
    }

    return errorResponse("Internal server error", 500);
  }
}

// ==================== POST /api/admin/wilayas ====================
// Create new wilaya
export async function POST(request: NextRequest) {
  try {
    // Check if user is super admin
    const currentUser = await requireSuperAdmin();

    const body = await request.json();

    // Validate input
    const validation = createWilayaSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten().fieldErrors);
    }

    const { name, code, lat, lng, gradient, managerId } = validation.data;

    // Check if wilaya name already exists
    const existingWilayaName = await prisma.wilaya.findUnique({
      where: { name },
    });

    if (existingWilayaName) {
      return errorResponse("Wilaya name already exists", 409);
    }

    // Check if wilaya code already exists
    const existingWilayaCode = await prisma.wilaya.findUnique({
      where: { code },
    });

    if (existingWilayaCode) {
      return errorResponse("Wilaya code already exists", 409);
    }

    // If manager is assigned, check if manager exists and is available
    if (managerId) {
      const manager = await prisma.user.findUnique({
        where: { id: managerId },
        include: { managedWilaya: true },
      });

      if (!manager) {
        return errorResponse("Manager not found", 404);
      }

      if (manager.role !== "MANAGER") {
        return errorResponse("User is not a manager", 400);
      }

      if (manager.status !== "ACTIVE") {
        return errorResponse("Manager account is inactive", 400);
      }

      if (manager.managedWilaya) {
        return errorResponse(
          `Manager already manages ${manager.managedWilaya.name}`,
          400
        );
      }
    }

    // Create wilaya
    const newWilaya = await prisma.wilaya.create({
      data: {
        name,
        code,
        lat,
        lng,
        gradient: gradient || "from-blue-500 to-cyan-500",
      },
      include: {
        manager: managerId
          ? {
              select: {
                id: true,
                username: true,
                email: true,
              },
            }
          : false,
      },
    });

    // If manager is assigned, update the user
    if (managerId) {
      await prisma.user.update({
        where: { id: managerId },
        data: {
          wilayaId: newWilaya.id,
        },
      });
    }

    // Log activity
    await prisma.activity.create({
      data: {
        type: "WILAYA_CREATED",
        description: `Wilaya ${name} (${code}) created`,
        userId: currentUser.id,
        metadata: {
          wilayaId: newWilaya.id,
          wilayaName: name,
          wilayaCode: code,
        },
      },
    });

    // Fetch updated wilaya with manager
    const wilayaWithManager = await prisma.wilaya.findUnique({
      where: { id: newWilaya.id },
      include: {
        manager: {
          select: {
            id: true,
            username: true,
            email: true,
            status: true,
          },
        },
        _count: {
          select: {
            restaurants: true,
          },
        },
      },
    });

    return successResponse(
      {
        wilaya: wilayaWithManager,
        message: "Wilaya created successfully",
      },
      201
    );
  } catch (error: any) {
    console.error("❌ Create wilaya error:", error);

    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return errorResponse(error.message, 403);
    }

    return errorResponse("Internal server error", 500);
  }
}
