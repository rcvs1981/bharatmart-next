import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import {
  ProductCreateInputSchema,
  ProductQuerySchema,
} from "@/lib/schemas/product";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const parsedInput = ProductCreateInputSchema.safeParse(payload);

    if (!parsedInput.success) {
      return NextResponse.json(
        {
          message: "Invalid product payload",
          errors: parsedInput.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = parsedInput.data;
    const existingProduct = await db.product.findUnique({
      where: {
        slug: data.slug,
      },
    });

    if (existingProduct) {
      return NextResponse.json(
        {
          data: null,
          message: `Product (${data.title}) already exists in the database`,
        },
        { status: 409 }
      );
    }

    const newProduct = await db.product.create({
      data: {
        barcode: data.barcode ?? null,
        categoryId: data.categoryId,
        description: data.description ?? null,
        userId: data.farmerId,
        productImages: data.productImages,
        imageUrl: data.productImages[0] ?? data.imageUrl ?? null,
        isActive: data.isActive,
        isWholesale: data.isWholesale,
        productCode: data.productCode ?? null,
        productPrice: data.productPrice,
        salePrice: data.salePrice,
        sku: data.sku ?? null,
        slug: data.slug,
        tags: data.tags,
        title: data.title,
        unit: data.unit ?? null,
        wholesalePrice: data.wholesalePrice ?? null,
        wholesaleQty: data.wholesaleQty ?? null,
        productStock: data.productStock ?? null,
        qty: data.qty ?? 1,
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to create product",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const queryInput = {
      categoryId: request.nextUrl.searchParams.get("catId") ?? undefined,
      sort: request.nextUrl.searchParams.get("sort") ?? undefined,
      min: request.nextUrl.searchParams.get("min") ?? undefined,
      max: request.nextUrl.searchParams.get("max") ?? undefined,
      page: request.nextUrl.searchParams.get("page") ?? undefined,
      pageSize: request.nextUrl.searchParams.get("pageSize") ?? undefined,
    };
    const parsedQuery = ProductQuerySchema.safeParse(queryInput);

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
      orderBy: query.sort
        ? {
            salePrice: query.sort,
          }
        : {
            createdAt: "desc",
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

