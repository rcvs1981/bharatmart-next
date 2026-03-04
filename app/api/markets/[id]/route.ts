import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import {
  MarketIdParamSchema,
  MarketUpdateInputSchema,
} from "@/lib/schemas/market";

type ParamsContext = {
  params: Promise<{ id: string }>;
};

async function getMarketId(paramsPromise: ParamsContext["params"]) {
  const params = await paramsPromise;
  return MarketIdParamSchema.parse(params).id;
}

export async function GET(_request: NextRequest, context: ParamsContext) {
  try {
    const id = await getMarketId(context.params);
    const market = await db.market.findUnique({
      where: {
        id,
      },
    });

    if (!market) {
      return NextResponse.json(
        {
          data: null,
          message: "Market not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(market);
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to fetch market",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, context: ParamsContext) {
  try {
    const id = await getMarketId(context.params);
    const existingMarket = await db.market.findUnique({
      where: {
        id,
      },
    });

    if (!existingMarket) {
      return NextResponse.json(
        {
          data: null,
          message: "Market not found",
        },
        { status: 404 }
      );
    }

    const deletedMarket = await db.market.delete({
      where: {
        id,
      },
    });

    return NextResponse.json(deletedMarket);
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to delete market",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: ParamsContext) {
  try {
    const id = await getMarketId(context.params);
    const payload = await request.json();
    const parsedInput = MarketUpdateInputSchema.safeParse(payload);

    if (!parsedInput.success) {
      return NextResponse.json(
        {
          message: "Invalid market payload",
          errors: parsedInput.error.flatten(),
        },
        { status: 400 }
      );
    }

    const existingMarket = await db.market.findUnique({
      where: { id },
      select: { id: true, slug: true },
    });

    if (!existingMarket) {
      return NextResponse.json(
        {
          data: null,
          message: "Market not found",
        },
        { status: 404 }
      );
    }

    const input = parsedInput.data;
    if (input.slug && input.slug !== existingMarket.slug) {
      const existingSlug = await db.market.findUnique({
        where: { slug: input.slug },
        select: { id: true },
      });
      if (existingSlug && existingSlug.id !== id) {
        return NextResponse.json(
          {
            message: "Another market already uses this slug",
          },
          { status: 409 }
        );
      }
    }

    const data: Prisma.MarketUpdateInput = {};

    if (input.title !== undefined) data.title = input.title;
    if (input.slug !== undefined) data.slug = input.slug;
    if (input.logoUrl !== undefined) data.logoUrl = input.logoUrl;
    if (input.description !== undefined) data.description = input.description;
    if (input.isActive !== undefined) data.isActive = input.isActive;
    if (input.categoryIds !== undefined) data.categoryIds = input.categoryIds;

    const updatedMarket = await db.market.update({
      where: { id },
      data,
    });

    return NextResponse.json(updatedMarket);
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to update market",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
