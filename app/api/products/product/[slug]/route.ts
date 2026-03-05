import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";

type ParamsContext = {
  params: Promise<{ slug: string }>;
};

async function getSlug(paramsPromise: ParamsContext["params"]) {
  const params = await paramsPromise;
  return params.slug;
}

function parseOptionalNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export async function GET(_request: NextRequest, context: ParamsContext) {
  try {
    const slug = await getSlug(context.params);
    const product = await db.product.findUnique({
      where: { slug },
    });

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to fetch product",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, context: ParamsContext) {
  try {
    const slug = await getSlug(context.params);
    const existingProduct = await db.product.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existingProduct) {
      return NextResponse.json(
        {
          data: null,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    const deletedProduct = await db.product.delete({
      where: { id: existingProduct.id },
    });

    return NextResponse.json(deletedProduct);
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to delete product",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: ParamsContext) {
  try {
    const slug = await getSlug(context.params);
    const existingProduct = await db.product.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existingProduct) {
      return NextResponse.json(
        {
          data: null,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    const payload = (await request.json()) as Record<string, unknown>;

    const updatedProduct = await db.product.update({
      where: { id: existingProduct.id },
      data: {
        barcode: payload.barcode as string | undefined,
        categoryId: payload.categoryId as string | undefined,
        description: payload.description as string | undefined,
        userId: (payload.farmerId as string | undefined) ?? undefined,
        imageUrl: payload.imageUrl as string | undefined,
        isActive: payload.isActive as boolean | undefined,
        isWholesale: payload.isWholesale as boolean | undefined,
        productCode: payload.productCode as string | undefined,
        productPrice: parseOptionalNumber(payload.productPrice),
        salePrice: parseOptionalNumber(payload.salePrice),
        sku: payload.sku as string | undefined,
        slug: (payload.slug as string | undefined) ?? slug,
        tags: payload.tags as string[] | undefined,
        title: payload.title as string | undefined,
        unit: payload.unit as string | undefined,
        wholesalePrice: parseOptionalNumber(payload.wholesalePrice),
        wholesaleQty: parseOptionalNumber(payload.wholesaleQty),
        productStock: parseOptionalNumber(payload.productStock),
        qty: parseOptionalNumber(payload.qty),
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to update product",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
