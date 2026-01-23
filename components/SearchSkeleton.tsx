"use client";

import { Skeleton } from "@/components/ui/skeleton";

interface SearchFieldSkeletonProps {
  wrapperClassName?: string;
  inputClassName?: string;
}

const SearchFieldSkeleton = ({
  wrapperClassName = "w-full",
  inputClassName = "h-11 sm:h-12",
}: SearchFieldSkeletonProps) => {
  return (
    <div className={`relative ${wrapperClassName}`}>
      <Skeleton className={`w-full rounded-xl ${inputClassName}`} />
    </div>
  );
};

export default SearchFieldSkeleton;
