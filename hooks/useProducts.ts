"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createProduct,
  deleteProduct,
  fetchProductById,
  fetchProducts,
  updateProduct,
} from "@/lib/http/products";
import type {
  ProductCreateInput,
  ProductQueryInput,
  ProductUpdateInput,
} from "@/lib/schemas/product";

export const productQueryKeys = {
  all: ["products"] as const,
  list: (params: Partial<ProductQueryInput>) =>
    ["products", "list", params] as const,
  detail: (id: string) => ["products", "detail", id] as const,
};

export function useProductsQuery(params: Partial<ProductQueryInput> = {}) {
  return useQuery({
    queryKey: productQueryKeys.list(params),
    queryFn: () => fetchProducts(params),
  });
}

export function useProductByIdQuery(id: string, enabled = true) {
  return useQuery({
    queryKey: productQueryKeys.detail(id),
    queryFn: () => fetchProductById(id),
    enabled: enabled && Boolean(id),
  });
}

export function useCreateProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProductCreateInput) => createProduct(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productQueryKeys.all });
    },
  });
}

export function useUpdateProductMutation(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProductUpdateInput) => updateProduct(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: productQueryKeys.detail(id) });
    },
  });
}

export function useDeleteProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productQueryKeys.all });
    },
  });
}

