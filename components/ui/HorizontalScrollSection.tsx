'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

interface ActionLink {
  href: string;
  label: string;
}

interface HorizontalScrollSectionProps {
  id?: string;
  badge?: React.ReactNode;
  eyebrow?: string;
  title: string;
  description?: string;
  actionLink?: ActionLink;
  children: React.ReactNode;
  bottomContent?: React.ReactNode;
  className?: string;
  innerClassName?: string;
}

export default function HorizontalScrollSection({
  id,
  badge,
  eyebrow,
  title,
  description,
  actionLink,
  children,
  bottomContent,
  className = 'py-16 sm:py-20 bg-white border-b border-neutral-100',
  innerClassName = 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
}: HorizontalScrollSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const tolerance = 6;
    const atStart = el.scrollLeft <= tolerance;
    const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - tolerance;

    setCanScrollLeft(!atStart);
    setCanScrollRight(!atEnd);
  }, []);

  useEffect(() => {
    updateScrollButtons();
    const handleResize = () => updateScrollButtons();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateScrollButtons]);

  const handleScroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    // Scroll approximately 1 card width or ~70% of visible container width
    const scrollAmount = Math.max(el.clientWidth * 0.7, 300);
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <section id={id} className={className}>
      <div className={innerClassName}>
        {/* Section Header with Top Corner Action & Scroll Buttons */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-10 gap-4 gsap-fade-up">
          <div className="max-w-2xl">
            {badge && <div className="mb-2">{badge}</div>}
            {eyebrow && !badge && (
              <p className="text-xs uppercase tracking-[0.25em] text-[#FF55D2] font-semibold mb-2">
                {eyebrow}
              </p>
            )}
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1A1A1A] font-light leading-tight">
              {title}
            </h2>
            {description && (
              <p className="text-sm text-neutral-500 mt-2 font-light leading-relaxed">
                {description}
              </p>
            )}
          </div>

          {/* Top Corner Controls: Explore Link & Scroll Chevrons */}
          <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 shrink-0">
            {actionLink && (
              <Link
                href={actionLink.href}
                className="inline-flex items-center text-xs uppercase tracking-widest text-[#1A1A1A] hover:text-[#FF55D2] font-semibold transition-colors group"
              >
                <span>{actionLink.label}</span>
                <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
              </Link>
            )}

            {/* Scroll navigation chevrons in the top corner */}
            <div className="flex items-center gap-1.5 pl-2 sm:pl-3 border-l border-neutral-200">
              <button
                type="button"
                onClick={() => handleScroll('left')}
                disabled={!canScrollLeft}
                aria-label="Scroll left"
                title="Scroll previous"
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xs border border-neutral-300 bg-white hover:bg-neutral-100 hover:border-[#FF55D2] text-[#1A1A1A] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-neutral-300 disabled:hover:bg-white transition-all shadow-xs active:scale-90"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleScroll('right')}
                disabled={!canScrollRight}
                aria-label="Scroll right"
                title="Scroll next"
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xs border border-neutral-300 bg-white hover:bg-neutral-100 hover:border-[#FF55D2] text-[#1A1A1A] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-neutral-300 disabled:hover:bg-white transition-all shadow-xs active:scale-90"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal Scroll Track */}
        <div
          ref={scrollRef}
          onScroll={updateScrollButtons}
          className="flex gap-4 sm:gap-6 overflow-x-auto scroll-smooth no-scrollbar snap-x snap-mandatory py-2 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 gsap-stagger"
        >
          {children}
        </div>

        {/* Bottom Content if applicable */}
        {bottomContent && <div className="mt-12 sm:mt-16">{bottomContent}</div>}
      </div>
    </section>
  );
}
