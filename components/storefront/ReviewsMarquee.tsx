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

  // Helper to extract initials for avatar fallback
  const initials = review.customer_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="w-[280px] sm:w-[380px] shrink-0 bg-[#FAF9F6] border border-neutral-200/90 p-5 sm:p-7 rounded-xs flex flex-col justify-between hover:border-[#FF55D2]/50 hover:shadow-md transition-all duration-300 group">
      {/* Top Card: Rating Stars & Quote Icon */}
      <div>
        <div className="flex items-center justify-between mb-4">
          {/* Star Rating */}
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
          </div>

          <Quote className="w-5 h-5 text-neutral-300 group-hover:text-[#FF55D2]/40 transition-colors" />
        </div>

        {/* Comment Body */}
        <p className="font-sans text-sm sm:text-base text-neutral-700 leading-relaxed font-normal">
          "{review.comment}"
        </p>
      </div>

      {/* Bottom Card: Customer Profile */}
      <div className="pt-6 mt-6 border-t border-neutral-200/60 flex items-center gap-3.5">
        {/* Profile Avatar */}
        <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 border border-neutral-200 bg-white ring-2 ring-[#FF55D2]/20">
          {review.avatar_url && !imgError ? (
            <Image
              src={review.avatar_url}
              alt={review.customer_name}
              fill
              sizes="44px"
              className="object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#FAF0F8] text-[#FF55D2] font-semibold text-xs tracking-wider font-sans">
              {initials}
            </div>
          )}
        </div>

        {/* Customer Details */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h4 className="font-sans text-sm font-semibold text-[#1A1A1A] truncate">
              {review.customer_name}
            </h4>
            <span title="Verified Customer">
              <CheckCircle className="w-3 h-3 text-[#FF55D2] shrink-0" />
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 font-light truncate">
            {review.tag && (
              <span className="text-neutral-600 font-medium">{review.tag}</span>
            )}
            {review.tag && review.location && <span>•</span>}
            {review.location && <span>{review.location}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
