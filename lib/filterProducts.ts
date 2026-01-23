import { Product } from "@/components/products/types/product";

export function filterProducts(
  products: Product[],
  searchQuery: string,
  activeCategoryId?: string | null
): Product[] {
  let filtered = products;

  if (activeCategoryId) {
    filtered = filtered.filter(p => p.category?.id === activeCategoryId);
  }

  if (searchQuery) {
    const exactMatch = filtered.filter(
      p => p.title.toLowerCase() === searchQuery.toLowerCase()
    );

    if (exactMatch.length > 0) {
      return exactMatch;
    }

    return filtered.filter(p =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  return filtered;
}
