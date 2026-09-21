'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CustomDesign } from '@/lib/types';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Video, X, ChevronLeft, ChevronRight, MessageCircle, ArrowRight, Scissors } from 'lucide-react';

interface CustomDesignsShowcaseProps {
  designs: CustomDesign[];
  title?: string;
  subtitle?: string;
  whatsappNumber?: string;
  showCta?: boolean;
  ctaButtonText?: string;
  ctaButtonLink?: string;
  ctaHeading?: string;
  ctaDescription?: string;
}

export default function CustomDesignsShowcase({
  designs,
  title = 'Our Custom Work',
  subtitle = 'COMPLETED CREATIONS',
  whatsappNumber = '6282629144',
  showCta = true,
  ctaButtonText = 'Start Your Custom Order',
  ctaButtonLink = '/custom',
  ctaHeading = 'Have a Dream Outfit in Mind?',
  ctaDescription = 'Looking for a custom bridal ensemble, specific fabric drape, or made-to-measure festive wear? Work directly with our designer to bring your vision to life.',
}: CustomDesignsShowcaseProps) {
  const publishedDesigns = designs.filter((d) => d.is_published);
  const [selectedDesign, setSelectedDesign] = useState<CustomDesign | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (publishedDesigns.length === 0) return null;

  const openGallery = (design: CustomDesign) => {
    setSelectedDesign(design);
    setActiveImageIndex(0);
  };

  const closeGallery = () => {
    setSelectedDesign(null);
    setActiveImageIndex(0);
  };

  const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');

  return (
    <section className="py-16 sm:py-24 bg-[#FAF9F6] border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            <span className="text-[11px] uppercase tracking-[0.25em] text-[#FF55D2] font-semibold block">
              {subtitle}
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl text-[#1A1A1A] font-light">
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 font-light leading-relaxed">
              Explore outfits made specifically for our clients, from bridal sets to festive evening wear.
            </p>
          </div>

          <Link
            href="/custom"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#FF55D2] hover:text-[#FD00B9] font-semibold transition-colors"
          >
            <span>Create Your Own Outfit →</span>
          </Link>
        </div>

        {/* Designs Grid - Horizontally Scrollable on Mobile */}
        <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8 overflow-x-auto sm:overflow-visible pb-4 sm:pb-0 snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
          {publishedDesigns.map((design) => {
            const hasMultiple = design.images && design.images.length > 1;

            return (
              <div
                key={design.id}
                onClick={() => openGallery(design)}
                className="w-[280px] sm:w-auto shrink-0 snap-start group cursor-pointer bg-white border border-neutral-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-[#FF55D2]/50 transition-all duration-500 flex flex-col"
              >
                <div className="relative aspect-[3/4] bg-neutral-100 overflow-hidden">
                  <Image
                    src={design.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800'}
                    alt={design.title}
                    fill
                    sizes="(max-width: 640px) 280px, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    {design.category && (
                      <span className="px-2.5 py-1 bg-white/95 backdrop-blur-xs text-[10px] uppercase tracking-wider font-semibold text-neutral-900 rounded-xs shadow-xs">
                        {design.category}
                      </span>
                    )}
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    {design.video_url && (
                      <span className="p-1.5 bg-black/60 backdrop-blur-xs rounded-full text-white" title="Has Video/Reel">
                        <Video className="w-3.5 h-3.5 text-[#FF55D2]" />
                      </span>
                    )}
                    {hasMultiple && (
                      <span className="px-2 py-1 bg-black/60 backdrop-blur-xs text-white text-[10px] font-medium rounded-xs">
                        {design.images.length} photos
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-5 space-y-2 flex-1 flex flex-col justify-between bg-white">
                  <div>
                    <h3 className="font-serif text-lg text-neutral-900 group-hover:text-[#FF55D2] transition-colors duration-500 font-medium">
                      {design.title}
                    </h3>
                    <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed font-light mt-1">
                      {design.description}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                    <span className="text-[#FF55D2] font-semibold group-hover:translate-x-1 transition-transform duration-500 inline-flex items-center gap-1">
                      View Photos →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA below Our Custom Work */}
        {showCta && (
          <div className="pt-4 sm:pt-8">
            <div className="relative overflow-hidden bg-[#1A1A1A] text-white p-8 sm:p-12 lg:p-14 border border-neutral-800 shadow-xl">
              {/* Subtle ambient luxury glows */}
              <div
                className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#FF55D2]/15 blur-3xl pointer-events-none"
                aria-hidden="true"
              />
              <div
                className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#FF55D2]/10 blur-3xl pointer-events-none"
                aria-hidden="true"
              />

              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="space-y-4 text-center lg:text-left max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-xs border border-white/15 text-[11px] uppercase tracking-[0.25em] text-[#FF55D2] font-semibold">
                    <Scissors className="w-3.5 h-3.5" />
                    <span>Custom Tailoring Studio</span>
                  </div>

                  <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-white font-light tracking-wide leading-tight">
                    {ctaHeading}
                  </h3>

                  <p className="text-xs sm:text-sm text-neutral-300 font-light leading-relaxed">
                    {ctaDescription}
                  </p>

                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 pt-1 text-[11px] text-neutral-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF55D2]" />
                      Made to Measure
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF55D2]" />
                      Direct WhatsApp Styling
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF55D2]" />
                      All-India &amp; Global Delivery
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
                  <Link
                    href={ctaButtonLink}
                    className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-[#FF55D2] hover:bg-[#FD00B9] text-white text-xs uppercase tracking-widest font-semibold transition-all duration-300 shadow-lg shadow-[#FF55D2]/25 group"
                  >
                    <span>{ctaButtonText}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <a
                    href={`https://wa.me/${cleanNumber}?text=${encodeURIComponent(
                      'Hello Fairy Finds, I would like to inquire about a custom-made outfit.'
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2.5 px-7 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs uppercase tracking-widest font-semibold transition-all duration-300"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    <span>Chat on WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox / Gallery Modal with 0.5s Transition */}
      <AnimatePresence>
        {selectedDesign && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 overflow-hidden">
            {/* Backdrop with 0.5s Fade */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              onClick={closeGallery}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
            />

            {/* Modal Window with 0.5s Scale & Fade */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative max-w-4xl w-full bg-white rounded-xs overflow-hidden shadow-2xl z-10 max-h-[90vh] flex flex-col md:flex-row"
            >
              {/* Close button */}
              <button
                onClick={closeGallery}
                className="absolute top-3 right-3 z-20 min-w-[44px] min-h-[44px] flex items-center justify-center bg-black/60 hover:bg-black text-white rounded-full transition-colors duration-500 cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Left/Image Area */}
              <div className="relative flex-1 aspect-[3/4] md:aspect-auto md:min-h-[500px] bg-neutral-900 overflow-hidden flex items-center justify-center">
                <Image
                  src={selectedDesign.images?.[activeImageIndex] || selectedDesign.images?.[0] || ''}
                  alt={selectedDesign.title}
                  fill
                  className="object-contain"
                />

                {/* Prev / Next controls if multiple images */}
                {selectedDesign.images && selectedDesign.images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : selectedDesign.images.length - 1));
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] rounded-full bg-black/50 hover:bg-black text-white flex items-center justify-center transition-colors duration-500"
                      aria-label="Previous photo"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex((prev) => (prev < selectedDesign.images.length - 1 ? prev + 1 : 0));
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] rounded-full bg-black/50 hover:bg-black text-white flex items-center justify-center transition-colors duration-500"
                      aria-label="Next photo"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Thumbnails */}
                {selectedDesign.images && selectedDesign.images.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-1 bg-black/50 rounded-xs">
                    {selectedDesign.images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImageIndex(idx);
                        }}
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-500 cursor-pointer ${
                          idx === activeImageIndex ? 'bg-[#FF55D2] scale-125' : 'bg-white/60'
                        }`}
                        aria-label={`Go to image ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Right/Details Area */}
              <div className="w-full md:w-80 p-6 flex flex-col justify-between space-y-6 bg-white shrink-0">
                <div className="space-y-3">
                  {selectedDesign.category && (
                    <span className="text-[10px] uppercase tracking-widest font-semibold text-[#FF55D2] block">
                      {selectedDesign.category}
                    </span>
                  )}
                  <h3 className="font-serif text-2xl text-neutral-900 font-normal">
                    {selectedDesign.title}
                  </h3>
                  <p className="text-xs text-neutral-600 leading-relaxed font-light">
                    {selectedDesign.description}
                  </p>

                  {selectedDesign.video_url && (
                    <div className="pt-2">
                      <a
                        href={selectedDesign.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs font-semibold text-[#FF55D2] hover:underline"
                      >
                        <Video className="w-4 h-4" />
                        <span>Watch on Instagram Reel →</span>
                      </a>
                    </div>
                  )}
                </div>

                <div className="space-y-3 pt-4 border-t border-neutral-100">
                  <a
                    href={`https://wa.me/${cleanNumber}?text=${encodeURIComponent(
                      `Hello Fairy Finds, I loved your custom design "${selectedDesign.title}". Can I discuss creating something similar?`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold uppercase tracking-wider rounded-xs flex items-center justify-center gap-2 transition-colors duration-500 shadow-xs"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Inquire via WhatsApp</span>
                  </a>
                  <Link
                    href="/custom"
                    onClick={closeGallery}
                    className="w-full py-2.5 px-4 border border-neutral-300 hover:border-black text-neutral-800 text-xs font-semibold uppercase tracking-wider rounded-xs flex items-center justify-center transition-colors duration-500"
                  >
                    Custom Order Form
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
