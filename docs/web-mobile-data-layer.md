# Web + Mobile Data Layer (Next.js 16, React 19, TypeScript)

This project now uses one shared contract and request layer:

1. `zod` schemas: `lib/schemas/product.ts`
2. shared `axios` client: `lib/http/client.ts`
3. typed API methods: `lib/http/products.ts`
4. React Query hooks: `hooks/useProducts.ts`
5. server actions for web admin: `app/(back-office)/dashboard/(catalogue)/products/actions.ts`
6. route handlers for external/mobile clients: `app/api/products/*`

## Web usage (Next.js)

```tsx
"use client";
import { useProductsQuery } from "@/hooks/useProducts";

export function ProductsList() {
  const { data, isLoading, error } = useProductsQuery({ page: 1, pageSize: 12 });
  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Failed to load products</p>;

  return (
    <ul>
      {data?.map((product) => (
        <li key={product.id}>{product.title}</li>
      ))}
    </ul>
  );
}
```

## Mobile usage (React Native / Expo)

```ts
import { createApiClient } from "@/lib/http/client";
import { fetchProducts } from "@/lib/http/products";

const mobileApi = createApiClient("https://your-domain.com");

const products = await fetchProducts({ page: 1, pageSize: 20 }, mobileApi);
```

For mobile, use only route handlers (`/api/...`), not server actions.
