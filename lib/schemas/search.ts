import { z } from "zod";

export const SearchQuerySchema = z.object({
  search: z.string().trim().optional().default(""),
  sort: z.enum(["asc", "desc"]).optional().default("asc"),
  min: z.coerce.number().nonnegative().optional(),
  max: z.coerce.number().nonnegative().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().optional().default(3),
  categoryId: z.string().trim().min(1).optional(),
});

export type SearchQueryInput = z.infer<typeof SearchQuerySchema>;
