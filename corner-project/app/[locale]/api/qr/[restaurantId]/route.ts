// src/app/api/qr/[restaurantId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import prisma from "@/lib/prisma";
import { errorResponse, notFoundResponse } from "@/lib/api-response";
import { Canvas, createCanvas, loadImage } from "canvas";

// ==================== GET /api/qr/[restaurantId] ====================
// Generate QR code for restaurant menu (Public endpoint)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ restaurantId: string }> }
) {
  try {
    const { restaurantId } = await params;

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "png"; // png, svg, dataurl
    const size = parseInt(searchParams.get("size") || "400");
    const download = searchParams.get("download") === "true";

    // Validate size
    if (size < 100 || size > 2000) {
      return errorResponse("Size must be between 100 and 2000 pixels", 400);
    }

    // Find restaurant by ID or slug
    const restaurant = await prisma.restaurant.findFirst({
      where: {
        OR: [{ id: restaurantId }, { slug: restaurantId }],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
      },
    });

    if (!restaurant) {
      return notFoundResponse("Restaurant not found");
    }

    // Build menu URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const menuUrl = `${baseUrl}/menu/${restaurant.slug}?source=qr`;

    // QR Code options
    const qrOptions = {
      width: size,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "M" as const,
    };

    // Generate QR code based on format
    if (format === "svg") {
      // Generate SVG
      const svgString = await QRCode.toString(menuUrl, {
        ...qrOptions,
        type: "svg",
      });

      return new NextResponse(svgString, {
        headers: {
          "Content-Type": "image/svg+xml",
          "Content-Disposition": download
            ? `attachment; filename="${restaurant.slug}-qr. svg"`
            : "inline",
          "Cache-Control": "public, max-age=86400", // Cache for 1 day
        },
      });
    } else if (format === "dataurl") {
      // Generate Data URL
      const dataUrl = await QRCode.toDataURL(menuUrl, qrOptions);

      return NextResponse.json({
        success: true,
        data: {
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          slug: restaurant.slug,
          menuUrl,
          qrCode: dataUrl,
        },
      });
    } else {
      // Generate PNG (default)
      const buffer = await QRCode.toBuffer(menuUrl, {
        ...qrOptions,
        type: "png",
      });

      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type": "image/png",
          "Content-Disposition": download
            ? `attachment; filename="${restaurant.slug}-qr.png"`
            : "inline",
          "Cache-Control": "public, max-age=86400", // Cache for 1 day
        },
      });
    }
  } catch (error) {
    console.error("❌ Generate QR code error:", error);
    return errorResponse("Internal server error", 500);
  }
}
//in futer
async function generateQRWithLogo(
  menuUrl: string,
  logoUrl: string | null,
  size: number
): Promise<Buffer> {
  // Generate QR code as data URL
  const qrDataUrl = await QRCode.toDataURL(menuUrl, {
    width: size,
    margin: 2,
    errorCorrectionLevel: "H", // High error correction for logo overlay
  });

  // Create canvas
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  // Draw QR code
  const qrImage = await loadImage(qrDataUrl);
  ctx.drawImage(qrImage, 0, 0, size, size);

  // If logo provided, overlay it
  if (logoUrl) {
    try {
      const logo = await loadImage(logoUrl);
      const logoSize = size * 0.2; // Logo is 20% of QR size
      const logoX = (size - logoSize) / 2;
      const logoY = (size - logoSize) / 2;

      // Draw white background circle for logo
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, logoSize / 2 + 10, 0, 2 * Math.PI);
      ctx.fill();

      // Draw logo
      ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
    } catch (err) {
      console.warn("Failed to add logo to QR code:", err);
      // Continue without logo
    }
  }

  return canvas.toBuffer("image/png");
}
