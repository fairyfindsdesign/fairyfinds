import React from 'react';
import { HeroSkeleton, HorizontalRailSkeleton } from '@/components/ui/Skeleton';

export default function GlobalLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero placeholder */}
      <HeroSkeleton />

      {/* Featured Rail placeholder */}
      <HorizontalRailSkeleton />
    </div>
  );
}
