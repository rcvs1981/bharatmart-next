import { z } from "zod";

const nullableString = z.string().trim().min(1).optional().nullable();

export const UserRoleInputSchema = z.enum([
  "ADMIN",
  "USER",
  "FARMER",
  "MODERATOR",
  "SELLER",
]);

export const UserCreateInputSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
  password: z.string().min(6),
  role: UserRoleInputSchema.optional().default("USER"),
  plan: nullableString,
});

export const UserQuerySchema = z.object({
  role: UserRoleInputSchema.optional(),
  status: z.enum(["true", "false"]).optional(),
});

export const UserIdParamSchema = z.object({
  id: z.string().trim().min(1),
});

export const UserUpdateInputSchema = z.object({
  name: nullableString,
  email: z.string().trim().email().optional(),
  password: z.string().min(6).optional(),
  role: UserRoleInputSchema.optional(),
  plan: nullableString,
  status: z.coerce.boolean().optional(),
  emailVerified: z.coerce.boolean().optional(),
  verificationToken: nullableString,
});

export type UserCreateInput = z.infer<typeof UserCreateInputSchema>;
export type UserUpdateInput = z.infer<typeof UserUpdateInputSchema>;
