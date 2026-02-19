# Migration Examples - Converting to React Query

Step-by-step examples of converting your existing components to use React Query.

## Example 1: Admin Products Page

### BEFORE (Server Component Only)

```typescript
// app/(admin)/admin/products/page.tsx
import { createClient } from "@/lib/supabase/server";
import ProductsManager from "@/components/admin/products/ProductsManager";
import { requirePermission } from "@/lib/auth/permissions";

export const revalidate = 30;

export default async function ProductsPage() {
  await requirePermission("products");

  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("*, category:categories(id, title)")
    .order("created_at", { ascending: false });

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("title", { ascending: true});

  return <ProductsManager initialProducts={products || []} categories={categories || []} />;
}
```

### AFTER (Hybrid with React Query)

```typescript
// app/(admin)/admin/products/page.tsx
import { createClient } from "@/lib/supabase/server";
import ProductsManagerClient from "@/components/admin/products/ProductsManagerClient";
import { requirePermission } from "@/lib/auth/permissions";

// Keep revalidate for SSR caching
export const revalidate = 30;

export default async function ProductsPage() {
  // Server-side auth check
  await requirePermission("products");

  const supabase = await createClient();

  // Fetch initial data (SSR)
  const { data: products } = await supabase
    .from("products")
    .select("*, category:categories(id, title)")
    .order("created_at", { ascending: false });

  // Pass to client component
  return <ProductsManagerClient initialData={products || []} />;
}
```

```typescript
// components/admin/products/ProductsManagerClient.tsx
"use client";

import { useAdminProducts } from "@/lib/hooks/useAdminProducts";
import { Button } from "@/components/ui/button";
import { ProductCard } from "./ProductCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface Product {
  id: string;
  title: string;
  // ... other fields
}

export default function ProductsManagerClient({
  initialData,
}: {
  initialData: Product[];
}) {
  const {
    products,
    isLoading,
    createProduct,
    updateProduct,
    deleteProduct,
    isCreating,
    isUpdating,
    isDeleting,
  } = useAdminProducts(initialData);

  if (isLoading && !products.length) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Products</h1>
        <Button
          onClick={() => {
            // Show create product dialog
            createProduct({
              title: "New Product",
              description: "",
              amount: 0,
              in_stock: true,
              category_id: "",
            });
          }}
          disabled={isCreating}
        >
          {isCreating ? "Creating..." : "Create Product"}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onUpdate={(data) => updateProduct({ id: product.id, data })}
            onDelete={() => deleteProduct(product.id)}
            isUpdating={isUpdating}
            isDeleting={isDeleting}
          />
        ))}
      </div>
    </div>
  );
}
```

## Example 2: Shop Products Page (Homepage)

### BEFORE

```typescript
// app/(shop)/page.tsx
import { createClient } from "@/lib/supabase/server";
import ProductGrid from "@/components/shop/ProductGrid";
import CategoryFilter from "@/components/shop/CategoryFilter";

export default async function ShopPage() {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("*, category:categories(id, title)")
    .eq("in_stock", true)
    .order("created_at", { ascending: false });

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("title", { ascending: true });

  return (
    <div>
      <CategoryFilter categories={categories || []} />
      <ProductGrid products={products || []} />
    </div>
  );
}
```

### AFTER

```typescript
// app/(shop)/page.tsx
import { createClient } from "@/lib/supabase/server";
import ShopClient from "@/components/shop/ShopClient";

export const revalidate = 60; // Cache for 1 minute

export default async function ShopPage() {
  const supabase = await createClient();

  // Fetch initial data (SSR)
  const [productsResult, categoriesResult] = await Promise.all([
    supabase
      .from("products")
      .select("*, category:categories(id, title)")
      .eq("in_stock", true)
      .order("created_at", { ascending: false }),
    supabase.from("categories").select("*").order("title", { ascending: true }),
  ]);

  return (
    <ShopClient
      initialProducts={productsResult.data || []}
      initialCategories={categoriesResult.data || []}
    />
  );
}
```

```typescript
// components/shop/ShopClient.tsx
"use client";

import { useState } from "react";
import { useShopProducts } from "@/lib/hooks/useShopProducts";
import { useShopCategories } from "@/lib/hooks/useShopCategories";
import { ProductGrid } from "./ProductGrid";
import { CategoryFilter } from "./CategoryFilter";

export default function ShopClient({ initialProducts, initialCategories }) {
  const { products, isLoading: productsLoading } = useShopProducts(initialProducts);
  const { categories, isLoading: categoriesLoading } = useShopCategories(initialCategories);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Filter products by category
  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category_id === selectedCategory)
    : products;

  if (productsLoading || categoriesLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="container mx-auto p-6">
      <CategoryFilter
        categories={categories}
        selected={selectedCategory}
        onChange={setSelectedCategory}
      />
      <ProductGrid products={filteredProducts} />
    </div>
  );
}
```

## Example 3: Admin Orders Page with Auto-Refresh

### AFTER (with auto-refresh every minute)

```typescript
// app/(admin)/admin/orders/page.tsx
import { createClient } from "@/lib/supabase/server";
import OrdersManagerClient from "@/components/admin/orders/OrdersManagerClient";
import { requirePermission } from "@/lib/auth/permissions";

export const revalidate = 30;

export default async function OrdersPage() {
  await requirePermission("orders");

  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("*, profile:profiles(full_name, email, phone)")
    .order("created_at", { ascending: false });

  return <OrdersManagerClient initialData={orders || []} />;
}
```

```typescript
// components/admin/orders/OrdersManagerClient.tsx
"use client";

import { useAdminOrders } from "@/lib/hooks/useAdminOrders";
import { OrderCard } from "./OrderCard";

export default function OrdersManagerClient({ initialData }) {
  // Auto-refetches every 60 seconds for new orders
  const { orders, isLoading } = useAdminOrders(initialData);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Orders</h1>
        <div className="text-sm text-gray-500">
          Auto-refreshing... {orders.length} orders
        </div>
      </div>

      {isLoading && !orders.length ? (
        <LoadingSkeleton />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
```

## Quick Migration Checklist

For each page you want to convert:

- [ ] **Keep server page** - Don't delete it!
- [ ] **Add permission check** - `await requirePermission(...)`
- [ ] **Fetch initial data** - Same as before
- [ ] **Create client component** - New file with `"use client"`
- [ ] **Use custom hook** - Pass initialData
- [ ] **Handle loading states** - `if (isLoading && !data.length)`
- [ ] **Add mutations** - For create/update/delete
- [ ] **Test navigation** - Should be instant!

## Performance Comparison

| Action | Before | After |
|--------|--------|-------|
| **First visit** | 200ms | 200ms (same, SSR) |
| **Navigate away** | - | - |
| **Navigate back** | 200ms (reload) | **50ms** (cached) ⚡ |
| **Update product** | 300ms | **Instant** (optimistic) ⚡ |
| **Create product** | 300ms | **Instant** (optimistic) ⚡ |

## Tips

1. **Always pass initialData** - Prevents double loading
2. **Keep SSR** - Fast first load + SEO
3. **Use optimistic updates** - Better UX
4. **Handle errors** - Toast notifications
5. **Show loading states** - User feedback

## Next Steps

1. Pick a page (start with products or shop)
2. Follow the migration example
3. Test in development
4. See instant navigation! 🚀

That's it! The hybrid approach gives you the best of both worlds.
