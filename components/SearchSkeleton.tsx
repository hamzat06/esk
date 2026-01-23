// SearchFieldSkeleton.tsx
"use client";

import React from "react";
import { SearchIcon } from "lucide-react";

interface SearchFieldSkeletonProps {
  wrapperClassName?: string;
}

const SearchFieldSkeleton = ({
  wrapperClassName,
}: SearchFieldSkeletonProps) => {
  return (
    <div className={`relative ${wrapperClassName}`}>
      {/* Input background */}
      <div className="flex items-center gap-2 bg-gray-200 rounded-xl h-11 sm:h-12 px-4 animate-pulse">
        {/* Search Icon */}
        <SearchIcon className="size-4 sm:size-5 text-gray-400" />

        {/* Placeholder shimmer */}
        <div className="flex-1 h-5 bg-gray-300 rounded-md" />
      </div>

      {/* Suggestions box */}
      <div className="absolute w-full mt-2 rounded-xl overflow-hidden shadow-lg">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-2 px-4 py-3 bg-gray-200 animate-pulse rounded-t-md last:rounded-b-md"
          >
            <SearchIcon className="size-4 text-gray-400" />
            <div className="h-4 bg-gray-300 rounded w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchFieldSkeleton;
