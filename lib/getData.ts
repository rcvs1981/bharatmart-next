import { ZodType } from "zod";

import { apiClient } from "@/lib/http/client";

function normalizeEndpoint(endpoint: string) {
  const withLeadingSlash = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return withLeadingSlash.replace(/^\/api\//, "/");
}

export async function getData<T = unknown>(
  endpoint: string,
  schema?: ZodType<T>
): Promise<T> {
  const normalizedEndpoint = normalizeEndpoint(endpoint);
  const { data } = await apiClient.get<unknown>(normalizedEndpoint, {
    headers: {
      "Cache-Control": "no-store",
    },
  });

  if (schema) return schema.parse(data);
  return data as T;
}
