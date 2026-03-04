import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { SalesQuerySchema } from "@/lib/schemas/sale";

export async function GET(request: NextRequest) {
  try {
    const queryInput = {
      vendorId: request.nextUrl.searchParams.get("vendorId") ?? undefined,
      orderId: request.nextUrl.searchParams.get("orderId") ?? undefined,
      productId: request.nextUrl.searchParams.get("productId") ?? undefined,
    };
    const parsedQuery = SalesQuerySchema.safeParse(queryInput);

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
    const where: Prisma.SaleWhereInput = {};

    if (query.vendorId) where.vendorId = query.vendorId;
    if (query.orderId) where.orderId = query.orderId;
    if (query.productId) where.productId = query.productId;

    const sales = await db.sale.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(sales);
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to fetch sales",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
