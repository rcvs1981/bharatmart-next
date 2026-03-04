import type { AxiosInstance } from "axios";

import { apiClient } from "@/lib/http/client";
import {
  ProductCreateInputSchema,
  ProductIdParamSchema,
  ProductListSchema,
  ProductQuerySchema,
  ProductSchema,
  ProductUpdateInputSchema,
  type ProductCreateInput,
  type ProductQueryInput,
  type ProductUpdateInput,
} from "@/lib/schemas/product";

function getClient(client?: AxiosInstance) {
  return client ?? apiClient;
}

export async function fetchProducts(
  params: Partial<ProductQueryInput> = {},
  client?: AxiosInstance
) {
  const parsedParams = ProductQuerySchema.parse(params);
  const { data } = await getClient(client).get("/products", {
    params: parsedParams,
  });
  return ProductListSchema.parse(data);
}

export async function fetchProductById(id: string, client?: AxiosInstance) {
  const parsedId = ProductIdParamSchema.parse({ id });
  const { data } = await getClient(client).get(`/products/${parsedId.id}`);
  return ProductSchema.parse(data);
}

export async function createProduct(
  input: ProductCreateInput,
  client?: AxiosInstance
) {
  const payload = ProductCreateInputSchema.parse(input);
  const { data } = await getClient(client).post("/products", payload);
  return ProductSchema.parse(data);
}

export async function updateProduct(
  id: string,
  input: ProductUpdateInput,
  client?: AxiosInstance
) {
  const parsedId = ProductIdParamSchema.parse({ id });
  const payload = ProductUpdateInputSchema.parse(input);
  const { data } = await getClient(client).put(`/products/${parsedId.id}`, payload);
  return ProductSchema.parse(data);
}

export async function deleteProduct(id: string, client?: AxiosInstance) {
  const parsedId = ProductIdParamSchema.parse({ id });
  const { data } = await getClient(client).delete(`/products/${parsedId.id}`);
  return ProductSchema.parse(data);
}

