import { z } from "zod";

const nullableString = z.string().trim().min(1).optional().nullable();

export const SellerIdParamSchema = z.object({
  id: z.string().trim().min(1),
});

export const SellerQuerySchema = z.object({
  status: z.enum(["true", "false"]).optional(),
  isActive: z.enum(["true", "false"]).optional(),
});

export const SellerProfileInputSchema = z.object({
  code: nullableString,
  contactPerson: nullableString,
  contactPersonPhone: nullableString,
  profileImageUrl: nullableString,
  firstName: nullableString,
  lastName: nullableString,
  name: nullableString,
  email: z.string().trim().email().optional().nullable(),
  notes: nullableString,
  phone: nullableString,
  physicalAddress: nullableString,
  terms: nullableString,
  isActive: z.coerce.boolean().optional().nullable(),
  products: z.array(z.string().trim().min(1)).optional().default([]),
  landSize: z.coerce.number().nonnegative().optional().nullable(),
  mainCrop: nullableString,
  userId: z.string().trim().min(1),
});

export const SellerProfileUpdateInputSchema = SellerProfileInputSchema.omit({
  userId: true,
}).partial();

export const SellerStatusUpdateSchema = z.object({
  status: z.coerce.boolean().optional(),
  emailVerified: z.coerce.boolean().optional(),
  profile: SellerProfileUpdateInputSchema.optional(),
});

export type SellerProfileInput = z.infer<typeof SellerProfileInputSchema>;
export type SellerProfileUpdateInput = z.infer<
  typeof SellerProfileUpdateInputSchema
>;
