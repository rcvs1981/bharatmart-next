import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { MarketSlugParamSchema } from "@/lib/schemas/market";

type ParamsContext = {
  params: Promise<{ slug: string }>;
};

async function getMarketSlug(paramsPromise: ParamsContext["params"]) {
  const params = await paramsPromise;
  return MarketSlugParamSchema.parse(params).slug;
}

export async function GET(_request: NextRequest, context: ParamsContext) {
  try {
    const slug = await getMarketSlug(context.params);
    const market = await db.market.findUnique({
      where: {
        slug,
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
