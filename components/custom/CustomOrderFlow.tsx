'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Sparkles, MessageCircle, Scissors, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import { StoreSettings, CustomInquiryDetails } from '@/lib/types';
import { generateCustomInquiryWhatsAppUrl } from '@/lib/whatsapp';

interface CustomOrderFlowProps {
  settings: StoreSettings;
}

export default function CustomOrderFlow({ settings }: CustomOrderFlowProps) {
  const [formData, setFormData] = useState<CustomInquiryDetails>({
    name: '',
    phone: '',
    dressType: 'Bridal Saree',
    sizeOrMeasurements: '',
    preferredFabric: '',
    preferredColor: '',
    notes: '',
  });

  const [validated, setValidated] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.sizeOrMeasurements.trim()) {
      setValidated(true);
      return;
    }

    const waUrl = generateCustomInquiryWhatsAppUrl(formData, settings.whatsapp_number);
    window.open(waUrl, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      {/* Header Statement */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#FAF9F6] border border-neutral-200 text-xs uppercase tracking-widest text-[#FF55D2] font-semibold mb-4">
          <Scissors className="w-3.5 h-3.5" />
          <span>Custom Tailoring & Design</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#1A1A1A] font-light leading-tight">
          Custom Made to Your Measurements
        </h1>
        <p className="mt-4 text-sm sm:text-base text-neutral-600 font-light leading-relaxed">
          From wedding outfits to festive dresses, talk directly with us on WhatsApp to create an outfit tailored to your measurements and personal preferences.
        </p>
      </div>

      {/* 4-Step Process Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-20">
        {[
          {
            step: '01',
            title: 'Share Your Idea',
            desc: 'Tell us what style you want below and chat directly with us on WhatsApp.',
          },
          {
            step: '02',
            title: 'Measurements & Fabric',
            desc: 'We help you with simple measurements and show you available fabrics (silks, organzas, velvets).',
          },
          {
            step: '03',
            title: 'Careful Tailoring',
            desc: 'Our tailors cut and stitch your garment carefully according to your measurements.',
          },
          {
            step: '04',
            title: 'Doorstep Delivery',
            desc: 'Delivered safely to your address anywhere in India with prompt updates.',
          },
        ].map((item) => (
          <div key={item.step} className="p-6 bg-[#FAF9F6] border border-neutral-200 flex flex-col justify-between">
            <div>
              <span className="font-sans text-3xl text-[#FF55D2] font-semibold block mb-2">
                {item.step}
              </span>
              <h3 className="font-serif text-lg font-medium text-[#1A1A1A] mb-2">
                {item.title}
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed font-light">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Consultation Inquiry Form + Visual Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-white border border-neutral-200 shadow-sm overflow-hidden">
        {/* Form Column */}
        <div className="lg:col-span-7 p-8 sm:p-12">
          <h2 className="font-serif text-2xl sm:text-3xl text-[#1A1A1A] font-light mb-2">
            Start Your Custom Order
          </h2>
          <p className="text-xs text-neutral-500 mb-8 font-light">
            Fill in your details below. Clicking "Start on WhatsApp" will format your inquiry into a WhatsApp message where you can send reference photos directly to our stylist.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-800 mb-1.5">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya Fernando"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 text-xs text-[#1A1A1A] focus:bg-white focus:outline-none focus:border-[#FF55D2] rounded-xs"
                />
                {validated && !formData.name && (
                  <span className="text-[11px] text-red-500 mt-1 block">Name is required</span>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-800 mb-1.5">
                  WhatsApp Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +94 77 123 4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 text-xs text-[#1A1A1A] focus:bg-white focus:outline-none focus:border-[#FF55D2] rounded-xs"
                />
                {validated && !formData.phone && (
                  <span className="text-[11px] text-red-500 mt-1 block">Phone is required</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Garment Type */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-800 mb-1.5">
                  Garment Type
                </label>
                <select
                  value={formData.dressType}
                  onChange={(e) => setFormData({ ...formData, dressType: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 text-xs text-[#1A1A1A] focus:bg-white focus:outline-none focus:border-[#FF55D2] rounded-xs"
                >
                  <option value="Bridal Saree & Blouse">Bridal Saree & Blouse</option>
                  <option value="Festive Lehenga Set">Festive Lehenga Set</option>
                  <option value="Custom Evening Gown">Custom Evening Gown</option>
                  <option value="Embroidered Designer Blouse">Embroidered Designer Blouse</option>
                  <option value="Party / Cocktail Dress">Party / Cocktail Dress</option>
                  <option value="Other Custom Outfit">Other Custom Outfit</option>
                </select>
              </div>

              {/* Size or Measurements */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-800 mb-1.5">
                  Size or Approximate Measurements *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Size M, or Bust 36, Waist 28"
                  value={formData.sizeOrMeasurements}
                  onChange={(e) => setFormData({ ...formData, sizeOrMeasurements: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 text-xs text-[#1A1A1A] focus:bg-white focus:outline-none focus:border-[#FF55D2] rounded-xs"
                />
                {validated && !formData.sizeOrMeasurements && (
                  <span className="text-[11px] text-red-500 mt-1 block">Size/measurements required</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Preferred Fabric */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-800 mb-1.5">
                  Preferred Fabric (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pure Silk, Organza, Velvet, Georgette"
                  value={formData.preferredFabric}
                  onChange={(e) => setFormData({ ...formData, preferredFabric: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 text-xs text-[#1A1A1A] focus:bg-white focus:outline-none focus:border-[#FF55D2] rounded-xs"
                />
              </div>

              {/* Preferred Color */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-800 mb-1.5">
                  Preferred Color Palette (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Crimson Red, Emerald Green, Blush"
                  value={formData.preferredColor}
                  onChange={(e) => setFormData({ ...formData, preferredColor: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 text-xs text-[#1A1A1A] focus:bg-white focus:outline-none focus:border-[#FF55D2] rounded-xs"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-800 mb-1.5">
                Special Styling Notes or Questions
              </label>
              <textarea
                rows={3}
                placeholder="Mention desired neckline, embroidery intensity, occasion date, or styling details..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 text-xs text-[#1A1A1A] focus:bg-white focus:outline-none focus:border-[#FF55D2] rounded-xs resize-none"
              />
            </div>

            {/* Notice about photos */}
            <div className="p-3.5 bg-neutral-50 border border-neutral-200 text-xs text-neutral-600 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-[#FF55D2] flex-shrink-0 mt-0.5" />
              <span>
                <strong>Have reference photos?</strong> You can attach images and sketches directly in WhatsApp once the chat opens.
              </span>
            </div>

            {/* CTA */}
            <button
              type="submit"
              className="w-full py-4 px-6 bg-[#FF55D2] hover:bg-[#FD00B9] active:bg-[#D5009C] text-white text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Start Order on WhatsApp</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Visual Column */}
        <div className="lg:col-span-5 relative bg-neutral-100 min-h-[400px]">
          <Image
            src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=1000"
            alt="Custom Tailoring and Bridal Embroidery - Fairy Finds Boutique"
            fill
            sizes="(max-width: 1024px) 100vw, 500px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 text-white">
            <p className="text-xs uppercase tracking-widest text-[#FF55D2] font-semibold mb-1">
              Boutique Commitment
            </p>
            <h3 className="font-serif text-2xl font-light">
              Every Stitch Tells Your Story
            </h3>
            <p className="text-xs text-neutral-300 mt-2 font-light">
              We specialize in custom bridal trousseaus, festive attire, and evening gowns, providing attentive personal service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
