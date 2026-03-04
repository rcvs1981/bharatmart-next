import { z } from "zod";

const stringOrNull = z.string().trim().min(1).optional().nullable();

export const ProductCreateInputSchema = z.object({
  title: z.string().trim().min(1),
  slug: z.string().trim().min(1),
  categoryId: z.string().trim().min(1),
  farmerId: z.string().trim().min(1),
  description: stringOrNull,
  barcode: stringOrNull,
  sku: stringOrNull,
  productCode: stringOrNull,
  unit: stringOrNull,
  tags: z.array(z.string()).default([]),
  isActive: z.coerce.boolean().default(true),
  isWholesale: z.coerce.boolean().default(false),
  productPrice: z.coerce.number().nonnegative(),
  salePrice: z.coerce.number().nonnegative(),
  wholesalePrice: z.coerce.number().nonnegative().optional().nullable(),
  wholesaleQty: z.coerce.number().int().nonnegative().optional().nullable(),
  productStock: z.coerce.number().int().nonnegative().optional().nullable(),
  qty: z.coerce.number().int().nonnegative().optional().nullable(),
  productImages: z.array(z.string().trim().min(1)).default([]),
  imageUrl: stringOrNull,
});

export const ProductUpdateInputSchema = ProductCreateInputSchema.partial();

export const ProductQuerySchema = z.object({
  categoryId: z.string().trim().min(1).optional(),
  sort: z.enum(["asc", "desc"]).optional(),
  min: z.coerce.number().nonnegative().optional(),
  max: z.coerce.number().nonnegative().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().default(3),
});

export const ProductIdParamSchema = z.object({
  id: z.string().trim().min(1),
});

export const ProductSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  categoryId: z.string(),
  userId: z.string(),
  imageUrl: z.string().nullable(),
  productImages: z.array(z.string()),
  description: z.string().nullable(),
  isActive: z.boolean(),
  isWholesale: z.boolean(),
  sku: z.string().nullable(),
  barcode: z.string().nullable(),
  productCode: z.string().nullable(),
  unit: z.string().nullable(),
  productPrice: z.number(),
  salePrice: z.number(),
  wholesalePrice: z.number().nullable(),
  wholesaleQty: z.number().int().nullable(),
  productStock: z.number().int().nullable(),
  qty: z.number().int().nullable(),
  tags: z.array(z.string()),
  createdAt: z.union([z.string(), z.date()]),
  updatedAt: z.union([z.string(), z.date()]),
});

export const ProductListSchema = z.array(ProductSchema);

export type ProductCreateInput = z.infer<typeof ProductCreateInputSchema>;
export type ProductUpdateInput = z.infer<typeof ProductUpdateInputSchema>;
export type ProductQueryInput = z.infer<typeof ProductQuerySchema>;
export type Product = z.infer<typeof ProductSchema>;
