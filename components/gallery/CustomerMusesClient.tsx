'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CustomerPhoto, StoreSettings } from '@/lib/types';
import { cleanPhoneNumber } from '@/lib/whatsapp';
import { InstagramIcon } from '@/components/ui/Icons';
import {
  Heart,
  Sparkles,
  MapPin,
  Tag,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  X,
  Share2,
  Check,
  Star,
  SlidersHorizontal,
  Grid,
  Layers,
  LayoutGrid,
  Shuffle,
  MessageCircle,
  ExternalLink,
  Camera,
  ShoppingBag,
  Maximize2,
} from 'lucide-react';

interface CustomerMusesClientProps {
  initialPhotos: CustomerPhoto[];
  settings?: StoreSettings;
}

const COLLAGE_SPAN_PATTERNS = [
  { span: 'col-span-1 sm:col-span-2 row-span-2 min-h-[380px] sm:min-h-[460px]', hasTape: true }, // Hero mosaic card
  { span: 'col-span-1 row-span-2 min-h-[360px] sm:min-h-[440px]' }, // Tall portrait
  { span: 'col-span-1 row-span-1 min-h-[220px] sm:min-h-[240px]' }, // Standard square
  { span: 'col-span-1 sm:col-span-2 row-span-1 min-h-[220px] sm:min-h-[240px]', hasTape: true }, // Wide landscape
  { span: 'col-span-1 row-span-1 min-h-[220px] sm:min-h-[240px]' }, // Standard portrait
  { span: 'col-span-1 row-span-2 min-h-[360px] sm:min-h-[440px]' }, // Another tall card
  { span: 'col-span-1 row-span-1 min-h-[220px] sm:min-h-[240px]' }, // Standard square
];

const COLLAGE_ROTATIONS = ['rotate-0', '-rotate-1', 'rotate-1', '-rotate-1.5', 'rotate-1.5', 'rotate-0', '-rotate-2'];
const COLLAGE_STICKERS = ['Atelier Spotlight', 'Handcrafted Silk', 'Heirloom Zari', 'Bespoke Grace', 'Couture Commission', 'Celebratory Muse'];

export default function CustomerMusesClient({
  initialPhotos,
  settings,
}: CustomerMusesClientProps) {
  const [photos] = useState<CustomerPhoto[]>(
    initialPhotos.filter((p) => p.is_visible).sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
  );

  const [activeOccasion, setActiveOccasion] = useState<string>('ALL');
  const [viewLayout, setViewLayout] = useState<'collage' | 'masonry' | 'polaroid'>('collage');
  const [collageSeed, setCollageSeed] = useState<number>(0);
  const [isShuffling, setIsShuffling] = useState(false);
  const [shuffledOrder, setShuffledOrder] = useState<CustomerPhoto[]>([]);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Optimistic interactive likes
  const [likesMap, setLikesMap] = useState<Record<string, number>>({});
  const [userLikedMap, setUserLikedMap] = useState<Record<string, boolean>>({});
  const [floatingHeartMap, setFloatingHeartMap] = useState<Record<string, boolean>>({});

  // Initialize likes map
  useEffect(() => {
    const initialLikes: Record<string, number> = {};
    photos.forEach((p) => {
      initialLikes[p.id] = p.likes_count || Math.floor(Math.random() * 60) + 75;
    });
    setLikesMap(initialLikes);
  }, [photos]);

  // Extract list of unique occasions for filter
  const occasions = useMemo(() => {
    const set = new Set<string>();
    photos.forEach((p) => {
      if (p.occasion) set.add(p.occasion);
    });
    return Array.from(set);
  }, [photos]);

  // Filtered photos
  const filteredPhotos = useMemo(() => {
    if (activeOccasion === 'ALL') return photos;
    return photos.filter((p) => p.occasion === activeOccasion);
  }, [photos, activeOccasion]);

  // Keep shuffled order synchronized with active filtered photos
  useEffect(() => {
    setShuffledOrder(filteredPhotos);
  }, [filteredPhotos]);

  // Handle Shuffle Collage Action
  const handleShuffleCollage = () => {
    setIsShuffling(true);
    setCollageSeed((prev) => prev + 1);
    setShuffledOrder((prev) => {
      const next = [...prev];
      for (let i = next.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [next[i], next[j]] = [next[j], next[i]];
      }
      return next;
    });
    setTimeout(() => setIsShuffling(false), 500);
  };

  // Compute randomized collage layout items
  const collageItems = useMemo(() => {
    return shuffledOrder.map((photo, idx) => {
      const patternIdx = (idx + collageSeed) % COLLAGE_SPAN_PATTERNS.length;
      const rotIdx = (idx * 3 + collageSeed) % COLLAGE_ROTATIONS.length;
      const stickerIdx = (idx * 2 + collageSeed) % COLLAGE_STICKERS.length;
      const base = COLLAGE_SPAN_PATTERNS[patternIdx];

      return {
        ...photo,
        config: {
          span: base.span,
          rotation: COLLAGE_ROTATIONS[rotIdx],
          hasTape: !!base.hasTape,
          sticker: idx % 3 === 0 ? COLLAGE_STICKERS[stickerIdx] : undefined,
        },
      };
    });
  }, [shuffledOrder, collageSeed]);

  // Active photo in lightbox
  const currentPhoto = selectedPhotoIndex !== null ? filteredPhotos[selectedPhotoIndex] : null;

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedPhotoIndex === null) return;
      if (e.key === 'ArrowRight') {
        setSelectedPhotoIndex((prev) => (prev !== null && prev < filteredPhotos.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowLeft') {
        setSelectedPhotoIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : filteredPhotos.length - 1));
      } else if (e.key === 'Escape') {
        setSelectedPhotoIndex(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhotoIndex, filteredPhotos]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (selectedPhotoIndex !== null || shareModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedPhotoIndex, shareModalOpen]);

  // Handle like reaction
  const handleLike = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const isLiked = userLikedMap[id];
    setUserLikedMap((prev) => ({ ...prev, [id]: !isLiked }));
    setLikesMap((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + (isLiked ? -1 : 1),
    }));

    // Trigger floating heart animation
    if (!isLiked) {
      setFloatingHeartMap((prev) => ({ ...prev, [id]: true }));
      setTimeout(() => {
        setFloatingHeartMap((prev) => ({ ...prev, [id]: false }));
      }, 1000);
    }
  };

  // Copy shareable link
  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // WhatsApp Concierge phone
  const whatsappNumber = cleanPhoneNumber(settings?.whatsapp_number || '+94771234567');

  return (
    <div className="bg-[#FAF9F6] min-h-screen text-[#1A1A1A] selection:bg-[#FF55D2]/20 selection:text-[#1A1A1A]">
      {/* 1. EDITORIAL HERO SECTION */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 px-4 sm:px-6 lg:px-8 border-b border-neutral-200/80 overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-72 bg-gradient-to-b from-[#FF55D2]/10 via-[#FF55D2]/[0.02] to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto text-center relative z-10 space-y-6">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-neutral-200/80 shadow-xs backdrop-blur-xs gsap-hero-title">
            <Sparkles className="w-3.5 h-3.5 text-[#FF55D2]" />
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] font-semibold text-neutral-800">
              The Client Diaries • Atelier Muses
            </span>
          </div>

          {/* Grand Headline */}
          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-light tracking-tight text-[#1A1A1A] leading-[1.08] gsap-hero-title">
            Real Women, <span className="italic font-normal font-serif text-[#FF55D2]">Celebrated</span> Grace
          </h1>

          {/* Narrative Subtitle */}
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-neutral-600 font-light leading-relaxed gsap-hero-subtitle">
            A curated tapestry of celebratory moments, bespoke silhouettes, and heirloom grace adorned by our patrons across Udaipur, Colombo, London, Dubai, and beyond.
          </p>

          {/* Floating Luxury Stats Counters */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto gsap-hero-cta">
            <div className="bg-white/90 backdrop-blur-sm border border-neutral-200/80 p-3.5 sm:p-4 rounded-xs text-center shadow-xs">
              <span className="font-serif text-2xl sm:text-3xl text-[#1A1A1A] block font-normal">
                650+
              </span>
              <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-medium mt-0.5 block">
                Moments Celebrated
              </span>
            </div>

            <div className="bg-white/90 backdrop-blur-sm border border-neutral-200/80 p-3.5 sm:p-4 rounded-xs text-center shadow-xs">
              <span className="font-serif text-2xl sm:text-3xl text-[#1A1A1A] block font-normal">
                18+
              </span>
              <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-medium mt-0.5 block">
                Global Cities
              </span>
            </div>

            <div className="bg-white/90 backdrop-blur-sm border border-neutral-200/80 p-3.5 sm:p-4 rounded-xs text-center shadow-xs">
              <span className="font-serif text-2xl sm:text-3xl text-[#1A1A1A] block font-normal">
                100%
              </span>
              <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-medium mt-0.5 block">
                Bespoke Fit
              </span>
            </div>

            <div className="bg-white/90 backdrop-blur-sm border border-neutral-200/80 p-3.5 sm:p-4 rounded-xs text-center shadow-xs">
              <span className="font-serif text-2xl sm:text-3xl text-[#FF55D2] block font-normal flex items-center justify-center gap-1">
                5.0 <Star className="w-4 h-4 fill-[#FF55D2]" />
              </span>
              <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-medium mt-0.5 block">
                Patron Rating
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex items-center justify-center gap-3 flex-wrap gsap-hero-cta">
            <button
              type="button"
              onClick={() => setShareModalOpen(true)}
              className="px-5 py-2.5 bg-[#1A1A1A] hover:bg-[#FF55D2] text-white text-xs uppercase tracking-widest font-semibold rounded-xs transition-colors shadow-xs flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Share Your Look</span>
            </button>

            <Link
              href="/custom"
              className="px-5 py-2.5 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 text-xs uppercase tracking-widest font-semibold rounded-xs transition-colors shadow-xs flex items-center gap-2 active:scale-95"
            >
              <span>Commission Bespoke</span>
              <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. OCCASION FILTER & LAYOUT SWITCHER BAR */}
      <section className="sticky top-16 sm:top-20 z-30 bg-[#FAF9F6]/95 backdrop-blur-md border-b border-neutral-200/80 py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveOccasion('ALL')}
              className={`px-3.5 py-1.5 text-xs rounded-full font-medium transition-all shrink-0 cursor-pointer ${
                activeOccasion === 'ALL'
                  ? 'bg-[#1A1A1A] text-white shadow-xs'
                  : 'bg-white text-neutral-600 border border-neutral-200/80 hover:border-neutral-400 hover:text-black'
              }`}
            >
              All Celebrations ({photos.length})
            </button>

            {occasions.map((occ) => {
              const count = photos.filter((p) => p.occasion === occ).length;
              const isActive = activeOccasion === occ;
              return (
                <button
                  key={occ}
                  type="button"
                  onClick={() => setActiveOccasion(occ)}
                  className={`px-3.5 py-1.5 text-xs rounded-full font-medium transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#1A1A1A] text-white shadow-xs'
                      : 'bg-white text-neutral-600 border border-neutral-200/80 hover:border-neutral-400 hover:text-black'
                  }`}
                >
                  {occ} ({count})
                </button>
              );
            })}
          </div>

          {/* Layout Mode Toggle & Shuffle Button */}
          <div className="flex items-center gap-2.5 self-end md:self-auto shrink-0 flex-wrap">
            {/* Shuffle Button (Prominent for randomized collage) */}
            <button
              type="button"
              onClick={handleShuffleCollage}
              className="px-3.5 py-1.5 bg-white hover:bg-pink-50 text-[#1A1A1A] hover:text-[#FF55D2] border border-neutral-300 hover:border-[#FF55D2] text-xs font-semibold rounded-full flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
              title="Shuffle and re-randomize collage arrangement"
            >
              <Shuffle className={`w-3.5 h-3.5 text-[#FF55D2] ${isShuffling ? 'animate-spin' : ''}`} />
              <span>Shuffle Collage</span>
            </button>

            <div className="flex items-center border border-neutral-200 rounded-xs overflow-hidden bg-white p-0.5 shadow-xs">
              <button
                type="button"
                onClick={() => setViewLayout('collage')}
                className={`px-2.5 py-1 text-xs rounded-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                  viewLayout === 'collage'
                    ? 'bg-[#1A1A1A] text-white font-medium shadow-xs'
                    : 'text-neutral-500 hover:text-black'
                }`}
                title="Randomized Editorial Collage"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="text-[11px] hidden sm:inline">Collage</span>
              </button>

              <button
                type="button"
                onClick={() => setViewLayout('masonry')}
                className={`px-2.5 py-1 text-xs rounded-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                  viewLayout === 'masonry'
                    ? 'bg-[#1A1A1A] text-white font-medium shadow-xs'
                    : 'text-neutral-500 hover:text-black'
                }`}
                title="Editorial Masonry View"
              >
                <Grid className="w-3.5 h-3.5" />
                <span className="text-[11px] hidden sm:inline">Masonry</span>
              </button>

              <button
                type="button"
                onClick={() => setViewLayout('polaroid')}
                className={`px-2.5 py-1 text-xs rounded-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                  viewLayout === 'polaroid'
                    ? 'bg-[#1A1A1A] text-white font-medium shadow-xs'
                    : 'text-neutral-500 hover:text-black'
                }`}
                title="Polaroid Atelier Reel"
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="text-[11px] hidden sm:inline">Polaroids</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SHOWCASE GALLERY SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {filteredPhotos.length === 0 ? (
          <div className="p-16 text-center bg-white border border-neutral-200 rounded-xs space-y-3">
            <Sparkles className="w-8 h-8 text-neutral-400 mx-auto" />
            <h3 className="font-serif text-xl text-[#1A1A1A]">No moments found for this occasion</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto font-light">
              Explore our other celebration categories or share your own Fairy Finds photograph.
            </p>
            <button
              type="button"
              onClick={() => setActiveOccasion('ALL')}
              className="px-4 py-2 bg-[#1A1A1A] text-white text-xs uppercase tracking-wider font-semibold rounded-xs inline-block"
            >
              View All Moments
            </button>
          </div>
        ) : viewLayout === 'collage' ? (
          /* RANDOMIZED EDITORIAL COLLAGE / MOODBOARD */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 auto-rows-[220px] sm:auto-rows-[240px] items-stretch transition-all duration-500">
            {collageItems.map((photo) => {
              const isLiked = userLikedMap[photo.id];
              const likesCount = likesMap[photo.id] || 0;
              const hasFloatingHeart = floatingHeartMap[photo.id];
              const { span, rotation, hasTape, sticker } = photo.config;

              return (
                <div
                  key={`${photo.id}-${collageSeed}`}
                  onClick={() => {
                    const originalIdx = filteredPhotos.findIndex((p) => p.id === photo.id);
                    setSelectedPhotoIndex(originalIdx !== -1 ? originalIdx : 0);
                  }}
                  className={`group relative ${span} bg-white border border-neutral-200/90 rounded-xs overflow-hidden shadow-xs hover:shadow-2xl transition-all duration-500 cursor-pointer ${rotation} hover:rotate-0 hover:scale-[1.015] hover:z-30 gsap-fade-up`}
                >
                  {/* Tape Accent for scrap-book feel */}
                  {hasTape && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-white/70 backdrop-blur-md border border-neutral-300/60 rotate-2 opacity-80 z-30 pointer-events-none shadow-xs" />
                  )}

                  {/* Collage Moodboard Sticker */}
                  {sticker && (
                    <div className="absolute top-3 right-3 z-30 pointer-events-none animate-in fade-in">
                      <span className="px-2.5 py-1 bg-black/80 backdrop-blur-md text-white text-[9px] uppercase tracking-widest font-mono font-bold rounded-xs border border-white/20 shadow-md">
                        {sticker}
                      </span>
                    </div>
                  )}

                  {/* Photo Container */}
                  <div className="relative w-full h-full bg-neutral-900 overflow-hidden">
                    <Image
                      src={photo.image_url}
                      alt={photo.customer_name}
                      fill
                      className="object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10 opacity-70 group-hover:opacity-90 transition-opacity duration-300 pointer-events-none" />

                    {/* Floating Heart Micro-Animation */}
                    {hasFloatingHeart && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 animate-in fade-in zoom-in duration-300">
                        <Heart className="w-16 h-16 fill-[#FF55D2] text-[#FF55D2] drop-shadow-lg animate-bounce" />
                      </div>
                    )}

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 z-20">
                      {photo.is_featured ? (
                        <span className="px-2.5 py-0.5 bg-[#FF55D2] text-white text-[9px] uppercase tracking-wider font-bold rounded-full shadow-xs flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 fill-white" />
                          <span>Spotlight</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[9px] uppercase tracking-wider font-semibold rounded-xs">
                          {photo.occasion || 'Celebration'}
                        </span>
                      )}
                    </div>

                    {/* Interactive Like Reaction Button */}
                    <button
                      type="button"
                      onClick={(e) => handleLike(e, photo.id)}
                      className={`absolute bottom-3 right-3 z-30 p-2 rounded-full backdrop-blur-md transition-all active:scale-75 cursor-pointer ${
                        isLiked
                          ? 'bg-[#FF55D2] text-white shadow-xs'
                          : 'bg-black/40 text-white hover:bg-black/70 hover:text-pink-300'
                      }`}
                      title="Applaud this look"
                    >
                      <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-white' : ''}`} />
                    </button>

                    {/* Bottom Details Overlay */}
                    <div className="absolute bottom-3 left-3 right-14 z-20 text-white space-y-1">
                      <div className="flex items-center gap-1 text-[11px] text-pink-200/90 font-mono">
                        {photo.city && (
                          <span className="flex items-center gap-0.5">
                            <MapPin className="w-2.5 h-2.5 text-[#FF55D2]" />
                            {photo.city}
                          </span>
                        )}
                        {photo.instagram_handle && (
                          <span className="truncate">• {photo.instagram_handle}</span>
                        )}
                      </div>

                      <h3 className="font-serif text-base sm:text-lg md:text-xl font-medium tracking-wide leading-tight text-white drop-shadow-xs truncate">
                        {photo.customer_name}
                      </h3>

                      {photo.caption && (
                        <p className="text-xs text-neutral-200/90 font-light italic line-clamp-1 group-hover:line-clamp-2 transition-all">
                          “{photo.caption}”
                        </p>
                      )}

                      {/* Tagged product pill */}
                      {photo.product_name && (
                        <div className="pt-0.5 flex items-center gap-1.5 text-[10px] text-neutral-300">
                          <Tag className="w-2.5 h-2.5 text-[#FF55D2] shrink-0" />
                          <span className="truncate font-medium">{photo.product_name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : viewLayout === 'masonry' ? (
          /* MASONRY EDITORIAL GRID */
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            {filteredPhotos.map((photo, idx) => {
              const isLiked = userLikedMap[photo.id];
              const likesCount = likesMap[photo.id] || 0;
              const hasFloatingHeart = floatingHeartMap[photo.id];

              return (
                <div
                  key={photo.id}
                  onClick={() => setSelectedPhotoIndex(idx)}
                  className="break-inside-avoid group relative bg-white border border-neutral-200/80 rounded-xs overflow-hidden shadow-xs hover:shadow-xl transition-all duration-500 cursor-pointer gsap-fade-up"
                >
                  {/* Photo Container */}
                  <div className="relative aspect-[3/4] bg-neutral-100 overflow-hidden">
                    <Image
                      src={photo.image_url}
                      alt={photo.customer_name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-60 group-hover:opacity-85 transition-opacity duration-300 pointer-events-none" />

                    {/* Floating Heart Micro-Animation */}
                    {hasFloatingHeart && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 animate-in fade-in zoom-in duration-300">
                        <Heart className="w-16 h-16 fill-[#FF55D2] text-[#FF55D2] drop-shadow-lg animate-bounce" />
                      </div>
                    )}

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-1 z-20">
                      {photo.is_featured ? (
                        <span className="px-2.5 py-0.5 bg-[#FF55D2] text-white text-[9px] uppercase tracking-wider font-bold rounded-full shadow-xs flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 fill-white" />
                          <span>Spotlight Muse</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-black/50 backdrop-blur-xs text-white text-[9px] uppercase tracking-wider font-semibold rounded-xs">
                          {photo.occasion || 'Celebration'}
                        </span>
                      )}

                      {/* Interactive Heart Button */}
                      <button
                        type="button"
                        onClick={(e) => handleLike(e, photo.id)}
                        className={`p-2 rounded-full backdrop-blur-md transition-all active:scale-75 cursor-pointer ${
                          isLiked
                            ? 'bg-[#FF55D2] text-white shadow-xs'
                            : 'bg-black/40 text-white hover:bg-black/60 hover:text-pink-300'
                        }`}
                        title="Applaud this look"
                      >
                        <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-white' : ''}`} />
                      </button>
                    </div>

                    {/* Permanent Bottom Name & City */}
                    <div className="absolute bottom-3 left-3 right-3 z-20 text-white">
                      <div className="flex items-center gap-1 text-[11px] text-pink-200/90 font-mono mb-0.5">
                        {photo.city && (
                          <span className="flex items-center gap-0.5">
                            <MapPin className="w-2.5 h-2.5 text-[#FF55D2]" />
                            {photo.city}
                          </span>
                        )}
                        {photo.instagram_handle && (
                          <span className="truncate">• {photo.instagram_handle}</span>
                        )}
                      </div>
                      <h3 className="font-serif text-lg font-medium tracking-wide leading-tight">
                        {photo.customer_name}
                      </h3>
                    </div>
                  </div>

                  {/* Card Bottom: Quote & Tagged Garment */}
                  <div className="p-4 space-y-3 bg-white">
                    {photo.caption && (
                      <p className="text-xs text-neutral-600 font-light italic leading-relaxed line-clamp-2">
                        “{photo.caption}”
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-[11px]">
                      {/* Tagged product chip */}
                      {photo.product_name ? (
                        <div className="flex items-center gap-1.5 text-neutral-700 min-w-0 max-w-[170px]">
                          <Tag className="w-3 h-3 text-[#FF55D2] shrink-0" />
                          <span className="truncate font-medium">{photo.product_name}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] uppercase font-semibold text-neutral-400">
                          Bespoke Atelier
                        </span>
                      )}

                      {/* Likes count & Explore */}
                      <div className="flex items-center gap-1 text-neutral-400 font-mono text-[10px]">
                        <Heart className={`w-3 h-3 ${isLiked ? 'text-[#FF55D2] fill-[#FF55D2]' : ''}`} />
                        <span>{likesCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* POLAROID REEL LAYOUT */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pt-4">
            {filteredPhotos.map((photo, idx) => {
              const rotation = idx % 4 === 0 ? 'rotate-1' : idx % 4 === 1 ? '-rotate-1.5' : idx % 4 === 2 ? 'rotate-2' : '-rotate-1';
              const isLiked = userLikedMap[photo.id];
              const likesCount = likesMap[photo.id] || 0;

              return (
                <div
                  key={photo.id}
                  onClick={() => setSelectedPhotoIndex(idx)}
                  className={`group relative bg-white p-3.5 pb-6 border border-neutral-300 shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer ${rotation} hover:rotate-0 hover:scale-[1.02] hover:z-20`}
                >
                  {/* Polaroid Tape Accent */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-neutral-200/80 backdrop-blur-xs border border-neutral-300/60 rotate-2 opacity-80" />

                  {/* Photo Frame */}
                  <div className="relative aspect-[3/4] bg-neutral-100 overflow-hidden border border-neutral-200/60">
                    <Image
                      src={photo.image_url}
                      alt={photo.customer_name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />

                    {/* Like button on top right */}
                    <button
                      type="button"
                      onClick={(e) => handleLike(e, photo.id)}
                      className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md transition-all ${
                        isLiked ? 'bg-[#FF55D2] text-white' : 'bg-black/40 text-white hover:bg-black/60'
                      }`}
                    >
                      <Heart className={`w-3 h-3 ${isLiked ? 'fill-white' : ''}`} />
                    </button>
                  </div>

                  {/* Handwritten-Style Polaroid Footer */}
                  <div className="pt-3.5 text-center space-y-1">
                    <h4 className="font-serif text-base font-medium text-[#1A1A1A]">
                      {photo.customer_name}
                    </h4>
                    <p className="text-[11px] text-neutral-500 font-mono tracking-tight">
                      {photo.occasion || 'Celebration'}{photo.city ? ` • ${photo.city}` : ''}
                    </p>
                    {photo.caption && (
                      <p className="text-[11px] text-neutral-600 font-light italic line-clamp-1 pt-1">
                        “{photo.caption}”
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. CINEMATIC FULLSCREEN STORY LIGHTBOX */}
      {currentPhoto && selectedPhotoIndex !== null && (
        <div className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
          {/* Top Bar Controls */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white z-50">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest font-mono text-neutral-400">
                Story {selectedPhotoIndex + 1} of {filteredPhotos.length}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Share link"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copiedLink ? 'Link Copied' : 'Share'}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPhotoIndex(null)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            type="button"
            onClick={() =>
              setSelectedPhotoIndex((prev) =>
                prev !== null && prev > 0 ? prev - 1 : filteredPhotos.length - 1
              )
            }
            className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all z-50 active:scale-90 cursor-pointer"
            title="Previous Muse (Left Arrow)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            type="button"
            onClick={() =>
              setSelectedPhotoIndex((prev) =>
                prev !== null && prev < filteredPhotos.length - 1 ? prev + 1 : 0
              )
            }
            className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all z-50 active:scale-90 cursor-pointer"
            title="Next Muse (Right Arrow)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Lightbox Content Container */}
          <div className="bg-[#181818] border border-neutral-800 rounded-xs max-w-5xl w-full max-h-[92vh] overflow-hidden flex flex-col md:flex-row shadow-2xl relative my-auto">
            {/* Left: High-Res Editorial Photography */}
            <div className="relative md:w-3/5 aspect-[3/4] md:aspect-auto md:min-h-[560px] bg-black overflow-hidden shrink-0 flex items-center justify-center">
              <Image
                src={currentPhoto.image_url}
                alt={currentPhoto.customer_name}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 60vw"
                priority
              />
            </div>

            {/* Right: Muse Narrative & Tagged Garment */}
            <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto max-h-[60vh] md:max-h-[85vh] text-white space-y-6">
              {/* Header Details */}
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-[#FF55D2]/20 text-[#FF55D2] border border-[#FF55D2]/30 text-[10px] uppercase tracking-wider font-semibold rounded-full">
                      {currentPhoto.occasion || 'Celebration'}
                    </span>
                    {currentPhoto.is_featured && (
                      <span className="px-2 py-0.5 bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[9px] uppercase tracking-wider font-semibold rounded-full flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 fill-amber-300" />
                        <span>Spotlight</span>
                      </span>
                    )}
                  </div>

                  {currentPhoto.city && (
                    <span className="flex items-center gap-1 text-xs text-neutral-400">
                      <MapPin className="w-3 h-3 text-[#FF55D2]" />
                      {currentPhoto.city}
                    </span>
                  )}
                </div>

                {/* Muse Name */}
                <div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-normal text-white">
                    {currentPhoto.customer_name}
                  </h2>
                  {currentPhoto.instagram_handle && (
                    <a
                      href={`https://instagram.com/${currentPhoto.instagram_handle.replace(/^@/, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-pink-300 hover:text-[#FF55D2] font-mono mt-1 transition-colors"
                    >
                      <InstagramIcon className="w-3.5 h-3.5" />
                      <span>{currentPhoto.instagram_handle}</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                    </a>
                  )}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: currentPhoto.rating || 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                  <span className="text-xs text-neutral-400 ml-1.5 font-mono">5.0 / 5.0</span>
                </div>

                {/* Story Narrative Quote */}
                {currentPhoto.caption && (
                  <div className="p-4 bg-neutral-900/90 border-l-2 border-[#FF55D2] rounded-xs space-y-1">
                    <p className="font-serif text-base sm:text-lg italic text-neutral-200 font-light leading-relaxed">
                      “{currentPhoto.caption}”
                    </p>
                  </div>
                )}
              </div>

              {/* Tagged Garment "Shop The Look" Box */}
              <div className="space-y-4 pt-4 border-t border-neutral-800">
                {currentPhoto.product_name ? (
                  <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xs space-y-3">
                    <span className="text-[10px] uppercase tracking-widest font-semibold text-[#FF55D2] block">
                      Shop This Silhouette
                    </span>

                    <div className="flex items-center gap-3.5">
                      <div className="relative w-14 h-16 rounded-xs overflow-hidden bg-neutral-800 shrink-0 border border-neutral-700">
                        {currentPhoto.product_image ? (
                          <Image
                            src={currentPhoto.product_image}
                            alt={currentPhoto.product_name}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        ) : (
                          <ShoppingBag className="w-5 h-5 text-neutral-500 m-auto" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="font-serif text-sm text-white font-medium truncate">
                          {currentPhoto.product_name}
                        </h4>
                        {currentPhoto.product_price && (
                          <p className="text-xs font-mono text-neutral-300 mt-0.5">
                            Rs. {currentPhoto.product_price.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      {currentPhoto.product_slug && (
                        <Link
                          href={
                            currentPhoto.product_slug === 'custom'
                              ? '/custom'
                              : `/product/${currentPhoto.product_slug}`
                          }
                          className="flex-1 py-2 bg-white hover:bg-neutral-100 text-neutral-900 text-xs uppercase tracking-wider font-semibold rounded-xs text-center transition-colors shadow-xs"
                        >
                          View Garment
                        </Link>
                      )}

                      <a
                        href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                          `Hello Fairy Finds Atelier! I am admiring the look worn by ${currentPhoto.customer_name} (${currentPhoto.product_name || 'Bespoke Couture'}) on your Client Diaries, and would like to order or customize this piece.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 bg-[#FF55D2] hover:bg-[#ff3ec9] text-white text-xs uppercase tracking-wider font-semibold rounded-xs text-center transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Order Bespoke</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xs flex items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-serif font-medium text-white block">
                        One-of-a-Kind Atelier Commission
                      </span>
                      <p className="text-[11px] text-neutral-400 font-light mt-0.5">
                        Custom tailored to personal silhouette & embroidery requests.
                      </p>
                    </div>
                    <Link
                      href="/custom"
                      className="px-4 py-2 bg-[#FF55D2] text-white text-xs uppercase tracking-wider font-semibold rounded-xs hover:bg-[#ff3ec9] transition-colors shrink-0"
                    >
                      Bespoke Order
                    </Link>
                  </div>
                )}

                {/* Bottom Applaud / Like Bar */}
                <div className="flex items-center justify-between pt-2 text-xs text-neutral-400">
                  <button
                    type="button"
                    onClick={(e) => handleLike(e, currentPhoto.id)}
                    className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        userLikedMap[currentPhoto.id] ? 'text-[#FF55D2] fill-[#FF55D2]' : 'text-neutral-400'
                      }`}
                    />
                    <span>{likesMap[currentPhoto.id] || 0} Patrons Applauded</span>
                  </button>

                  <span className="text-[10px] uppercase font-mono text-neutral-500">
                    Fairy Finds Muse
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. "BECOME A FAIRY FINDS MUSE" VIP SUBMISSION MODAL */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-[85] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xs border border-neutral-200 w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 my-auto">
            {/* Modal Header */}
            <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#FF55D2]" />
                <h3 className="font-serif text-lg font-medium text-[#1A1A1A]">
                  Become a Fairy Finds Muse
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShareModalOpen(false)}
                className="text-neutral-400 hover:text-black p-1 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-neutral-700">
              <p className="text-xs text-neutral-600 font-light leading-relaxed">
                We celebrate every woman who breathes life into our handcrafted silhouettes. Share your celebration photographs to be featured in our official Client Diaries.
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-neutral-50 border border-neutral-200 rounded-xs">
                  <span className="w-6 h-6 rounded-full bg-[#FF55D2] text-white text-xs font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  <div>
                    <h4 className="text-xs font-semibold text-[#1A1A1A]">Capture the Moment</h4>
                    <p className="text-[11px] text-neutral-500 font-light mt-0.5">
                      High-resolution photos wearing your Fairy Finds saree, lehenga, dress, or bespoke ensemble.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-neutral-50 border border-neutral-200 rounded-xs">
                  <span className="w-6 h-6 rounded-full bg-[#FF55D2] text-white text-xs font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  <div>
                    <h4 className="text-xs font-semibold text-[#1A1A1A]">Tag on Instagram or WhatsApp Us</h4>
                    <p className="text-[11px] text-neutral-500 font-light mt-0.5">
                      Tag <strong className="text-neutral-800">@fairyfinds</strong> on Instagram or send high-res photos directly to our atelier concierge on WhatsApp.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-neutral-50 border border-neutral-200 rounded-xs">
                  <span className="w-6 h-6 rounded-full bg-[#FF55D2] text-white text-xs font-bold flex items-center justify-center shrink-0">
                    3
                  </span>
                  <div>
                    <h4 className="text-xs font-semibold text-[#1A1A1A]">Editorial Curation</h4>
                    <p className="text-[11px] text-neutral-500 font-light mt-0.5">
                      Our atelier team will review your photos, feature your story on our storefront gallery, and share an exclusive patron voucher.
                    </p>
                  </div>
                </div>
              </div>

              {/* Direct WhatsApp Concierge CTA */}
              <div className="pt-2">
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                    `Hello Fairy Finds Atelier! I would love to share my celebratory photos wearing your creation to be featured on your Muses gallery.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-[#1A1A1A] hover:bg-[#FF55D2] text-white text-xs uppercase tracking-widest font-semibold rounded-xs transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send Photos to Atelier Concierge</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. BOTTOM ATELIER CALL-TO-ACTION BANNER */}
      <section className="bg-[#1A1A1A] text-white py-16 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto space-y-6 relative z-10">
          <span className="text-[10px] uppercase tracking-[0.3em] font-semibold text-[#FF55D2]">
            Bespoke Haute Couture Commissions
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-light text-white leading-tight">
            Your Next Celebration Deserves an <span className="italic font-serif text-[#FF55D2]">Heirloom</span>
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 font-light max-w-xl mx-auto leading-relaxed">
            Collaborate directly with our master drapers and embroidery artisans on WhatsApp to commission a one-of-a-kind silhouette tailored exclusively to your measurements.
          </p>
          <div className="pt-2 flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/custom"
              className="px-6 py-3 bg-[#FF55D2] hover:bg-[#ff3ec9] text-white text-xs uppercase tracking-widest font-semibold rounded-xs transition-colors shadow-xs"
            >
              Start Bespoke Order
            </Link>
            <Link
              href="/shop"
              className="px-6 py-3 bg-transparent hover:bg-white/10 text-white border border-neutral-700 text-xs uppercase tracking-widest font-semibold rounded-xs transition-colors"
            >
              Explore Ready-to-Wear
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
