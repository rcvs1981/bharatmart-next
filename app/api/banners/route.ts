import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { BannerCreateInputSchema } from "@/lib/schemas/banner";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const parsedInput = BannerCreateInputSchema.safeParse(payload);

    if (!parsedInput.success) {
      return NextResponse.json(
        {
          message: "Invalid banner payload",
          errors: parsedInput.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = parsedInput.data;
    const newBanner = await db.banner.create({
      data: {
        title: data.title,
        link: data.link,
        imageUrl: data.imageUrl,
        isActive: data.isActive,
      },
    });

    return NextResponse.json(newBanner, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to create banner",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(_request: NextRequest) {
  try {
    const banners = await db.banner.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(banners);
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to fetch banners",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
