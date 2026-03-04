import { z } from "zod";

export const CouponCreateInputSchema = z.object({
  title: z.string().trim().min(1),
  couponCode: z.string().trim().min(1),
  expiryDate: z.coerce.date(),
  isActive: z.coerce.boolean().default(true),
  vendorId: z.string().trim().min(1),
});

export const CouponUpdateInputSchema = CouponCreateInputSchema.partial();

export const CouponIdParamSchema = z.object({
  id: z.string().trim().min(1),
});

export const CouponQuerySchema = z.object({
  vendorId: z.string().trim().min(1).optional(),
  isActive: z.enum(["true", "false"]).optional(),
});

export type CouponCreateInput = z.infer<typeof CouponCreateInputSchema>;
export type CouponUpdateInput = z.infer<typeof CouponUpdateInputSchema>;
