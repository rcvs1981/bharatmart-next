import { z } from "zod";

const nullableText = z.string().trim().min(1).optional().nullable();

const nullableId = z.preprocess((value) => {
  if (value === "") return null;
  return value;
}, z.string().trim().min(1).optional().nullable());

export const CategoryCreateInputSchema = z.object({
  title: z.string().trim().min(1),
  slug: z.string().trim().min(1),
  imageUrl: nullableText,
  description: nullableText,
  isActive: z.coerce.boolean().default(true),
  parentId: nullableId,
});

export const CategoryUpdateInputSchema = CategoryCreateInputSchema.partial();

export const CategoryIdParamSchema = z.object({
  id: z.string().trim().min(1),
});

export const CategorySlugParamSchema = z.object({
  slug: z.string().trim().min(1),
});

