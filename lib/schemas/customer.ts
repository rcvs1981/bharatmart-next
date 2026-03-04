import { z } from "zod";

const nullableString = z.string().trim().min(1).optional().nullable();

export const CustomerIdParamSchema = z.object({
  id: z.string().trim().min(1),
});

export const CustomerQuerySchema = z.object({
  status: z.enum(["true", "false"]).optional(),
});

export const CustomerProfileInputSchema = z.object({
  name: nullableString,
  firstName: nullableString,
  lastName: nullableString,
  email: z.string().trim().email().optional().nullable(),
  username: nullableString,
  phone: nullableString,
  streetAddress: nullableString,
  city: nullableString,
  country: nullableString,
  district: nullableString,
  dateOfBirth: z.coerce.date().optional().nullable(),
  profileImage: nullableString,
});

export const CustomerUpdateInputSchema = z.object({
  name: nullableString,
  email: z.string().trim().email().optional(),
  status: z.coerce.boolean().optional(),
  emailVerified: z.coerce.boolean().optional(),
  profile: CustomerProfileInputSchema.optional(),
});

export type CustomerUpdateInput = z.infer<typeof CustomerUpdateInputSchema>;
export type CustomerProfileInput = z.infer<typeof CustomerProfileInputSchema>;
