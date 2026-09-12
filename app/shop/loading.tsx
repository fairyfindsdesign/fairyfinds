import React from 'react';
import { Skeleton, ProductGridSkeleton } from '@/components/ui/Skeleton';

export default function ShopLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 animate-fade-in-up">
      {/* Editorial Header Skeleton */}
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
        <Skeleton className="h-3 w-32 mx-auto" />
        <Skeleton className="h-9 sm:h-12 w-3/4 mx-auto" />
        <Skeleton className="h-4 w-full mx-auto" />
      </div>

      {/* Category Pills Skeleton */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
        <Skeleton className="h-9 w-20 rounded-full" />
        <Skeleton className="h-9 w-28 rounded-full" />
        <Skeleton className="h-9 w-28 rounded-full" />
        <Skeleton className="h-9 w-24 rounded-full" />
        <Skeleton className="h-9 w-24 rounded-full" />
      </div>

      {/* Products Grid Skeleton */}
      <ProductGridSkeleton count={8} />
    </div>
  );
}
