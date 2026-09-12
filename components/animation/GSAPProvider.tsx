'use client';

import React, { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface GSAPProviderProps {
  children: React.ReactNode;
}

export default function GSAPProvider({ children }: GSAPProviderProps) {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Register ScrollTrigger plugin safely
    gsap.registerPlugin(ScrollTrigger);

    // Create a GSAP Context for automatic cleanup
    const ctx = gsap.context(() => {
      // 1. Hero & Top Banner Elements Reveal
      const heroTitles = gsap.utils.toArray<HTMLElement>('.gsap-hero-title');
      if (heroTitles.length > 0) {
        gsap.fromTo(
          heroTitles,
          { y: 35, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.1, ease: 'power3.out', stagger: 0.1, delay: 0.05 }
        );
      }

      const heroSubtitles = gsap.utils.toArray<HTMLElement>('.gsap-hero-subtitle');
      if (heroSubtitles.length > 0) {
        gsap.fromTo(
          heroSubtitles,
          { y: 25, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.0, ease: 'power3.out', stagger: 0.1, delay: 0.2 }
        );
      }

      const heroCtas = gsap.utils.toArray<HTMLElement>('.gsap-hero-cta');
      if (heroCtas.length > 0) {
        gsap.fromTo(
          heroCtas,
          { y: 20, opacity: 0, scale: 0.96 },
          { y: 0, opacity: 1, scale: 1, duration: 0.85, ease: 'back.out(1.2)', delay: 0.35 }
        );
      }

      // 2. ScrollTrigger Reveal for Single Elements (.gsap-fade-up)
      const fadeUpElements = gsap.utils.toArray<HTMLElement>('.gsap-fade-up, [data-gsap="fade-up"]');
      fadeUpElements.forEach((el) => {
        gsap.fromTo(
          el,
          { y: 35, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.85,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
              toggleActions: 'play none none none',
              once: true,
            },
          }
        );
      });

      // 3. ScrollTrigger Stagger for Card Lists (.gsap-stagger)
      const staggerContainers = gsap.utils.toArray<HTMLElement>('.gsap-stagger');
      staggerContainers.forEach((container) => {
        const childNodes = Array.from(container.children) as HTMLElement[];
        if (childNodes.length > 0) {
          gsap.fromTo(
            childNodes,
            { y: 40, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.75,
              stagger: 0.08,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: container,
                start: 'top 88%',
                toggleActions: 'play none none none',
                once: true,
              },
            }
          );
        }
      });

      // 4. ScrollTrigger Subtle Scale-In (.gsap-scale-in)
      const scaleElements = gsap.utils.toArray<HTMLElement>('.gsap-scale-in');
      scaleElements.forEach((el) => {
        gsap.fromTo(
          el,
          { scale: 0.94, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.9,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none none',
              once: true,
            },
          }
        );
      });

      // Refresh ScrollTrigger positions after layout calculation
      ScrollTrigger.refresh();
    }, containerRef);

    // Refresh after images and fonts render
    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 250);

    return () => {
      clearTimeout(refreshTimer);
      ctx.revert();
    };
  }, [pathname]);

  return <div ref={containerRef}>{children}</div>;
}
