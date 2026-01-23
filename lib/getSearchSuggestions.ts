import Fuse from "fuse.js";
import { Product } from "@/components/products/types/product";

export function getSearchSuggestions(
  products: Product[],
  query: string,
  limit = 5,
) {
  if (!query) return [];

  const fuse = new Fuse(products, {
    keys: ["title"],
    threshold: 0.4,
    ignoreLocation: true,
  });

  return fuse
    .search(query)
    .slice(0, limit)
    .map((r) => r.item.title);
}
