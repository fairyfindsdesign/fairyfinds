import React from 'react';

export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Top progress line */}
      <div className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FF55D2] via-[#FD00B9] to-[#FF55D2] z-[100] animate-pulse" />

      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-neutral-200 rounded-xs" />
          <div className="h-4 w-72 bg-neutral-200/70 rounded-xs" />
        </div>
        <div className="h-10 w-36 bg-neutral-200 rounded-xs" />
      </div>

      {/* Main Content Skeleton */}
      <div className="bg-white border border-neutral-200 p-6 space-y-4 rounded-xs shadow-xs">
        <div className="h-10 w-full sm:max-w-md bg-neutral-100 rounded-xs" />
        <div className="divide-y divide-neutral-100">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-12 bg-neutral-200 rounded-xs shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-1/3 bg-neutral-200 rounded-xs" />
                  <div className="h-3 w-1/4 bg-neutral-100 rounded-xs" />
                </div>
              </div>
              <div className="h-8 w-20 bg-neutral-100 rounded-xs shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
