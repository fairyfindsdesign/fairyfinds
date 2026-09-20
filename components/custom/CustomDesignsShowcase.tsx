'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CustomDesign } from '@/lib/types';
import { Sparkles, Video, X, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';

interface CustomDesignsShowcaseProps {
  designs: CustomDesign[];
  title?: string;
  subtitle?: string;
  whatsappNumber?: string;
}

export default function CustomDesignsShowcase({
  designs,
  title = 'Our Custom Work',
  subtitle = 'COMPLETED CREATIONS',
  whatsappNumber = '6282629144',
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

        {/* Designs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {publishedDesigns.map((design) => {
            const hasMultiple = design.images && design.images.length > 1;

            return (
              <div
                key={design.id}
                onClick={() => openGallery(design)}
                className="group cursor-pointer bg-white border border-neutral-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-[#FF55D2]/50 transition-all duration-300 flex flex-col"
              >
                <div className="relative aspect-[3/4] bg-neutral-100 overflow-hidden">
                  <Image
                    src={design.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800'}
                    alt={design.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
                    <h3 className="font-serif text-lg text-neutral-900 group-hover:text-[#FF55D2] transition-colors font-medium">
                      {design.title}
                    </h3>
                    <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed font-light mt-1">
                      {design.description}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                    <span className="text-[#FF55D2] font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      View Photos →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox / Gallery Modal */}
      {selectedDesign && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative max-w-4xl w-full bg-white rounded-xs overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col md:flex-row">
            {/* Close button */}
            <button
              onClick={closeGallery}
              className="absolute top-3 right-3 z-20 p-2 bg-black/60 hover:bg-black text-white rounded-full transition-colors"
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
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black text-white flex items-center justify-center"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex((prev) => (prev < selectedDesign.images.length - 1 ? prev + 1 : 0));
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black text-white flex items-center justify-center"
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
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
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
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold uppercase tracking-wider rounded-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Inquire via WhatsApp</span>
                </a>
                <Link
                  href="/custom"
                  onClick={closeGallery}
                  className="w-full py-2.5 px-4 border border-neutral-300 hover:border-black text-neutral-800 text-xs font-semibold uppercase tracking-wider rounded-xs flex items-center justify-center transition-colors"
                >
                  Custom Order Form
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
