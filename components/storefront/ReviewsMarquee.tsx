'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Star, Sparkles, Quote, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const mobileScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const updateMobileScrollState = useCallback(() => {
    const el = mobileScrollRef.current;
    if (!el) return;
    const tolerance = 8;
    const atStart = el.scrollLeft <= tolerance;
    const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - tolerance;

    setCanScrollLeft(!atStart);
    setCanScrollRight(!atEnd);

    const firstChild = el.firstElementChild as HTMLElement | null;
    const cardWidth = firstChild ? firstChild.offsetWidth + 14 : 230; // 14px is gap-3.5
    const index = Math.round(el.scrollLeft / cardWidth);
    setActiveIndex(Math.min(Math.max(0, index), visibleReviews.length - 1));
  }, [visibleReviews.length]);

  useEffect(() => {
    updateMobileScrollState();
    const handleResize = () => updateMobileScrollState();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateMobileScrollState]);

  const scrollMobile = (direction: 'left' | 'right') => {
    const el = mobileScrollRef.current;
    if (!el) return;
    const firstChild = el.firstElementChild as HTMLElement | null;
    const cardWidth = firstChild ? firstChild.offsetWidth + 14 : 230;
    el.scrollBy({
      left: direction === 'left' ? -cardWidth : cardWidth,
      behavior: 'smooth',
    });
  };

  const scrollToReview = (index: number) => {
    const el = mobileScrollRef.current;
    if (!el) return;
    const firstChild = el.firstElementChild as HTMLElement | null;
    const cardWidth = firstChild ? firstChild.offsetWidth + 14 : 230;
    el.scrollTo({
      left: index * cardWidth,
      behavior: 'smooth',
    });
  };

  if (visibleReviews.length === 0) {
    return null;
  }

  // Duplicate the reviews array to create an infinite, seamless loop for desktop marquee
  const marqueeItems = [...visibleReviews, ...visibleReviews];
  const badgeLabel = badge || subtitle || 'Client Voices & Atelier Love';

  return (
    <section className="py-12 sm:py-16 md:py-28 bg-[#FFFFFF] border-b border-neutral-200 overflow-hidden relative">
      {/* Editorial Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-6 sm:mb-10 md:mb-16">
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3.5 sm:py-1.5 bg-[#FAF9F6] border border-neutral-200 text-[10px] sm:text-xs uppercase tracking-widest font-semibold text-neutral-800 mb-2.5 sm:mb-3">
          <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#FF55D2]" />
          <span>{badgeLabel}</span>
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl md:text-5xl text-[#1A1A1A] font-light tracking-tight">
          {heading}
        </h2>
        {description && (
          <p className="text-neutral-500 text-xs sm:text-sm font-light mt-2 sm:mt-3 max-w-lg mx-auto px-2">
            {description}
          </p>
        )}
      </div>

      {/* Mobile Track (< md): Horizontal Touch-Scrollable with Prev/Next and Indicator Dots */}
      <div className="md:hidden">
        <div
          ref={mobileScrollRef}
          onScroll={updateMobileScrollState}
          className="flex gap-3.5 overflow-x-auto snap-x snap-mandatory px-4 pb-3 pt-1 no-scrollbar scroll-smooth"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {visibleReviews.map((review) => (
            <div key={review.id} className="snap-start shrink-0">
              <ReviewCard review={review} isCompact={true} />
            </div>
          ))}
        </div>

        {/* Mobile Navigation Bar with Active Indicator Dots and Chevrons */}
        <div className="flex items-center justify-between px-5 mt-3">
          {/* Active Dot Indicators */}
          <div className="flex items-center gap-1.5">
            {visibleReviews.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => scrollToReview(i)}
                aria-label={`Go to review ${i + 1}`}
                className={`transition-all duration-300 rounded-full ${
                  i === activeIndex
                    ? 'w-5 h-1.5 bg-[#FF55D2]'
                    : 'w-1.5 h-1.5 bg-neutral-300 hover:bg-neutral-400'
                }`}
              />
            ))}
          </div>

          {/* Touch navigation chevrons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => scrollMobile('left')}
              disabled={!canScrollLeft}
              aria-label="Previous review"
              className="w-8 h-8 flex items-center justify-center rounded-xs border border-neutral-300 bg-white text-[#1A1A1A] disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs active:scale-90 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollMobile('right')}
              disabled={!canScrollRight}
              aria-label="Next review"
              className="w-8 h-8 flex items-center justify-center rounded-xs border border-neutral-300 bg-white text-[#1A1A1A] disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs active:scale-90 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Track (>= md): Infinite Automated Smooth Marquee */}
      <div className="hidden md:block relative w-full overflow-hidden">
        {/* Left and Right Fade Overlays for Infinity Mask */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 lg:w-36 bg-gradient-to-r from-white via-white/80 to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 lg:w-36 bg-gradient-to-l from-white via-white/80 to-transparent z-10" />

        {/* Scrolling Track */}
        <div className="animate-marquee-slow flex gap-6 px-4">
          {marqueeItems.map((review, index) => (
            <ReviewCard key={`${review.id}-${index}`} review={review} isCompact={false} />
          ))}
        </div>
      </div>

      {/* Interactive Helper Subtext (Desktop) */}
      <div className="hidden md:block text-center mt-8">
        <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-medium">
          Hover card to pause
        </span>
      </div>
    </section>
  );
}

function ReviewCard({
  review,
  isCompact = false,
}: {
  review: CustomerReview;
  isCompact?: boolean;
}) {
  const [imgError, setImgError] = useState(false);
  const customerPhoto = review.image_url || review.avatar_url;

  if (isCompact) {
    return (
      <div className="w-[215px] xs:w-[230px] sm:w-[260px] shrink-0 bg-white border border-neutral-200/90 rounded-xs overflow-hidden flex flex-col hover:border-[#FF55D2]/50 shadow-2xs hover:shadow-md transition-all duration-300 select-none">
        {/* 1. Customer Wearing Product Photo */}
        <div className="relative w-full aspect-[4/5] h-52 xs:h-56 sm:h-64 bg-neutral-100 overflow-hidden shrink-0">
          {customerPhoto && !imgError ? (
            <Image
              src={customerPhoto}
              alt={`${review.customer_name} wearing ${review.product_name || 'Fairy Finds'}`}
              fill
              sizes="(max-width: 640px) 230px, 260px"
              className="object-cover object-top"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#FAF0F8] to-neutral-100 text-neutral-400 p-4 text-center">
              <span className="font-serif text-3xl font-light text-[#FF55D2] mb-1">
                {review.customer_name.charAt(0)}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-semibold">
                Boutique Muse
              </span>
            </div>
          )}

          {/* Vignette Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 via-35% to-transparent pointer-events-none" />

          {/* Top Badges */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10 pointer-events-none gap-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-black/60 backdrop-blur-md text-white text-[9px] uppercase tracking-wider font-semibold rounded-xs shadow-2xs shrink-0">
              <Sparkles className="w-2.5 h-2.5 text-[#FF55D2]" />
              <span>{review.tag || 'Muse'}</span>
            </span>

            {review.product_name && (
              <span className="inline-flex items-center px-2 py-0.5 bg-white/95 backdrop-blur-md text-neutral-900 text-[9px] font-medium tracking-tight rounded-xs truncate max-w-[110px] shadow-2xs">
                {review.product_name}
              </span>
            )}
          </div>

          {/* Customer Name & Location */}
          <div className="absolute bottom-2.5 left-3 right-3 z-10 text-white pointer-events-none">
            <div className="flex items-center gap-1">
              <h4 className="font-serif text-sm xs:text-base font-normal text-white drop-shadow-md tracking-wide truncate">
                {review.customer_name}
              </h4>
              <CheckCircle className="w-3.5 h-3.5 text-[#FF55D2] fill-[#FF55D2] shrink-0 drop-shadow-xs" />
            </div>
            {review.location && (
              <p className="text-[10px] text-white/80 font-light mt-0.5 drop-shadow-xs truncate">
                📍 {review.location}
              </p>
            )}
          </div>
        </div>

        {/* 2. Rating & Customer Comment */}
        <div className="p-3.5 xs:p-4 flex-1 flex flex-col justify-between bg-[#FAF9F6]">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < review.rating
                        ? 'text-[#FF55D2] fill-[#FF55D2]'
                        : 'text-neutral-300 fill-transparent'
                    }`}
                  />
                ))}
                <span className="ml-1.5 text-[11px] font-semibold text-neutral-800">
                  {review.rating}.0
                </span>
              </div>
              <Quote className="w-3.5 h-3.5 text-neutral-300" />
            </div>

            <p className="font-sans text-xs text-neutral-700 leading-snug font-normal italic line-clamp-3">
              &ldquo;{review.comment}&rdquo;
            </p>
          </div>

          {review.product_name && (
            <div className="mt-2.5 pt-2 border-t border-neutral-200/60 flex items-center justify-between text-[10px] text-neutral-500">
              <span className="font-light shrink-0">Wearing:</span>
              <span className="font-medium text-neutral-800 truncate ml-1 text-right">
                {review.product_name}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop Card
  return (
    <div className="w-[330px] md:w-[360px] shrink-0 bg-white border border-neutral-200/90 rounded-xs overflow-hidden flex flex-col hover:border-[#FF55D2]/50 hover:shadow-xl transition-all duration-500 group select-none">
      {/* 1. Customer Wearing Product Photo */}
      <div className="relative w-full aspect-[4/5] h-72 md:h-80 bg-neutral-100 overflow-hidden shrink-0">
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
            &ldquo;{review.comment}&rdquo;
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

