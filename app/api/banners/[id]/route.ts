import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import {
  BannerIdParamSchema,
  BannerUpdateInputSchema,
} from "@/lib/schemas/banner";

type ParamsContext = {
  params: Promise<{ id: string }>;
};

async function getBannerId(paramsPromise: ParamsContext["params"]) {
  const params = await paramsPromise;
  return BannerIdParamSchema.parse(params).id;
}

export async function GET(_request: NextRequest, context: ParamsContext) {
  try {
    const id = await getBannerId(context.params);
    const banner = await db.banner.findUnique({
      where: { id },
    });

    if (!banner) {
      return NextResponse.json(
        {
          data: null,
          message: "Banner not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(banner);
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to fetch banner",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, context: ParamsContext) {
  try {
    const id = await getBannerId(context.params);
    const existingBanner = await db.banner.findUnique({
      where: { id },
    });

    if (!existingBanner) {
      return NextResponse.json(
        {
          data: null,
          message: "Banner not found",
        },
        { status: 404 }
      );
    }

    const deletedBanner = await db.banner.delete({
      where: { id },
    });

    return NextResponse.json(deletedBanner);
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to delete banner",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: ParamsContext) {
  try {
    const id = await getBannerId(context.params);
    const payload = await request.json();
    const parsedInput = BannerUpdateInputSchema.safeParse(payload);

    if (!parsedInput.success) {
      return NextResponse.json(
        {
          message: "Invalid banner payload",
          errors: parsedInput.error.flatten(),
        },
        { status: 400 }
      );
    }

    const existingBanner = await db.banner.findUnique({
      where: { id },
    });

    if (!existingBanner) {
      return NextResponse.json(
        {
          data: null,
          message: "Banner not found",
        },
        { status: 404 }
      );
    }

    const input = parsedInput.data;
    const data: Prisma.BannerUpdateInput = {};

    if (input.title !== undefined) data.title = input.title;
    if (input.link !== undefined) data.link = input.link;
    if (input.imageUrl !== undefined) data.imageUrl = input.imageUrl;
    if (input.isActive !== undefined) data.isActive = input.isActive;

    const updatedBanner = await db.banner.update({
      where: { id },
      data,
    });

    return NextResponse.json(updatedBanner);
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to update banner",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

