import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import {
  CouponIdParamSchema,
  CouponUpdateInputSchema,
} from "@/lib/schemas/coupon";

type ParamsContext = {
  params: Promise<{ id: string }>;
};

async function getCouponId(paramsPromise: ParamsContext["params"]) {
  const params = await paramsPromise;
  return CouponIdParamSchema.parse(params).id;
}

export async function GET(_request: NextRequest, context: ParamsContext) {
  try {
    const id = await getCouponId(context.params);
    const coupon = await db.coupon.findUnique({
      where: { id },
    });

    if (!coupon) {
      return NextResponse.json(
        {
          data: null,
          message: "Coupon not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(coupon);
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to fetch coupon",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, context: ParamsContext) {
  try {
    const id = await getCouponId(context.params);
    const existingCoupon = await db.coupon.findUnique({
      where: { id },
    });

    if (!existingCoupon) {
      return NextResponse.json(
        {
          data: null,
          message: "Coupon not found",
        },
        { status: 404 }
      );
    }

    const deletedCoupon = await db.coupon.delete({
      where: { id },
    });

    return NextResponse.json(deletedCoupon);
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to delete coupon",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: ParamsContext) {
  try {
    const id = await getCouponId(context.params);
    const payload = await request.json();
    const parsedInput = CouponUpdateInputSchema.safeParse(payload);

    if (!parsedInput.success) {
      return NextResponse.json(
        {
          message: "Invalid coupon payload",
          errors: parsedInput.error.flatten(),
        },
        { status: 400 }
      );
    }

    const existingCoupon = await db.coupon.findUnique({
      where: { id },
    });

    if (!existingCoupon) {
      return NextResponse.json(
        {
          data: null,
          message: "Coupon not found",
        },
        { status: 404 }
      );
    }

    const input = parsedInput.data;
    if (input.vendorId !== undefined) {
      const vendor = await db.user.findUnique({
        where: { id: input.vendorId },
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
    }

    const data: Prisma.CouponUncheckedUpdateInput = {};

    if (input.title !== undefined) data.title = input.title;
    if (input.couponCode !== undefined) data.couponCode = input.couponCode;
    if (input.expiryDate !== undefined) data.expiryDate = input.expiryDate;
    if (input.isActive !== undefined) data.isActive = input.isActive;
    if (input.vendorId !== undefined) data.vendorId = input.vendorId;

    const updatedCoupon = await db.coupon.update({
      where: { id },
      data,
    });

    return NextResponse.json(updatedCoupon);
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to update coupon",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
