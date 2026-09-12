import React from 'react';
import { Skeleton, ProductGridSkeleton } from '@/components/ui/Skeleton';

export default function CollectionLoading() {
  return (
    <div className="animate-fade-in-up">
      {/* Editorial Collection Hero Skeleton */}
      <div className="relative py-24 md:py-32 bg-[#1A1A1A] text-white overflow-hidden">
        <Skeleton className="absolute inset-0 bg-neutral-900 opacity-60" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4 z-10">
          <Skeleton className="h-3 w-28 mx-auto bg-neutral-800" />
          <Skeleton className="h-10 sm:h-14 w-3/5 mx-auto bg-neutral-800" />
          <Skeleton className="h-4 w-4/5 mx-auto bg-neutral-800" />
        </div>
      </div>

      {/* Products Grid Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <ProductGridSkeleton count={6} />
      </div>
    </div>
  );
}
