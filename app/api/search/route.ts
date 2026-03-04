import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { SearchQuerySchema } from "@/lib/schemas/search";

export async function GET(request: NextRequest) {
  try {
    const queryInput = {
      search: request.nextUrl.searchParams.get("search") ?? undefined,
      sort: request.nextUrl.searchParams.get("sort") ?? undefined,
      min: request.nextUrl.searchParams.get("min") ?? undefined,
      max: request.nextUrl.searchParams.get("max") ?? undefined,
      page: request.nextUrl.searchParams.get("page") ?? undefined,
      pageSize: request.nextUrl.searchParams.get("pageSize") ?? undefined,
      categoryId:
        request.nextUrl.searchParams.get("categoryId") ??
        request.nextUrl.searchParams.get("catId") ??
        undefined,
    };
    const parsedQuery = SearchQuerySchema.safeParse(queryInput);

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
    const where: Prisma.ProductWhereInput = {};

    if (query.search) {
      where.OR = [
        {
          title: { contains: query.search, mode: "insensitive" },
        },
        {
          category: {
            title: { contains: query.search, mode: "insensitive" },
          },
        },
        {
          description: { contains: query.search, mode: "insensitive" },
        },
      ];
    }

    if (query.categoryId) where.categoryId = query.categoryId;

    if (query.min !== undefined || query.max !== undefined) {
      where.salePrice = {};
      if (query.min !== undefined) where.salePrice.gte = query.min;
      if (query.max !== undefined) where.salePrice.lte = query.max;
    }

    const products = await db.product.findMany({
      where,
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      orderBy: {
        salePrice: query.sort,
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to fetch products",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
