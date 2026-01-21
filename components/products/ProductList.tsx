"use client";

import React, { useState } from "react";
import { Product } from "./types/product";
import Image from "next/image";
import { Button } from "../ui/button";
import { Plus, Soup } from "lucide-react";
import useToggle from "@/hooks/useToggle";
import ProductDetailsModal from "./ProductDetailsModal";
import ContentTabs, { TabItem } from "../ContentTabs";
import { fetchCategories } from "@/lib/queries/categories";
import { fetchProducts } from "@/lib/queries/products";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";

// Tab Skeleton Component
const TabsSkeleton = () => {
  return (
    <div className="flex gap-5 mb-6">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-10 sm:h-12 w-24 sm:w-32 rounded-full" />
      ))}
    </div>
  );
};

// Product Card Skeleton Component
const ProductCardSkeleton = () => {
  return (
    <div className="space-y-3">
      <Skeleton className="w-full aspect-square rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
};

// Products Grid Skeleton
const ProductsGridSkeleton = () => {
  return (
    <div className="container mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
};

const ProductList = () => {
  const dialog = useToggle(false);

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

  function handleProduct(action?: "OPEN", item?: Product) {
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
  }

  const filteredProducts = products.filter(
    (p) => p.category?.id === activeCategoryId,
  );

  const categoriesTab: TabItem[] = categories.map((category) => ({
    label: category.title,
    value: category.id,
  }));

  return (
    <div className="container mx-auto p-4 sm:p-5">
      {/* Tabs Section */}
      {categoriesLoading ? (
        <TabsSkeleton />
      ) : (
        <ContentTabs
          variant="fancy"
          tabs={categoriesTab}
          value={activeCategoryId}
          onValueChange={setSelectedCategoryId}
        />
      )}

      {/* Products Grid Section */}
      {productsLoading && products?.length < 1 ? (
        <ProductsGridSkeleton />
      ) : (
        <>
          <div className="container mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts?.length > 0 &&
              filteredProducts.map((item: Product) => (
                <div
                  className="sm:hover:cursor-pointer group"
                  key={item.id}
                  onClick={() => handleProduct("OPEN", item)}
                >
                  <div className="rounded-xl sm:h-75 overflow-hidden relative">
                    <Image
                      quality={85}
                      alt=""
                      src={item.image || "/assets/jollof-rice-chicken.jpg"}
                      width={300}
                      height={300}
                      className={`object-cover object-center size-full @container/product-image transition-transform delay-150 duration-300 group-hover:scale-110 ${
                        !item.in_stock && "grayscale"
                      }`}
                    />
                    {!item.in_stock && (
                      <Badge className="z-1 absolute right-2 sm:right-4 top-2 sm:top-4 bg-white text-red-500 font-semibold p-1.5 rounded-sm text-xs sm:text-sm">
                        Out of stock
                      </Badge>
                    )}
                    <Button
                      className="p-1.5 right-4 h-10 border border-white bottom-4 z-1 rounded-full absolute transition-transform hover:scale-110 duration-300 delay-150 sm:hover:cursor-pointer"
                      disabled={!item.in_stock}
                    >
                      <Plus className="size-4 sm:size-5" />
                      <span className="hidden sm:block">Add to cart</span>
                    </Button>
                  </div>
                  <div className="flex flex-col gap-1 py-3">
                    <h3 className="text-lg sm:text-xl font-semibold">
                      {item.title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-500 truncate">
                      {item.description}
                    </p>
                    <span className="text-xl sm:text-3xl font-semibold font-playfair">
                      $ {item.amount}
                    </span>
                  </div>
                </div>
              ))}
          </div>

          {/* Empty State - when products exist but filtered list is empty */}
          {products?.length > 0 && filteredProducts?.length === 0 && (
            <div className="text-center pt-10 pb-40">
              <Soup className="size-15 text-gray-400 mx-auto" />
              <p className="text-gray-400 text-lg font-medium capitalize">
                No products in this category
              </p>
            </div>
          )}

          {/* Empty State - when no products exist at all */}
          {products?.length === 0 && (
            <div className="text-center pt-10 pb-40">
              <Soup className="size-15 text-gray-400 mx-auto" />
              <p className="text-gray-400 text-lg font-medium capitalize">
                No products available
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
  );
};

export default ProductList;
