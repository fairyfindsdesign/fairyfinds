import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

/**
 * Base shimmering skeleton block with luxury warm undertones
 */
export function Skeleton({ className = '', ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-shimmer rounded-xs ${className}`}
      {...props}
    />
  );
}

/**
 * Product Card Skeleton matching ProductCard.tsx
 */
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col bg-white rounded-xs p-1.5 sm:p-0">
      {/* 3:4 Aspect Ratio Image Box */}
      <Skeleton className="relative aspect-[3/4] w-full rounded-xs" />

      {/* Product Metadata */}
      <div className="pt-4 flex flex-col space-y-2">
        {/* Category tag */}
        <Skeleton className="h-3 w-16" />

        {/* Title */}
        <Skeleton className="h-4 w-4/5" />

        {/* Sizes summary */}
        <div className="flex items-center gap-1.5 pt-1">
          <Skeleton className="h-4 w-6" />
          <Skeleton className="h-4 w-6" />
          <Skeleton className="h-4 w-6" />
        </div>

        {/* Price */}
        <div className="pt-1.5">
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  );
}

/**
 * Responsive Product Grid Skeleton (Catalog & Collections)
 */
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 animate-fade-in-up">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Hero Section Skeleton matching HeroCarousel.tsx
 */
export function HeroSkeleton() {
  return (
    <div className="relative w-full min-h-[85vh] lg:min-h-[90vh] flex items-center justify-center bg-[#1A1A1A] overflow-hidden">
      <Skeleton className="absolute inset-0 bg-neutral-900 opacity-80" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
        <div className="max-w-2xl py-24 space-y-6 animate-fade-in-up">
          {/* Eyebrow Badge */}
          <Skeleton className="h-7 w-36 bg-neutral-800" />
          {/* Main Headline */}
          <div className="space-y-3">
            <Skeleton className="h-10 sm:h-14 w-full bg-neutral-800" />
            <Skeleton className="h-10 sm:h-14 w-3/4 bg-neutral-800" />
          </div>
          {/* Subtext */}
          <Skeleton className="h-4 w-5/6 bg-neutral-800" />
          {/* Buttons */}
          <div className="flex flex-wrap gap-4 pt-4">
            <Skeleton className="h-12 w-48 bg-neutral-800" />
            <Skeleton className="h-12 w-40 bg-neutral-800" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Horizontal Rail Section Skeleton (e.g. New Arrivals on Home)
 */
export function HorizontalRailSkeleton() {
  return (
    <div className="py-16 sm:py-20 bg-white border-b border-neutral-100 animate-fade-in-up">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div className="space-y-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 max-w-full" />
          </div>
          <div className="hidden sm:flex gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
        <div className="flex gap-4 sm:gap-6 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-[250px] sm:w-[280px] lg:w-[310px] shrink-0">
              <ProductCardSkeleton />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Product Detail Page Skeleton matching ProductDetailClient.tsx
 */
export function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 animate-fade-in-up">
      {/* Breadcrumbs */}
      <div className="flex gap-2 mb-8">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-4" />
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-4" />
        <Skeleton className="h-3 w-32" />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        {/* Gallery Column */}
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
          {/* Thumbnails */}
          <div className="flex sm:flex-col gap-3">
            <Skeleton className="w-16 h-20 sm:w-20 sm:h-24 shrink-0" />
            <Skeleton className="w-16 h-20 sm:w-20 sm:h-24 shrink-0" />
            <Skeleton className="w-16 h-20 sm:w-20 sm:h-24 shrink-0" />
          </div>
          {/* Main Photo */}
          <Skeleton className="relative aspect-[3/4] flex-1 rounded-xs" />
        </div>

        {/* Details Column */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          <div className="space-y-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-4/5" />
            <Skeleton className="h-6 w-32" />
          </div>

          <div className="space-y-2 pt-2">
            <Skeleton className="h-3 w-20" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-12" />
              <Skeleton className="h-10 w-12" />
              <Skeleton className="h-10 w-12" />
              <Skeleton className="h-10 w-12" />
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-neutral-200">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>

          <div className="space-y-2 pt-4 border-t border-neutral-100">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    </div>
  );
}
