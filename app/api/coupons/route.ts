import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { CouponCreateInputSchema, CouponQuerySchema } from "@/lib/schemas/coupon";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const parsedInput = CouponCreateInputSchema.safeParse(payload);

    if (!parsedInput.success) {
      return NextResponse.json(
        {
          message: "Invalid coupon payload",
          errors: parsedInput.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = parsedInput.data;
    const vendor = await db.user.findUnique({
      where: { id: data.vendorId },
      select: { id: true },
    });

    if (!vendor) {
      return NextResponse.json(
        {
          message: "Seller not found",
        },
        { status: 404 }
      );
    }

    const newCoupon = await db.coupon.create({
      data: {
        title: data.title,
        couponCode: data.couponCode,
        expiryDate: data.expiryDate,
        isActive: data.isActive,
        vendorId: data.vendorId,
      },
    });

    return NextResponse.json(newCoupon, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to create coupon",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const queryInput = {
      vendorId: request.nextUrl.searchParams.get("vendorId") ?? undefined,
      isActive: request.nextUrl.searchParams.get("isActive") ?? undefined,
    };
    const parsedQuery = CouponQuerySchema.safeParse(queryInput);

    if (!parsedQuery.success) {
      return NextResponse.json(
        {
          message: "Invalid query parameters",
          errors: parsedQuery.error.flatten(),
        },
        { status: 400 }
      );
    }

    const query = parsedQuery.data;
    const where: Prisma.CouponWhereInput = {};

    if (query.vendorId) where.vendorId = query.vendorId;
    if (query.isActive) where.isActive = query.isActive === "true";

    const coupons = await db.coupon.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(coupons);
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to fetch coupons",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
