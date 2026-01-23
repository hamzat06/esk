import React from "react";
import { Skeleton } from "../ui/skeleton";

const TabsSkeleton = () => (
  <div className="flex gap-5 mb-5 sm:mb-6 justify-center">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <Skeleton key={i} className="h-10 sm:h-12 w-24 sm:w-32 rounded-full" />
    ))}
  </div>
);

export default TabsSkeleton;
