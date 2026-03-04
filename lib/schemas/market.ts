import { z } from "zod";

const nullableString = z.string().trim().min(1).optional().nullable();

const CategoryIdsSchema = z.preprocess(
  (value) => {
    if (Array.isArray(value)) return value;
    if (typeof value === "string" && value.trim().length > 0) return [value];
    return value;
  },
  z.array(z.string().trim().min(1))
);

export const MarketCreateInputSchema = z.object({
  title: z.string().trim().min(1),
  slug: z.string().trim().min(1),
  logoUrl: nullableString,
  description: nullableString,
  isActive: z.coerce.boolean().default(true),
  categoryIds: CategoryIdsSchema.default([]),
});

export const MarketUpdateInputSchema = MarketCreateInputSchema.partial();

export const MarketIdParamSchema = z.object({
  id: z.string().trim().min(1),
});

export const MarketSlugParamSchema = z.object({
  slug: z.string().trim().min(1),
});

export const MarketQuerySchema = z.object({
  isActive: z.enum(["true", "false"]).optional(),
  categoryId: z.string().trim().min(1).optional(),
});

export type MarketCreateInput = z.infer<typeof MarketCreateInputSchema>;
export type MarketUpdateInput = z.infer<typeof MarketUpdateInputSchema>;
