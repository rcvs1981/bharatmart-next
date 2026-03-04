"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { db } from "@/lib/db";
import {
  ProductCreateInputSchema,
  ProductUpdateInputSchema,
} from "@/lib/schemas/product";

type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string; errors?: z.ZodFormattedError<unknown> };

export async function createProductAction(
  payload: unknown
): Promise<ActionResult<{ id: string }>> {
  const parsedInput = ProductCreateInputSchema.safeParse(payload);
  if (!parsedInput.success) {
    return {
      ok: false,
      message: "Validation failed",
      errors: parsedInput.error.format(),
    };
  }

  const data = parsedInput.data;
  const existingProduct = await db.product.findUnique({
    where: { slug: data.slug },
  });

  if (existingProduct) {
    return {
      ok: false,
      message: `Product (${data.title}) already exists`,
    };
  }

  const product = await db.product.create({
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

  revalidatePath("/dashboard/products");
  return { ok: true, data: { id: product.id } };
}

export async function updateProductAction(
  id: string,
  payload: unknown
): Promise<ActionResult<{ id: string }>> {
  const parsedInput = ProductUpdateInputSchema.safeParse(payload);
  if (!parsedInput.success) {
    return {
      ok: false,
      message: "Validation failed",
      errors: parsedInput.error.format(),
    };
  }

  const existingProduct = await db.product.findUnique({
    where: { id },
  });

  if (!existingProduct) {
    return {
      ok: false,
      message: "Product not found",
    };
  }

  await db.product.update({
    where: { id },
    data: buildUpdateData(parsedInput.data),
  });

  revalidatePath("/dashboard/products");
  revalidatePath(`/dashboard/products/update/${id}`);
  return { ok: true, data: { id } };
}

function buildUpdateData(
  input: z.infer<typeof ProductUpdateInputSchema>
): Prisma.ProductUncheckedUpdateInput {
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
  if (input.wholesalePrice !== undefined) data.wholesalePrice = input.wholesalePrice;
  if (input.wholesaleQty !== undefined) data.wholesaleQty = input.wholesaleQty;
  if (input.productStock !== undefined) data.productStock = input.productStock;
  if (input.qty !== undefined) data.qty = input.qty;
  if (input.productImages !== undefined) {
    data.productImages = input.productImages;
    data.imageUrl = input.productImages[0] ?? null;
  } else if (input.imageUrl !== undefined) {
    data.imageUrl = input.imageUrl;
  }

  return data;
}
