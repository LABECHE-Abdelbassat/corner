// src/app/api/admin/users/route.ts

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-response";

import { hashPassword } from "@/lib/auth";
import { createUserSchema } from "@/lib/validators";
import { validationErrorResponse } from "@/lib/api-response";

// GET /api/admin/users - List all users
export async function GET(request: NextRequest) {
  try {
    // Check if user is super admin
    await requireSuperAdmin();

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    // Build where clause
    const where: any = {};

    if (role && ["SUPER_ADMIN", "MANAGER", "OWNER"].includes(role)) {
      where.role = role;
    }

    if (status && ["ACTIVE", "INACTIVE"].includes(status)) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { username: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    // Fetch users
    const users = await prisma.user.findMany({
      where,
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        managedWilaya: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: [{ role: "asc" }, { createdAt: "desc" }],
    });

    // Remove passwords from response
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);

    return successResponse({
      users: usersWithoutPasswords,
      total: usersWithoutPasswords.length,
    });
  } catch (error: any) {
    console.error("❌ Get users error:", error);

    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return errorResponse(error.message, 403);
    }

    return errorResponse("Internal server error", 500);
  }
}

// POST /api/admin/users - Create new user
export async function POST(request: NextRequest) {
  try {
    // Check if user is super admin
    await requireSuperAdmin();

    const body = await request.json();

    // Validate input
    const validation = createUserSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten().fieldErrors);
    }

    const { username, password, email, role, restaurantId, wilayaId } =
      validation.data;

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return errorResponse("Username already exists", 409);
    }

    // Check if email already exists (if provided)
    if (email) {
      const existingEmail = await prisma.user.findFirst({
        where: { email },
      });

      if (existingEmail) {
        return errorResponse("Email already exists", 409);
      }
    }

    // Validate role-specific constraints
    if (role === "OWNER" && !restaurantId) {
      return errorResponse(
        "Restaurant owners must be assigned to a restaurant",
        400
      );
    }

    if (role === "MANAGER" && !wilayaId) {
      return errorResponse("Managers must be assigned to a wilaya", 400);
    }

    // Check if restaurant exists (for OWNER)
    if (restaurantId) {
      const restaurant = await prisma.restaurant.findUnique({
        where: { id: restaurantId },
        include: { owner: true },
      });

      if (!restaurant) {
        return errorResponse("Restaurant not found", 404);
      }

      if (restaurant.owner) {
        return errorResponse("Restaurant already has an owner", 400);
      }
    }

    // Check if wilaya exists (for MANAGER)
    if (wilayaId) {
      const wilaya = await prisma.wilaya.findUnique({
        where: { id: wilayaId },
        include: { manager: true },
      });

      if (!wilaya) {
        return errorResponse("Wilaya not found", 404);
      }

      if (wilaya.manager) {
        return errorResponse("Wilaya already has a manager", 400);
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        email: email || null,
        role,
        status: "ACTIVE",
        restaurantId: restaurantId || null,
        wilayaId: wilayaId || null,
      },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        managedWilaya: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        type: "USER_CREATED",
        description: `User ${username} created with role ${role}`,
        userId: newUser.id,
      },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    return successResponse(
      {
        user: userWithoutPassword,
        message: "User created successfully",
      },
      201
    );
  } catch (error: any) {
    console.error("❌ Create user error:", error);

    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return errorResponse(error.message, 403);
    }

    return errorResponse("Internal server error", 500);
  }
}
