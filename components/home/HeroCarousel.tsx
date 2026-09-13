'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HomepageSection, HeroSlide } from '@/lib/types';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, Pause, Play } from 'lucide-react';

interface HeroCarouselProps {
  section: HomepageSection;
}

export default function HeroCarousel({ section }: HeroCarouselProps) {
  // Extract slides or build default fallback
  const rawSlides = section.content?.slides;
  const slides: HeroSlide[] =
    rawSlides && rawSlides.length > 0
      ? rawSlides
      : [
          {
            id: 'slide-default',
            heading: section.content.heading || 'Artisanal Elegance, Crafted for the Modern Muse',
            badge: section.content.badge || 'New Season 2026',
            description:
              section.content.description ||
              'Discover curated ready-to-wear silhouettes and bespoke couture tailored exclusively to your measurements.',
            button_text: section.content.button_text || 'Explore Ready-to-Wear',
            button_link: section.content.button_link || '/shop',
            secondary_button_text: section.content.secondary_button_text || 'Custom Tailoring',
            secondary_button_link: section.content.secondary_button_link || '/custom',
            image_url:
              section.content.image_url ||
              'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1600',
          },
        ];

  const autoplayInterval = section.content?.autoplay_interval || 5500;

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToSlide = (idx: number) => {
    setActiveIndex(idx);
  };

  // Autoplay effect
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      nextSlide();
    }, autoplayInterval);

    return () => clearInterval(timer);
  }, [slides.length, isPaused, autoplayInterval, nextSlide]);

  // Touch Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    setIsPaused(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    touchStartXRef.current = null;
    setIsPaused(false);
  };

  return (
    <div className="w-full bg-[#1A1A1A] overflow-hidden -mt-16 sm:-mt-20">
      <section
        className="relative w-full max-w-[1920px] mx-auto min-h-[600px] sm:min-h-[720px] lg:h-[1080px] lg:min-h-[1080px] flex items-center justify-center overflow-hidden bg-[#1A1A1A] select-none"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        aria-label="Homepage Featured Carousel"
      >
        {/* Background Slides */}
        {slides.map((slide, idx) => {
          const isActive = idx === activeIndex;

          return (
            <div
              key={slide.id || idx}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
              }`}
              aria-hidden={!isActive}
            >
              {/* Background Image */}
              <div className="absolute inset-0 overflow-hidden">
                <Image
                  src={slide.image_url}
                  alt={slide.heading}
                  fill
                  priority={idx === 0}
                  sizes="(max-width: 1920px) 100vw, 1920px"
                  className={`object-cover object-center filter brightness-[0.93] transition-transform duration-[8000ms] ease-out ${
                    isActive ? 'scale-105' : 'scale-100'
                  }`}
                />
              </div>

              {/* Dark Editorial Vignette Overlays */}
              <div className="absolute inset-0 bg-black/35" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/60" />

              {/* Slide Content Container - Centered Vertically & Horizontally */}
              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full h-full min-h-[600px] sm:min-h-[720px] lg:min-h-[1080px] flex items-center justify-center z-20 text-center py-20 sm:py-24">
                <div className="max-w-2xl flex flex-col items-center text-center space-y-3.5 sm:space-y-4">
                {/* Eyebrow Badge */}
                {slide.badge && (
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-black/50 backdrop-blur-md border border-white/25 text-[11px] uppercase tracking-widest font-semibold text-[#FF55D2] rounded-xs animate-in fade-in slide-in-from-bottom-2 duration-500 shadow-md">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{slide.badge}</span>
                  </div>
                )}

                {/* Main Headline - Centered, 32px */}
                <h1 className="font-serif text-[26px] sm:text-[32px] text-white font-normal leading-snug tracking-tight max-w-xl mx-auto gsap-hero-title animate-in fade-in duration-700 drop-shadow-md">
                  {slide.heading}
                </h1>

                {/* Narrative Description under Headline */}
                {slide.description && (
                  <p className="text-neutral-200 text-xs sm:text-sm md:text-[15px] leading-relaxed font-light max-w-lg mx-auto gsap-hero-subtitle animate-in fade-in duration-800 drop-shadow-sm">
                    {slide.description}
                  </p>
                )}

                {/* Dual Action CTAs after Description */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5 gsap-hero-cta animate-in fade-in duration-900 w-full sm:w-auto">
                  {slide.button_text && (
                    <Link
                      href={slide.button_link || '/shop'}
                      className="w-full sm:w-auto px-8 py-3.5 bg-[#FF55D2] hover:bg-[#FD00B9] text-white text-xs uppercase tracking-widest font-semibold transition-all shadow-xl flex items-center justify-center gap-2 rounded-xs active:scale-95"
                    >
                      <span>{slide.button_text}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}

                  {slide.secondary_button_text && (
                    <Link
                      href={slide.secondary_button_link || '/custom'}
                      className="w-full sm:w-auto px-8 py-3.5 bg-black/40 hover:bg-black/60 text-white border border-white/30 hover:border-white text-xs uppercase tracking-widest font-semibold transition-all backdrop-blur-md text-center rounded-xs active:scale-95 shadow-md"
                    >
                      <span>{slide.secondary_button_text}</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-black/70 text-white border border-white/20 backdrop-blur-md flex items-center justify-center active:scale-90 transition-all cursor-pointer shadow-lg hover:border-[#FF55D2]"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-black/70 text-white border border-white/20 backdrop-blur-md flex items-center justify-center active:scale-90 transition-all cursor-pointer shadow-lg hover:border-[#FF55D2]"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Bottom Controls Bar: Slide Indicators & Numbers */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 sm:bottom-8 inset-x-0 z-30 flex items-center justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pointer-events-none">
          {/* Slide Indicator Dashes */}
          <div className="flex items-center gap-2 pointer-events-auto">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => goToSlide(idx)}
                className={`h-1.5 transition-all duration-300 rounded-full cursor-pointer ${
                  idx === activeIndex
                    ? 'w-8 bg-[#FF55D2] shadow-xs'
                    : 'w-2.5 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Slide Numbers & Pause/Play Indicator */}
          <div className="flex items-center gap-3 text-white/80 font-mono text-xs tracking-widest pointer-events-auto bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            <button
              type="button"
              onClick={() => setIsPaused(!isPaused)}
              className="hover:text-[#FF55D2] transition-colors"
              title={isPaused ? 'Resume autoplay' : 'Pause autoplay'}
              aria-label={isPaused ? 'Resume autoplay' : 'Pause autoplay'}
            >
              {isPaused ? <Play className="w-3 h-3 text-[#FF55D2]" /> : <Pause className="w-3 h-3" />}
            </button>
            <span>
              {String(activeIndex + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
            </span>
          </div>
        </div>
      )}
    </section>
    </div>
  );
}
