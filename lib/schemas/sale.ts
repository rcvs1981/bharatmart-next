import { z } from "zod";

export const SalesQuerySchema = z.object({
  vendorId: z.string().trim().min(1).optional(),
  orderId: z.string().trim().min(1).optional(),
  productId: z.string().trim().min(1).optional(),
});
