'use client';

import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 350) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      className="fixed bottom-36 sm:bottom-22 right-4 sm:right-6 z-30 w-10 h-10 bg-[#1A1A1A]/90 hover:bg-[#FF55D2] text-white rounded-full flex items-center justify-center shadow-md backdrop-blur-xs active:scale-90 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 cursor-pointer"
    >
      <ChevronUp className="w-4 h-4" />
    </button>
  );
}
