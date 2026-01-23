"use client";

import SearchField from "@/components/SearchField";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "@/lib/queries/products";
import SearchFieldSkeleton from "../SearchSkeleton";

const SearchHeader = () => {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 2 * 60 * 1000,
  });

  if (isLoading)
    return <SearchFieldSkeleton wrapperClassName="sm:w-[400px] w-full" />;

  return (
    <SearchField
      products={products.map((p) => ({ title: p.title }))}
      placeholder="Search menu..."
      wrapperClassName="sm:w-[400px] w-full rounded-xl bg-white border-2 border-gray-200 h-11 sm:h-12 hover:border-gray-300 focus-within:border-primary transition-colors shadow-sm"
      inputClassName="placeholder:font-medium placeholder:text-gray-400 text-sm sm:text-base"
    />
  );
};

export default SearchHeader;
