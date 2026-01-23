"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

import { Product } from "./types/product";
import useToggle from "@/hooks/useToggle";
import { fetchCategories } from "@/lib/queries/categories";
import { fetchProducts } from "@/lib/queries/products";

import ContentTabs, { TabItem } from "../ContentTabs";
import ProductCard from "./ProductCard";
import ProductDetailsModal from "./ProductDetailsModal";
import { Soup } from "lucide-react";
import ProductsGridSkeleton from "./ProductsGridSkeleton";
import TabsSkeleton from "./TabsSkeleton";

const ProductList = () => {
  const dialog = useToggle(false);
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q")?.trim() ?? "";

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 10 * 60 * 1000,
  });

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 2 * 60 * 1000,
  });

  const [activeProduct, setActiveProduct] = useState<Product>();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );

  const activeCategoryId = selectedCategoryId ?? categories[0]?.id;

  const handleProduct = (action?: "OPEN", item?: Product) => {
    switch (action) {
      case "OPEN":
        setActiveProduct(item!);
        dialog.handleOpen();
        break;
      default:
        setActiveProduct(undefined);
        dialog.handleClose();
        break;
    }
  };

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

      filtered = filtered.filter((p) =>
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
        {categoriesLoading ? (
          <TabsSkeleton />
        ) : (
          <div className="mb-6 sm:mb-8">
            <ContentTabs
              variant="fancy"
              tabs={categoriesTab}
              value={activeCategoryId}
              onValueChange={setSelectedCategoryId}
            />
          </div>
        )}

        {/* Products Grid */}
        {productsLoading && products.length === 0 ? (
          <ProductsGridSkeleton />
        ) : (
          <>
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

            {/* Empty State - No Results */}
            {products.length > 0 && filteredProducts.length === 0 && (
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

            {/* Empty State - No Products */}
            {products.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 sm:py-32 text-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <Soup className="size-10 sm:size-12 text-gray-400" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">
                  No products available
                </h3>
                <p className="text-sm sm:text-base text-gray-500 max-w-sm">
                  Check back later for delicious items
                </p>
              </div>
            )}
          </>
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