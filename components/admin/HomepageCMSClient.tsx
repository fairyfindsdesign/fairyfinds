'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HomepageSection, HeroSlide } from '@/lib/types';
import {
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Edit,
  Save,
  CheckCircle2,
  Sparkles,
  LayoutTemplate,
  Plus,
  Trash2,
  Clock,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  RefreshCw,
  MessageSquareQuote,
  ExternalLink,
} from 'lucide-react';
import {
  reorderSectionsAction,
  toggleSectionVisibilityAction,
  updateSectionContentAction,
} from '@/app/actions/store';

interface HomepageCMSClientProps {
  initialSections: HomepageSection[];
}

export default function HomepageCMSClient({ initialSections }: HomepageCMSClientProps) {
  const router = useRouter();
  const [sections, setSections] = useState<HomepageSection[]>(initialSections);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFields, setEditFields] = useState<Record<string, any>>({});

  // Hero Carousel CMS state
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [activeSlideIdx, setActiveSlideIdx] = useState<number>(0);
  const [autoplayInterval, setAutoplayInterval] = useState<number>(5000);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const newSections = [...sections];
    const temp = newSections[index - 1];
    newSections[index - 1] = newSections[index];
    newSections[index] = temp;

    const orderedIds = newSections.map((s) => s.id);
    setSections(newSections);
    await reorderSectionsAction(orderedIds);
    router.refresh();
  };

  const handleMoveDown = async (index: number) => {
    if (index === sections.length - 1) return;
    const newSections = [...sections];
    const temp = newSections[index + 1];
    newSections[index + 1] = newSections[index];
    newSections[index] = temp;

    const orderedIds = newSections.map((s) => s.id);
    setSections(newSections);
    await reorderSectionsAction(orderedIds);
    router.refresh();
  };

  const handleToggleVisibility = async (id: string, currentVisibility: boolean) => {
    const updated = await toggleSectionVisibilityAction(id, !currentVisibility);
    setSections(updated);
    router.refresh();
  };

  const startEditing = (section: HomepageSection) => {
    setEditingId(section.id);
    setEditFields({
      heading: section.content.heading || '',
      subtitle: section.subtitle || '',
      description: section.content.description || '',
      button_text: section.content.button_text || '',
      button_link: section.content.button_link || '',
      image_url: section.content.image_url || '',
      badge: section.content.badge || '',
    });

    if (section.section_type === 'HERO') {
      const rawSlides = section.content.slides;
      const initialSlides: HeroSlide[] =
        rawSlides && rawSlides.length > 0
          ? JSON.parse(JSON.stringify(rawSlides))
          : [
              {
                id: 'slide-1',
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
      setHeroSlides(initialSlides);
      setActiveSlideIdx(0);
      setAutoplayInterval(section.content.autoplay_interval || 5000);
    }
  };

  // Hero Carousel helpers
  const updateCurrentSlide = (patch: Partial<HeroSlide>) => {
    setHeroSlides((prev) =>
      prev.map((slide, idx) => (idx === activeSlideIdx ? { ...slide, ...patch } : slide))
    );
  };

  const handleAddSlide = () => {
    const newSlide: HeroSlide = {
      id: `slide-${Date.now()}`,
      heading: 'New Editorial Collection',
      badge: 'Atelier Spotlight',
      description:
        'Handcrafted luxury silhouettes tailored with pure silk drapes and bespoke finishing.',
      button_text: 'Explore Collection',
      button_link: '/shop',
      secondary_button_text: 'Bespoke Order',
      secondary_button_link: '/custom',
      image_url:
        'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=1600',
    };
    const nextList = [...heroSlides, newSlide];
    setHeroSlides(nextList);
    setActiveSlideIdx(nextList.length - 1);
  };

  const handleDeleteSlide = (index: number) => {
    if (heroSlides.length <= 1) return;
    const nextList = heroSlides.filter((_, i) => i !== index);
    setHeroSlides(nextList);
    setActiveSlideIdx(Math.max(0, index - 1));
  };

  const handleMoveSlide = (fromIndex: number, direction: -1 | 1) => {
    const toIndex = fromIndex + direction;
    if (toIndex < 0 || toIndex >= heroSlides.length) return;
    const nextList = [...heroSlides];
    const [moved] = nextList.splice(fromIndex, 1);
    nextList.splice(toIndex, 0, moved);
    setHeroSlides(nextList);
    setActiveSlideIdx(toIndex);
  };

  const handleSaveEdit = async (section: HomepageSection) => {
    setIsSaving(true);
    let payload: any = { ...editFields };

    if (section.section_type === 'HERO') {
      payload = {
        ...payload,
        slides: heroSlides,
        autoplay_interval: autoplayInterval,
        // Sync top-level fields for backwards compatibility
        heading: heroSlides[0]?.heading || editFields.heading,
        badge: heroSlides[0]?.badge || editFields.badge,
        description: heroSlides[0]?.description || editFields.description,
        button_text: heroSlides[0]?.button_text || editFields.button_text,
        button_link: heroSlides[0]?.button_link || editFields.button_link,
        secondary_button_text: heroSlides[0]?.secondary_button_text || '',
        secondary_button_link: heroSlides[0]?.secondary_button_link || '',
        image_url: heroSlides[0]?.image_url || editFields.image_url,
      };
    }

    try {
      const updated = await updateSectionContentAction(section.id, payload);
      setSections(updated);
      router.refresh();
      setEditingId(null);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to save homepage section:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const currentHeroSlide = heroSlides[activeSlideIdx];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 pb-5">
        <div>
          <h1 className="font-serif text-3xl text-[#1A1A1A] font-light">
            Homepage Section CMS
          </h1>
          <p className="text-xs text-neutral-500 font-light mt-1">
            Organize homepage section flow with Move Up / Move Down buttons, toggle visibility, and update copy & hero carousel slides.
          </p>
        </div>
        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Changes Saved to Live Home</span>
          </div>
        )}
      </div>

      {/* Sections List */}
      <div className="space-y-4">
        {sections.map((section, index) => {
          const isBeingEdited = editingId === section.id;

          return (
            <div
              key={section.id}
              className={`bg-white border transition-all shadow-xs ${
                section.is_visible ? 'border-neutral-200' : 'border-neutral-200 opacity-60 bg-neutral-50/50'
              }`}
            >
              {/* Section Bar */}
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-neutral-100">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-neutral-100 border border-neutral-200 text-xs font-semibold flex items-center justify-center text-neutral-700 rounded-xs shrink-0">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-serif text-base sm:text-lg font-medium text-[#1A1A1A]">
                        {section.title}
                      </h3>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-xs">
                        {section.section_type}
                      </span>
                      {section.section_type === 'HERO' && section.content.slides && (
                        <span className="text-[10px] font-medium px-2 py-0.5 bg-pink-50 text-[#FF55D2] border border-pink-100 rounded-xs">
                          {section.content.slides.length} Carousel Slides
                        </span>
                      )}
                      {section.section_type === 'REVIEWS' && (
                        <span className="text-[10px] font-medium px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-100 rounded-xs">
                          Testimonials Marquee
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 mt-0.5 truncate">
                      {section.content.heading || section.content.description || 'Predefined layout section'}
                    </p>
                  </div>
                </div>

                {/* Section Controls Toolbar */}
                <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
                  <div className="flex items-center gap-1.5">
                    {/* Move Up */}
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveUp(index)}
                      className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center border border-neutral-200 rounded-xs hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed text-neutral-700 active:scale-90 transition-transform"
                      title="Move section up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>

                    {/* Move Down */}
                    <button
                      type="button"
                      disabled={index === sections.length - 1}
                      onClick={() => handleMoveDown(index)}
                      className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center border border-neutral-200 rounded-xs hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed text-neutral-700 active:scale-90 transition-transform"
                      title="Move section down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>

                    {/* Visibility Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleVisibility(section.id, section.is_visible)}
                      className={`w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center border rounded-xs transition-colors active:scale-90 ${
                        section.is_visible
                          ? 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                          : 'border-neutral-200 text-neutral-400 bg-neutral-100 hover:bg-neutral-200'
                      }`}
                      title={section.is_visible ? 'Visible on Homepage' : 'Hidden from Homepage'}
                    >
                      {section.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Edit Content */}
                  <button
                    type="button"
                    onClick={() => (isBeingEdited ? setEditingId(null) : startEditing(section))}
                    className="min-h-[38px] px-3.5 py-1.5 bg-[#1A1A1A] hover:bg-[#FF55D2] text-white text-xs uppercase tracking-wider font-semibold transition-colors flex items-center justify-center gap-1.5 rounded-xs active:scale-95"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>{isBeingEdited ? 'Cancel' : section.section_type === 'HERO' ? 'Manage Carousel' : 'Edit Text'}</span>
                  </button>
                </div>
              </div>

              {/* Inline Editor Drawer */}
              {isBeingEdited && (
                <>
                  {section.section_type === 'HERO' ? (
                    /* HERO CAROUSEL STUDIO */
                    <div className="p-5 sm:p-6 bg-[#FAF9F6] border-t border-neutral-200 space-y-6 animate-in slide-in-from-top-2 duration-200">
                      {/* Studio Header & Autoplay Interval */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-200/80">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-xs bg-[#FF55D2]/10 border border-[#FF55D2]/20 flex items-center justify-center text-[#FF55D2]">
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <h4 className="text-xs uppercase tracking-wider font-semibold text-[#1A1A1A]">
                              Hero Full-Section Carousel Studio
                            </h4>
                            <p className="text-[11px] text-neutral-500 font-light">
                              Manage editorial slides, headlines, imagery, CTA buttons & autoplay rotation.
                            </p>
                          </div>
                        </div>

                        {/* Autoplay interval selector */}
                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-neutral-200 rounded-xs shadow-xs self-start sm:self-auto">
                          <Clock className="w-3.5 h-3.5 text-neutral-500" />
                          <span className="text-[11px] text-neutral-600 font-medium whitespace-nowrap">
                            Autoplay:
                          </span>
                          <select
                            value={autoplayInterval}
                            onChange={(e) => setAutoplayInterval(Number(e.target.value))}
                            className="text-xs bg-transparent text-neutral-800 font-medium focus:outline-none cursor-pointer"
                          >
                            <option value={3500}>3.5s (Fast)</option>
                            <option value={5000}>5.0s (Standard Luxury)</option>
                            <option value={7000}>7.0s (Relaxed Editorial)</option>
                            <option value={10000}>10.0s (Slow Display)</option>
                          </select>
                        </div>
                      </div>

                      {/* Slide Tabs Navigation */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold">
                            Carousel Slides ({heroSlides.length})
                          </span>
                          <button
                            type="button"
                            onClick={handleAddSlide}
                            className="px-3 py-1 bg-white hover:bg-neutral-50 border border-dashed border-[#FF55D2] text-[#FF55D2] text-xs font-semibold rounded-xs flex items-center gap-1.5 transition-colors shadow-xs active:scale-95"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Slide</span>
                          </button>
                        </div>

                        {/* Tabs horizontal list */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-1">
                          {heroSlides.map((slide, sIdx) => {
                            const isActive = sIdx === activeSlideIdx;
                            return (
                              <button
                                key={slide.id || sIdx}
                                type="button"
                                onClick={() => setActiveSlideIdx(sIdx)}
                                className={`px-3.5 py-2 text-xs font-medium rounded-xs border transition-all flex items-center gap-2 shrink-0 ${
                                  isActive
                                    ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-xs'
                                    : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300'
                                }`}
                              >
                                <span
                                  className={`w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center ${
                                    isActive ? 'bg-[#FF55D2] text-white' : 'bg-neutral-200 text-neutral-700'
                                  }`}
                                >
                                  {sIdx + 1}
                                </span>
                                <span className="max-w-[130px] truncate text-left">
                                  {slide.badge || slide.heading?.slice(0, 18) || `Slide ${sIdx + 1}`}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Active Slide Form & Preview */}
                      {currentHeroSlide && (
                        <div className="bg-white border border-neutral-200 p-4 sm:p-5 rounded-xs space-y-5 shadow-xs">
                          {/* Slide Toolbar */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-100">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-[#1A1A1A]">
                                Slide #{activeSlideIdx + 1} Editor
                              </span>
                              <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-neutral-100 text-neutral-500 rounded-xs">
                                ID: {currentHeroSlide.id}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                disabled={activeSlideIdx === 0}
                                onClick={() => handleMoveSlide(activeSlideIdx, -1)}
                                className="px-2.5 py-1 text-xs border border-neutral-200 hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed rounded-xs text-neutral-700 flex items-center gap-1 active:scale-95"
                                title="Move slide earlier in rotation"
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline text-[11px]">Move Earlier</span>
                              </button>

                              <button
                                type="button"
                                disabled={activeSlideIdx === heroSlides.length - 1}
                                onClick={() => handleMoveSlide(activeSlideIdx, 1)}
                                className="px-2.5 py-1 text-xs border border-neutral-200 hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed rounded-xs text-neutral-700 flex items-center gap-1 active:scale-95"
                                title="Move slide later in rotation"
                              >
                                <span className="hidden sm:inline text-[11px]">Move Later</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                disabled={heroSlides.length <= 1}
                                onClick={() => handleDeleteSlide(activeSlideIdx)}
                                className="px-2.5 py-1 text-xs border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed rounded-xs flex items-center gap-1 active:scale-95 ml-1"
                                title={heroSlides.length <= 1 ? 'Cannot delete only slide' : 'Delete this slide'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span className="text-[11px]">Delete</span>
                              </button>
                            </div>
                          </div>

                          {/* Slide Content Fields */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[11px] uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                                Eyebrow Badge
                              </label>
                              <input
                                type="text"
                                value={currentHeroSlide.badge || ''}
                                onChange={(e) => updateCurrentSlide({ badge: e.target.value })}
                                placeholder="e.g. New Season 2026 or Silk Atelier"
                                className="w-full px-3 py-2 bg-neutral-50/50 border border-neutral-300 text-xs rounded-xs focus:outline-none focus:border-[#FF55D2] focus:bg-white"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                                Main Editorial Heading
                              </label>
                              <input
                                type="text"
                                value={currentHeroSlide.heading || ''}
                                onChange={(e) => updateCurrentSlide({ heading: e.target.value })}
                                placeholder="e.g. Artisanal Elegance, Crafted for the Modern Muse"
                                className="w-full px-3 py-2 bg-neutral-50/50 border border-neutral-300 text-xs rounded-xs focus:outline-none focus:border-[#FF55D2] focus:bg-white font-sans"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                              Narrative Description
                            </label>
                            <textarea
                              rows={2}
                              value={currentHeroSlide.description || ''}
                              onChange={(e) => updateCurrentSlide({ description: e.target.value })}
                              placeholder="Describe the collection, silhouettes, or bespoke atelier service..."
                              className="w-full px-3 py-2 bg-neutral-50/50 border border-neutral-300 text-xs rounded-xs focus:outline-none focus:border-[#FF55D2] focus:bg-white resize-none"
                            />
                          </div>

                          {/* CTA Buttons */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-3 bg-neutral-50/80 border border-neutral-200/80 rounded-xs">
                            <div>
                              <label className="block text-[10px] uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                                Primary CTA Label
                              </label>
                              <input
                                type="text"
                                value={currentHeroSlide.button_text || ''}
                                onChange={(e) => updateCurrentSlide({ button_text: e.target.value })}
                                placeholder="Explore Ready-to-Wear"
                                className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 text-xs rounded-xs focus:outline-none focus:border-[#FF55D2]"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                                Primary CTA Link
                              </label>
                              <input
                                type="text"
                                value={currentHeroSlide.button_link || ''}
                                onChange={(e) => updateCurrentSlide({ button_link: e.target.value })}
                                placeholder="/shop"
                                className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 text-xs rounded-xs focus:outline-none focus:border-[#FF55D2]"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                                Secondary CTA Label
                              </label>
                              <input
                                type="text"
                                value={currentHeroSlide.secondary_button_text || ''}
                                onChange={(e) => updateCurrentSlide({ secondary_button_text: e.target.value })}
                                placeholder="Custom Tailoring"
                                className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 text-xs rounded-xs focus:outline-none focus:border-[#FF55D2]"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                                Secondary CTA Link
                              </label>
                              <input
                                type="text"
                                value={currentHeroSlide.secondary_button_link || ''}
                                onChange={(e) => updateCurrentSlide({ secondary_button_link: e.target.value })}
                                placeholder="/custom"
                                className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 text-xs rounded-xs focus:outline-none focus:border-[#FF55D2]"
                              />
                            </div>
                          </div>

                          {/* Image URL & Live Preview Card */}
                          <div className="space-y-2">
                            <label className="block text-[11px] uppercase tracking-wider text-neutral-600 font-semibold">
                              Slide Background Image URL
                            </label>
                            <div className="flex flex-col sm:flex-row gap-3">
                              <div className="flex-1">
                                <input
                                  type="url"
                                  value={currentHeroSlide.image_url || ''}
                                  onChange={(e) => updateCurrentSlide({ image_url: e.target.value })}
                                  placeholder="https://images.unsplash.com/photo-..."
                                  className="w-full px-3 py-2 bg-neutral-50/50 border border-neutral-300 text-xs rounded-xs focus:outline-none focus:border-[#FF55D2] focus:bg-white"
                                />
                                <p className="text-[11px] text-neutral-400 mt-1 font-light">
                                  High-resolution fashion or editorial image URL. A cinematic dark gradient overlay is automatically applied to guarantee optimal contrast.
                                </p>
                              </div>

                              {/* Live Preview Thumbnail */}
                              {currentHeroSlide.image_url && (
                                <div className="relative w-full sm:w-48 h-24 bg-neutral-900 rounded-xs overflow-hidden border border-neutral-300 shrink-0">
                                  <img
                                    src={currentHeroSlide.image_url}
                                    alt="Slide Preview"
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent p-2 flex flex-col justify-end">
                                    <span className="text-[9px] uppercase tracking-wider text-white/70 font-mono">Live Backdrop</span>
                                    <span className="text-[10px] text-white font-sans truncate">{currentHeroSlide.heading || 'Editorial'}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Bottom Action Controls */}
                      <div className="pt-2 flex flex-col sm:flex-row justify-end gap-2 border-t border-neutral-200">
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="w-full sm:w-auto min-h-[42px] px-4 py-2 border border-neutral-300 text-xs uppercase tracking-wider text-neutral-700 hover:bg-neutral-100 rounded-xs flex items-center justify-center active:scale-95"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => handleSaveEdit(section)}
                          className="w-full sm:w-auto min-h-[42px] px-6 py-2 bg-[#FF55D2] hover:bg-[#FD00B9] disabled:opacity-50 text-white text-xs uppercase tracking-wider font-semibold rounded-xs active:scale-95 flex items-center justify-center gap-2 shadow-xs"
                        >
                          {isSaving ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Saving Carousel...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Apply Carousel Updates</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* STANDARD SECTION EDITOR */
                    <div className="p-6 bg-[#FAF9F6] border-t border-neutral-200 space-y-4 animate-in slide-in-from-top-2 duration-200">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h4 className="text-xs uppercase tracking-wider font-semibold text-neutral-700">
                          Edit {section.title} Content
                        </h4>
                        {section.section_type === 'REVIEWS' && (
                          <Link
                            href="/admin/reviews"
                            className="inline-flex items-center gap-1.5 text-xs text-[#FF55D2] hover:text-[#FD00B9] font-medium transition-colors"
                          >
                            <span>Manage Individual Reviews & Ratings</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>

                      {section.section_type === 'REVIEWS' && (
                        <div className="p-3.5 bg-purple-50/70 border border-purple-200/70 rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xs bg-purple-100 border border-purple-200 text-purple-700 flex items-center justify-center shrink-0">
                              <MessageSquareQuote className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-purple-950">
                                Client Reviews Marquee Section
                              </p>
                              <p className="text-[11px] text-purple-700/80">
                                You can reorder this section, toggle its visibility, or customize its headline here. To add, edit, or delete customer testimonials, star ratings, and patron photos, use the Reviews Manager.
                              </p>
                            </div>
                          </div>
                          <Link
                            href="/admin/reviews"
                            className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xs flex items-center gap-1.5 shrink-0 self-start sm:self-auto transition-colors shadow-xs active:scale-95"
                          >
                            <span>Open Reviews Hub</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                            Main Heading
                          </label>
                          <input
                            type="text"
                            value={editFields.heading}
                            onChange={(e) => setEditFields({ ...editFields, heading: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-neutral-300 text-xs rounded-xs focus:outline-none focus:border-[#FF55D2]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                            Subtitle / Eyebrow Text
                          </label>
                          <input
                            type="text"
                            value={editFields.subtitle}
                            onChange={(e) => setEditFields({ ...editFields, subtitle: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-neutral-300 text-xs rounded-xs focus:outline-none focus:border-[#FF55D2]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                          Narrative / Description
                        </label>
                        <textarea
                          rows={2}
                          value={editFields.description}
                          onChange={(e) => setEditFields({ ...editFields, description: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-neutral-300 text-xs rounded-xs focus:outline-none focus:border-[#FF55D2] resize-none"
                        />
                      </div>

                      {section.section_type !== 'REVIEWS' && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-[11px] uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                              Button Label
                            </label>
                            <input
                              type="text"
                              value={editFields.button_text}
                              onChange={(e) => setEditFields({ ...editFields, button_text: e.target.value })}
                              className="w-full px-3 py-2 bg-white border border-neutral-300 text-xs rounded-xs focus:outline-none focus:border-[#FF55D2]"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                              Button Link Destination
                            </label>
                            <input
                              type="text"
                              value={editFields.button_link}
                              onChange={(e) => setEditFields({ ...editFields, button_link: e.target.value })}
                              className="w-full px-3 py-2 bg-white border border-neutral-300 text-xs rounded-xs focus:outline-none focus:border-[#FF55D2]"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                              Image URL
                            </label>
                            <input
                              type="url"
                              value={editFields.image_url}
                              onChange={(e) => setEditFields({ ...editFields, image_url: e.target.value })}
                              className="w-full px-3 py-2 bg-white border border-neutral-300 text-xs rounded-xs focus:outline-none focus:border-[#FF55D2]"
                            />
                          </div>
                        </div>
                      )}

                      <div className="pt-2 flex flex-col sm:flex-row justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="w-full sm:w-auto min-h-[42px] px-4 py-2 border border-neutral-300 text-xs uppercase tracking-wider text-neutral-700 hover:bg-neutral-100 rounded-xs flex items-center justify-center active:scale-95"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => handleSaveEdit(section)}
                          className="w-full sm:w-auto min-h-[42px] px-6 py-2 bg-[#FF55D2] hover:bg-[#FD00B9] disabled:opacity-50 text-white text-xs uppercase tracking-wider font-semibold rounded-xs active:scale-95 flex items-center justify-center gap-2 shadow-xs"
                        >
                          {isSaving ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Saving...</span>
                            </>
                          ) : (
                            <span>Apply Changes</span>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

