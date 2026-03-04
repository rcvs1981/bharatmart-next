import { z } from "zod";

export const BannerCreateInputSchema = z.object({
  title: z.string().trim().min(1),
  link: z.string().trim().min(1),
  imageUrl: z.string().trim().min(1),
  isActive: z.coerce.boolean().default(true),
});

export const BannerUpdateInputSchema = BannerCreateInputSchema.partial();

export const BannerIdParamSchema = z.object({
  id: z.string().trim().min(1),
});

export const BannerSchema = z.object({
  id: z.string(),
  title: z.string(),
  link: z.string().nullable(),
  imageUrl: z.string(),
  isActive: z.boolean(),
  createdAt: z.union([z.string(), z.date()]),
  updatedAt: z.union([z.string(), z.date()]),
});

export const BannerListSchema = z.array(BannerSchema);

export type BannerCreateInput = z.infer<typeof BannerCreateInputSchema>;
export type BannerUpdateInput = z.infer<typeof BannerUpdateInputSchema>;
export type Banner = z.infer<typeof BannerSchema>;
