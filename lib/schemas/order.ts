import { z } from "zod";

const nullableString = z.string().trim().min(1).optional().nullable();

const OrderItemInputSchema = z.object({
  id: z.string().trim().min(1),
  title: z.string().trim().min(1),
  imageUrl: nullableString,
  qty: z.coerce.number().int().positive(),
  salePrice: z.coerce.number().nonnegative(),
  vendorId: z.string().trim().min(1),
});

const CheckoutFormDataSchema = z.object({
  city: nullableString,
  country: nullableString,
  district: nullableString,
  state: nullableString,
  zip: nullableString,
  apartment: nullableString,
  email: z.string().trim().email(),
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  paymentMethod: z.string().trim().min(1),
  phone: z.string().trim().min(1),
  shippingCost: z.coerce.number().nonnegative().optional().default(0),
  streetAddress: nullableString,
  userId: z.string().trim().min(1),
});

export const OrderCreateInputSchema = z.object({
  checkoutFormData: CheckoutFormDataSchema,
  orderItems: z.array(OrderItemInputSchema).min(1),
});

export const OrderIdParamSchema = z.object({
  id: z.string().trim().min(1),
});

export const OrderQuerySchema = z.object({
  userId: z.string().trim().min(1).optional(),
  orderStatus: z
    .enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELED"])
    .optional(),
});

export const OrderStatusUpdateInputSchema = z.object({
  orderStatus: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELED"]),
});

export type OrderCreateInput = z.infer<typeof OrderCreateInputSchema>;
