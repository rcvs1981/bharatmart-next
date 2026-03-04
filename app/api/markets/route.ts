import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { MarketCreateInputSchema, MarketQuerySchema } from "@/lib/schemas/market";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const parsedInput = MarketCreateInputSchema.safeParse(payload);

    if (!parsedInput.success) {
      return NextResponse.json(
        {
          message: "Invalid market payload",
          errors: parsedInput.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = parsedInput.data;
    const existingMarket = await db.market.findUnique({
      where: {
        slug: data.slug,
      },
    });

    if (existingMarket) {
      return NextResponse.json(
        {
          data: null,
          message: `Market (${data.title}) already exists in the database`,
        },
        { status: 409 }
      );
    }

    const newMarket = await db.market.create({
      data: {
        title: data.title,
        slug: data.slug,
        logoUrl: data.logoUrl ?? null,
        description: data.description ?? null,
        isActive: data.isActive,
        categoryIds: data.categoryIds,
      },
    });

    return NextResponse.json(newMarket, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to create market",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const queryInput = {
      isActive: request.nextUrl.searchParams.get("isActive") ?? undefined,
      categoryId: request.nextUrl.searchParams.get("categoryId") ?? undefined,
    };
    const parsedQuery = MarketQuerySchema.safeParse(queryInput);

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
    const where: Prisma.MarketWhereInput = {};

    if (query.isActive) where.isActive = query.isActive === "true";
    if (query.categoryId) where.categoryIds = { has: query.categoryId };

    const markets = await db.market.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(markets);
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to fetch markets",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
