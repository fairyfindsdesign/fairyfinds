import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { ArrowRight, Compass } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Page Not Found | Fairy Finds Boutique',
  description: 'The requested page could not be found. Discover ready-to-wear fashion, designer sarees, and custom tailoring at Fairy Finds Boutique in Kottayam, Kerala.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20 bg-[#FFFFFF]">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#FAF9F6] border border-neutral-200 text-[#FF55D2] mx-auto">
          <Compass className="w-8 h-8 stroke-1" />
        </div>

        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.25em] text-[#FF55D2] font-semibold">
            Error 404 • Page Not Found
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1A1A1A] font-light">
            Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 font-light leading-relaxed">
            The page you are looking for may have moved, been renamed, or is temporarily unavailable. Let us guide you back to our boutique collections.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <Link
            href="/shop"
            className="w-full sm:w-auto px-7 py-3 bg-[#FF55D2] hover:bg-[#FD00B9] text-white text-xs uppercase tracking-widest font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <span>Shop Outfits</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/custom"
            className="w-full sm:w-auto px-7 py-3 border border-neutral-300 hover:border-black text-[#1A1A1A] text-xs uppercase tracking-widest font-medium transition-colors text-center"
          >
            Custom Tailoring
          </Link>
        </div>

        <div className="pt-4 border-t border-neutral-100">
          <Link
            href="/"
            className="text-xs text-neutral-500 hover:text-black transition-colors inline-flex items-center gap-1 font-light"
          >
            ← Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
