"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { Product } from "./types/product";
import { Category } from "../categories/types/category";
import useToggle from "@/hooks/useToggle";

import ContentTabs, { TabItem } from "../ContentTabs";
import ProductCard from "./ProductCard";
import ProductDetailsModal from "./ProductDetailsModal";
import { Soup } from "lucide-react";
import TabsSkeleton from "./TabsSkeleton";

interface ProductListProps {
  products: Product[];
  categories: Category[];
}

const ProductList = ({ products, categories }: ProductListProps) => {
  const dialog = useToggle(false);
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q")?.trim() ?? "";

  const [activeProduct, setActiveProduct] = useState<Product>();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );

  const activeCategoryId = selectedCategoryId ?? categories[0]?.id;

  function handleProduct(action?: "OPEN", item?: Product) {
    if (action === "OPEN" && item) {
      setActiveProduct(item);
      dialog.handleOpen();
    } else {
      setActiveProduct(undefined);
      dialog.handleClose();
    }
  }

  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (activeCategoryId) {
      filtered = filtered.filter((p) => p.category?.id === activeCategoryId);
    }

    if (searchQuery) {
      const exactMatches = filtered.filter(
        (p) => p.title.toLowerCase() === searchQuery.toLowerCase(),
      );
      if (exactMatches.length > 0) return exactMatches;

      return filtered.filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    return filtered;
  }, [products, searchQuery, activeCategoryId]);

  const categoriesTab: TabItem[] = categories.map((category) => ({
    label: category.title,
    value: category.id,
  }));

  return (
    <div className="bg-white py-6 sm:py-8">
      <div className="container mx-auto px-4 sm:px-5">
        {/* Categories */}
        <div className="mb-6 sm:mb-8">
          <Suspense fallback={<TabsSkeleton />}>
            <ContentTabs
              variant="fancy"
              tabs={categoriesTab}
              value={activeCategoryId}
              onValueChange={setSelectedCategoryId}
            />
          </Suspense>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((item) => (
              <ProductCard
                key={item.id}
                product={item}
                searchQuery={searchQuery}
                onClick={() => handleProduct("OPEN", item)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 sm:py-32 text-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Soup className="size-10 sm:size-12 text-gray-400" />
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">
              {searchQuery ? "No results found" : "Nothing here yet"}
            </h3>
            <p className="text-sm sm:text-base text-gray-500 max-w-sm">
              {searchQuery
                ? `We couldn't find any items matching "${searchQuery}"`
                : "No products available in this category"}
            </p>
          </div>
        )}

        <ProductDetailsModal
          product={activeProduct}
          open={dialog.isOpen}
          onClose={() => handleProduct()}
        />
      </div>
    </div>
  );
};

export default ProductList;
