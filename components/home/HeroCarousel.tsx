'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { HomepageSection, HeroSlide } from '@/lib/types';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, Pause, Play } from 'lucide-react';

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
  const isDarkText = currentSlide.text_color === 'dark';
  const position = currentSlide.text_position || 'left';

  return (
    <div className="w-full bg-[#141414] overflow-hidden -mt-16 sm:-mt-20">
      <section
        className="relative w-full max-w-[1920px] mx-auto h-[82vh] min-h-[580px] max-h-[860px] flex items-center overflow-hidden bg-[#141414] select-none"
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
              duration: shouldReduceMotion ? 0.2 : 0.9,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            className="absolute inset-0"
          >
            {/* Natural, Vibrant Background Image with Gentle Scale */}
            <motion.div
              initial={shouldReduceMotion ? {} : { scale: 1.05 }}
              animate={shouldReduceMotion ? {} : { scale: 1.0 }}
              transition={{
                duration: 7,
                ease: 'easeOut',
              }}
              className="absolute inset-0"
            >
              <Image
                src={currentSlide.image_url}
                alt={currentSlide.heading}
                fill
                priority
                sizes="(max-width: 1920px) 100vw, 1920px"
                className="object-cover object-center"
              />
            </motion.div>

            {/* Localized Subtle Gradients Only — No Gloomy Full-Screen Blackout! */}
            {isDarkText ? (
              // Light overlay variant for dark text
              position === 'left' ? (
                <div className="absolute inset-y-0 left-0 w-full sm:w-2/3 lg:w-1/2 bg-gradient-to-r from-white/90 via-white/60 to-transparent pointer-events-none" />
              ) : position === 'right' ? (
                <div className="absolute inset-y-0 right-0 w-full sm:w-2/3 lg:w-1/2 bg-gradient-to-l from-white/90 via-white/60 to-transparent pointer-events-none" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-t from-white/85 via-white/50 to-white/30 pointer-events-none" />
              )
            ) : (
              // Warm subtle shadow variant for light text (protects legibility while keeping colors bright)
              position === 'left' ? (
                <div className="absolute inset-y-0 left-0 w-full sm:w-3/4 lg:w-3/5 bg-gradient-to-r from-black/80 via-black/45 to-transparent pointer-events-none" />
              ) : position === 'right' ? (
                <div className="absolute inset-y-0 right-0 w-full sm:w-3/4 lg:w-3/5 bg-gradient-to-l from-black/80 via-black/45 to-transparent pointer-events-none" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/25 pointer-events-none" />
              )
            )}
          </motion.div>
        </AnimatePresence>

        {/* Content Container aligned according to text_position */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-20 pt-16 pb-14">
          <div
            className={`flex w-full ${
              position === 'left'
                ? 'justify-start text-left'
                : position === 'right'
                ? 'justify-end text-right sm:text-right'
                : 'justify-center text-center'
            }`}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide.id || activeIndex}
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -15 }}
                transition={{
                  duration: 0.5,
                  staggerChildren: 0.1,
                  delayChildren: 0.1,
                }}
                className={`max-w-xl flex flex-col ${
                  position === 'left'
                    ? 'items-start text-left'
                    : position === 'right'
                    ? 'items-end text-right'
                    : 'items-center text-center'
                } space-y-4`}
              >
                {/* Eyebrow Badge */}
                {currentSlide.badge && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] uppercase tracking-widest font-semibold backdrop-blur-md shadow-xs ${
                      isDarkText
                        ? 'bg-black/10 text-[#FF55D2] border border-black/10'
                        : 'bg-white/15 text-pink-200 border border-white/20'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#FF55D2]" />
                    <span>{currentSlide.badge}</span>
                  </motion.div>
                )}

                {/* Main Headline - Short, Elegant, Punchy */}
                <motion.h1
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className={`font-serif text-3xl sm:text-4xl md:text-5xl font-light tracking-tight leading-[1.15] drop-shadow-sm ${
                    isDarkText ? 'text-neutral-900' : 'text-white'
                  }`}
                >
                  {currentSlide.heading}
                </motion.h1>

                {/* Single Clear Sentence */}
                {currentSlide.description && (
                  <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className={`text-sm sm:text-base leading-relaxed font-light max-w-lg ${
                      isDarkText ? 'text-neutral-700' : 'text-neutral-200'
                    }`}
                  >
                    {currentSlide.description}
                  </motion.p>
                )}

                {/* Call To Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className={`pt-2 flex flex-wrap items-center gap-3.5 w-full sm:w-auto ${
                    position === 'left'
                      ? 'justify-start'
                      : position === 'right'
                      ? 'justify-end'
                      : 'justify-center'
                  }`}
                >
                  {currentSlide.button_text && (
                    <Link
                      href={currentSlide.button_link || '/shop'}
                      className="min-h-[44px] px-7 py-3 bg-[#FF55D2] hover:bg-[#FD00B9] active:bg-[#D5009C] text-white text-xs uppercase tracking-widest font-semibold transition-all shadow-md flex items-center justify-center gap-2 rounded-xs active:scale-95"
                    >
                      <span>{currentSlide.button_text}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}

                  {currentSlide.secondary_button_text && (
                    <Link
                      href={currentSlide.secondary_button_link || '/custom'}
                      className={`min-h-[44px] px-6 py-3 text-xs uppercase tracking-widest font-semibold transition-all backdrop-blur-md rounded-xs active:scale-95 border ${
                        isDarkText
                          ? 'border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white'
                          : 'border-white/50 text-white hover:border-white hover:bg-white/10'
                      }`}
                    >
                      <span>{currentSlide.secondary_button_text}</span>
                    </Link>
                  )}
                </motion.div>
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
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/30 hover:bg-black/60 text-white border border-white/20 backdrop-blur-md flex items-center justify-center active:scale-90 transition-all cursor-pointer shadow-md hover:border-[#FF55D2]"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/30 hover:bg-black/60 text-white border border-white/20 backdrop-blur-md flex items-center justify-center active:scale-90 transition-all cursor-pointer shadow-md hover:border-[#FF55D2]"
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
                      : 'w-2.5 bg-white/50 hover:bg-white/80'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Slide Numbers & Pause/Play Indicator */}
            <div className="flex items-center gap-3 text-white/90 font-mono text-xs tracking-widest pointer-events-auto bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15">
              <button
                type="button"
                onClick={() => setIsPaused(!isPaused)}
                className="hover:text-[#FF55D2] transition-colors cursor-pointer"
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
