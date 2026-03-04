import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import {
  ProductIdParamSchema,
  ProductUpdateInputSchema,
} from "@/lib/schemas/product";

type ParamsContext = {
  params: Promise<{ id: string }>;
};

async function getProductId(paramsPromise: ParamsContext["params"]) {
  const params = await paramsPromise;
  return ProductIdParamSchema.parse(params).id;
}

export async function GET(_request: NextRequest, context: ParamsContext) {
  try {
    const id = await getProductId(context.params);
    const product = await db.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json(
        {
          data: null,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

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
    const id = await getProductId(context.params);
    const existingProduct = await db.product.findUnique({
      where: { id },
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
      where: { id },
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
    const id = await getProductId(context.params);
    const payload = await request.json();
    const parsedInput = ProductUpdateInputSchema.safeParse(payload);

    if (!parsedInput.success) {
      return NextResponse.json(
        {
          message: "Invalid product payload",
          errors: parsedInput.error.flatten(),
        },
        { status: 400 }
      );
    }

    const existingProduct = await db.product.findUnique({
      where: { id },
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

    const input = parsedInput.data;
    const data: Prisma.ProductUncheckedUpdateInput = {};

    if (input.barcode !== undefined) data.barcode = input.barcode;
    if (input.categoryId !== undefined) data.categoryId = input.categoryId;
    if (input.description !== undefined) data.description = input.description;
    if (input.farmerId !== undefined) data.userId = input.farmerId;
    if (input.isActive !== undefined) data.isActive = input.isActive;
    if (input.isWholesale !== undefined) data.isWholesale = input.isWholesale;
    if (input.productCode !== undefined) data.productCode = input.productCode;
    if (input.productPrice !== undefined) data.productPrice = input.productPrice;
    if (input.salePrice !== undefined) data.salePrice = input.salePrice;
    if (input.sku !== undefined) data.sku = input.sku;
    if (input.slug !== undefined) data.slug = input.slug;
    if (input.tags !== undefined) data.tags = input.tags;
    if (input.title !== undefined) data.title = input.title;
    if (input.unit !== undefined) data.unit = input.unit;
    if (input.wholesalePrice !== undefined) {
      data.wholesalePrice = input.wholesalePrice;
    }
    if (input.wholesaleQty !== undefined) data.wholesaleQty = input.wholesaleQty;
    if (input.productStock !== undefined) data.productStock = input.productStock;
    if (input.qty !== undefined) data.qty = input.qty;
    if (input.productImages !== undefined) {
      data.productImages = input.productImages;
      data.imageUrl = input.productImages[0] ?? null;
    } else if (input.imageUrl !== undefined) {
      data.imageUrl = input.imageUrl;
    }

    const updatedProduct = await db.product.update({
      where: { id },
      data,
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

