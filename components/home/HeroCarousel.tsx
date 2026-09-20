'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { HomepageSection, HeroSlide } from '@/lib/types';
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

interface HeroCarouselProps {
  section: HomepageSection;
}

export default function HeroCarousel({ section }: HeroCarouselProps) {
  const shouldReduceMotion = useReducedMotion();

  // Extract slides or build fallback
  const rawSlides = section.content?.slides;
  const slides: HeroSlide[] =
    rawSlides && rawSlides.length > 0
      ? rawSlides
      : [
          {
            id: 'slide-1',
            heading: section.content.heading || 'Dress For Your Moment',
            badge: section.content.badge || 'New Season 2026',
            description:
              section.content.description ||
              'Handmade dresses and sarees tailored for everyday elegance and celebrations in Kottayam, Kerala.',
            button_text: section.content.button_text || 'Shop the Collection',
            button_link: section.content.button_link || '/shop',
            secondary_button_text: 'Custom Orders',
            secondary_button_link: '/custom',
            image_url:
              section.content.image_url ||
              'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1600',
            text_color: 'light',
            text_position: 'left',
          },
          {
            id: 'slide-2',
            heading: 'Festive Silks & Sarees',
            badge: 'Signature Pieces',
            description: 'Quality fabrics and rich colors designed to make your special moments memorable.',
            button_text: 'View Sarees',
            button_link: '/shop?category=sarees',
            secondary_button_text: 'Chat With Us',
            secondary_button_link: 'https://wa.me/916282629144',
            image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1600',
            text_color: 'light',
            text_position: 'right',
          },
          {
            id: 'slide-3',
            heading: 'Made Just For You',
            badge: 'Custom Fitting',
            description: 'Share your ideas with us on WhatsApp and get an outfit made to your exact measurements.',
            button_text: 'Start Custom Order',
            button_link: '/custom',
            secondary_button_text: 'View Showcase',
            secondary_button_link: '/custom#showcase',
            image_url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=1600',
            text_color: 'light',
            text_position: 'center',
          },
        ];

  const autoplayInterval = section.content?.autoplay_interval || 6000;

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

    if (Math.abs(diff) > 45) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    touchStartXRef.current = null;
    setIsPaused(false);
  };

  const currentSlide = slides[activeIndex];
  const position = currentSlide.text_position || 'left';

  return (
    <div className="w-full bg-neutral-100 overflow-hidden -mt-16 sm:-mt-20">
      <section
        className="relative w-full max-w-[1920px] mx-auto h-[82vh] min-h-[580px] max-h-[860px] flex items-center overflow-hidden bg-neutral-100 select-none"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        aria-label="Featured Fashion Collection"
      >
        {/* Background Slide with Smooth Motion Crossfade */}
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentSlide.id || activeIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: shouldReduceMotion ? 0.2 : 0.8,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            className="absolute inset-0"
          >
            {/* Natural, Vibrant Background Image - Pure, Zero Black Overlay */}
            <motion.div
              initial={shouldReduceMotion ? {} : { scale: 1.04 }}
              animate={shouldReduceMotion ? {} : { scale: 1.0 }}
              transition={{
                duration: 7,
                ease: 'easeOut',
              }}
              className="absolute inset-0"
            >
              <Image
                src={currentSlide.image_url}
                alt={currentSlide.heading || 'Fairy Finds Boutique'}
                fill
                priority
                sizes="(max-width: 1920px) 100vw, 1920px"
                className="object-cover object-center"
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Content Container - Only CTA Button */}
        <div className="absolute inset-x-0 bottom-20 sm:bottom-24 z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pointer-events-none">
          <div
            className={`flex w-full ${
              position === 'left'
                ? 'justify-start'
                : position === 'right'
                ? 'justify-end'
                : 'justify-center'
            }`}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide.id || activeIndex}
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="pointer-events-auto flex flex-wrap items-center gap-3.5"
              >
                {currentSlide.button_text && (
                  <Link
                    href={currentSlide.button_link || '/shop'}
                    className="min-h-[48px] px-8 py-3.5 bg-[#FF55D2] hover:bg-[#FD00B9] active:bg-[#D5009C] text-white text-xs uppercase tracking-widest font-semibold transition-all duration-500 shadow-xl flex items-center justify-center gap-2 rounded-xs active:scale-95 hover:shadow-2xl hover:scale-105"
                  >
                    <span>{currentSlide.button_text}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}

                {currentSlide.secondary_button_text && (
                  <Link
                    href={currentSlide.secondary_button_link || '/custom'}
                    className="min-h-[48px] px-7 py-3.5 text-xs uppercase tracking-widest font-semibold transition-all duration-500 bg-white/95 hover:bg-white text-neutral-900 border border-neutral-200 shadow-xl backdrop-blur-xs rounded-xs active:scale-95 hover:shadow-2xl hover:scale-105"
                  >
                    <span>{currentSlide.secondary_button_text}</span>
                  </Link>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation Arrows (Touch friendly, 44px+) */}
        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevSlide}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/80 hover:bg-white text-neutral-900 border border-neutral-200/80 backdrop-blur-md flex items-center justify-center active:scale-90 transition-all duration-500 cursor-pointer shadow-lg hover:border-[#FF55D2]"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/80 hover:bg-white text-neutral-900 border border-neutral-200/80 backdrop-blur-md flex items-center justify-center active:scale-90 transition-all duration-500 cursor-pointer shadow-lg hover:border-[#FF55D2]"
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
            <div className="flex items-center gap-2 pointer-events-auto bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => goToSlide(idx)}
                  className={`h-1.5 transition-all duration-500 rounded-full cursor-pointer ${
                    idx === activeIndex
                      ? 'w-8 bg-[#FF55D2] shadow-xs'
                      : 'w-2.5 bg-white/70 hover:bg-white'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Slide Numbers & Pause/Play Indicator */}
            <div className="flex items-center gap-3 text-neutral-800 font-mono text-xs tracking-widest pointer-events-auto bg-white/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-neutral-200/80 shadow-md">
              <button
                type="button"
                onClick={() => setIsPaused(!isPaused)}
                className="hover:text-[#FF55D2] transition-colors duration-500 cursor-pointer"
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
