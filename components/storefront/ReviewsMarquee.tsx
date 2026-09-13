'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Star, Sparkles, Quote, CheckCircle } from 'lucide-react';
import { CustomerReview } from '@/lib/types';

interface ReviewsMarqueeProps {
  reviews: CustomerReview[];
  heading?: string;
  subtitle?: string;
  description?: string;
  badge?: string;
}

export default function ReviewsMarquee({
  reviews,
  heading = 'Cherished by Our Muses',
  subtitle,
  description = 'Authentic stories from patrons who have celebrated their most treasured moments in our artisanal silks and bespoke garments.',
  badge,
}: ReviewsMarqueeProps) {
  const visibleReviews = (reviews || []).filter((r) => r.is_visible);

  if (visibleReviews.length === 0) {
    return null;
  }

  // Duplicate the reviews array to create an infinite, seamless loop
  const marqueeItems = [...visibleReviews, ...visibleReviews];
  const badgeLabel = badge || subtitle || 'Client Voices & Atelier Love';

  return (
    <section className="py-20 md:py-28 bg-[#FFFFFF] border-b border-neutral-200 overflow-hidden relative">
      {/* Editorial Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#FAF9F6] border border-neutral-200 text-xs uppercase tracking-widest font-semibold text-neutral-800 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-[#FF55D2]" />
          <span>{badgeLabel}</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#1A1A1A] font-light tracking-tight">
          {heading}
        </h2>
        {description && (
          <p className="text-neutral-500 text-xs sm:text-sm font-light mt-3 max-w-lg mx-auto">
            {description}
          </p>
        )}
      </div>

      {/* Marquee Scroller Container with Edge Gradient Fades */}
      <div className="relative w-full overflow-hidden">
        {/* Left and Right Fade Overlays for Infinity Mask */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-36 bg-gradient-to-r from-white via-white/80 to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-36 bg-gradient-to-l from-white via-white/80 to-transparent z-10" />

        {/* Scrolling Track */}
        <div className="animate-marquee-slow flex gap-6 px-4">
          {marqueeItems.map((review, index) => (
            <ReviewCard key={`${review.id}-${index}`} review={review} />
          ))}
        </div>
      </div>

      {/* Interactive Helper Subtext */}
      <div className="text-center mt-8">
        <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-medium">
          Hover or tap any card to pause
        </span>
      </div>
    </section>
  );
}

function ReviewCard({ review }: { review: CustomerReview }) {
  const [imgError, setImgError] = useState(false);
  const customerPhoto = review.image_url || review.avatar_url;

  return (
    <div className="w-[290px] sm:w-[350px] md:w-[370px] shrink-0 bg-white border border-neutral-200/90 rounded-xs overflow-hidden flex flex-col hover:border-[#FF55D2]/50 hover:shadow-xl transition-all duration-500 group select-none">
      {/* 1. Customer Wearing Product Photo */}
      <div className="relative w-full aspect-[4/5] sm:h-80 bg-neutral-100 overflow-hidden shrink-0">
        {customerPhoto && !imgError ? (
          <Image
            src={customerPhoto}
            alt={`${review.customer_name} wearing ${review.product_name || 'Fairy Finds'}`}
            fill
            sizes="(max-width: 640px) 290px, 370px"
            className="object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#FAF0F8] to-neutral-100 text-neutral-400 p-6 text-center">
            <span className="font-serif text-4xl font-light text-[#FF55D2] mb-1">
              {review.customer_name.charAt(0)}
            </span>
            <span className="text-xs uppercase tracking-widest text-neutral-500 font-semibold">
              Boutique Muse
            </span>
          </div>
        )}

        {/* Soft Vignette Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 via-30% to-transparent pointer-events-none" />

        {/* Floating Top Badge: Product Worn / Verified Muse */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
          {review.tag ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] uppercase tracking-wider font-semibold rounded-xs shadow-xs">
              <Sparkles className="w-3 h-3 text-[#FF55D2]" />
              <span>{review.tag}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] uppercase tracking-wider font-semibold rounded-xs shadow-xs">
              <Sparkles className="w-3 h-3 text-[#FF55D2]" />
              <span>Boutique Muse</span>
            </span>
          )}

          {review.product_name && (
            <span className="ml-auto inline-flex items-center px-2.5 py-0.5 bg-white/95 backdrop-blur-md text-neutral-900 text-[10px] font-medium tracking-tight rounded-xs truncate max-w-[160px] shadow-xs">
              {review.product_name}
            </span>
          )}
        </div>

        {/* Customer Name & Location Overlay on Photo */}
        <div className="absolute bottom-3.5 left-4 right-4 z-10 text-white pointer-events-none">
          <div className="flex items-center gap-1.5">
            <h4 className="font-serif text-lg sm:text-xl font-normal text-white drop-shadow-md tracking-wide truncate">
              {review.customer_name}
            </h4>
            <span title="Verified Customer">
              <CheckCircle className="w-4 h-4 text-[#FF55D2] fill-[#FF55D2] shrink-0 drop-shadow-xs" />
            </span>
          </div>
          {review.location && (
            <p className="text-xs text-white/80 font-light mt-0.5 drop-shadow-xs">
              📍 {review.location}
            </p>
          )}
        </div>
      </div>

      {/* 2. Rating & Customer Comment */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between bg-[#FAF9F6]">
        <div>
          {/* Star Rating & Quote Icon */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < review.rating
                      ? 'text-[#FF55D2] fill-[#FF55D2]'
                      : 'text-neutral-300 fill-transparent'
                  }`}
                />
              ))}
              <span className="ml-2 text-xs font-semibold text-neutral-800">
                {review.rating}.0
              </span>
            </div>
            <Quote className="w-4 h-4 text-neutral-300 group-hover:text-[#FF55D2]/50 transition-colors" />
          </div>

          {/* Customer Testimonial Comment */}
          <p className="font-sans text-xs sm:text-sm text-neutral-700 leading-relaxed font-normal italic">
            "{review.comment}"
          </p>
        </div>

        {/* Product Worn Footer Indicator */}
        {review.product_name && (
          <div className="mt-4 pt-3 border-t border-neutral-200/60 flex items-center justify-between text-[11px] text-neutral-500">
            <span className="font-light">Wearing:</span>
            <span className="font-medium text-neutral-800 truncate ml-1">
              {review.product_name}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
