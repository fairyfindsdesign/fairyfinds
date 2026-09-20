'use client';

import React, { useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { CustomerReview } from '@/lib/types';

interface ReviewsMarqueeProps {
  reviews?: CustomerReview[];
  heading?: string;
  subtitle?: string;
  description?: string;
  badge?: string;
}

export default function ReviewsMarquee({
  heading = 'Cherished by Our Muses',
  subtitle,
  description = 'Authentic stories and 5-star Google experiences from patrons who celebrate their most treasured moments in our bespoke designs.',
  badge,
}: ReviewsMarqueeProps) {
  const badgeLabel = badge || subtitle || 'Google Reviews • 4.9 ★ Rating';

  useEffect(() => {
    const scriptSrc = 'https://widgets.sociablekit.com/google-reviews/widget.js';

    // 1. Check if SociableKit mount handler is already available from previous load
    const skMounts = (window as unknown as { sk_widget_mounts?: Record<string, () => void> })
      ?.sk_widget_mounts;
    if (skMounts && typeof skMounts['.sk-ww-google-reviews'] === 'function') {
      skMounts['.sk-ww-google-reviews']();
      return;
    }

    // 2. Ensure the SociableKit loader script is injected or re-executed if container is empty on navigation
    const existingScript = document.querySelector(`script[src^="${scriptSrc}"]`);
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = scriptSrc;
      script.defer = true;
      document.body.appendChild(script);
    } else {
      const container = document.querySelector('.sk-ww-google-reviews');
      if (container && container.children.length === 0) {
        existingScript.remove();
        const script = document.createElement('script');
        script.src = `${scriptSrc}?v=${Date.now()}`;
        script.defer = true;
        document.body.appendChild(script);
      }
    }
  }, []);

  return (
    <section className="py-14 sm:py-20 md:py-28 bg-[#FFFFFF] border-b border-neutral-200 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 md:mb-16">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 bg-[#FAF9F6] border border-neutral-200 text-[10px] sm:text-xs uppercase tracking-widest font-semibold text-neutral-800 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#FF55D2]" />
            <span>{badgeLabel}</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#1A1A1A] font-light tracking-tight">
            {heading}
          </h2>
          {description && (
            <p className="text-neutral-500 text-xs sm:text-sm font-light mt-3 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* SociableKit Live Google Reviews Widget Embed */}
        <div className="w-full min-h-[380px]">
          <div className="sk-ww-google-reviews" data-embed-id="25715388" />
          <script src="https://widgets.sociablekit.com/google-reviews/widget.js" defer></script>
        </div>
      </div>
    </section>
  );
}
