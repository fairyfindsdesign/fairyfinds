import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, Scissors, Heart, ArrowRight } from 'lucide-react';

import { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import { generateBreadcrumbSchema, generateFaqSchema } from '@/lib/seo/schema';
import { SITE_URL, formatMetaTitle } from '@/lib/seo/constants';
import { getSettings } from '@/lib/data/store';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const aboutSeo = settings.seo_config?.pages?.about;
  const canonicalBase = settings.seo_config?.global?.canonical_base || SITE_URL;

  const rawTitle = aboutSeo?.title || 'Our Story';
  const title = formatMetaTitle(rawTitle);
  const description =
    aboutSeo?.description ||
    'Discover the story of Fairy Finds Boutique based in Neendoor, Kottayam, Kerala. Quality craftsmanship, ready-to-wear dresses, and custom tailored outfits shipping across India.';

  return {
    title: {
      absolute: title,
    },
    description,
    alternates: {
      canonical: `${canonicalBase}/about`,
    },
    openGraph: {
      title,
      description,
      url: `${canonicalBase}/about`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const faqs = [
  {
    question: 'Where is Fairy Finds Boutique located?',
    answer:
      'Fairy Finds Boutique is located in Neendoor, Kottayam, Kerala, India. We serve clients across Kottayam, throughout Kerala, and ship across India and worldwide.',
  },
  {
    question: 'What types of clothing does Fairy Finds offer?',
    answer:
      'We offer ready-to-wear women\'s fashion—including designer sarees, kurtis, dresses, and festive sets—as well as custom-tailored outfits and bridal wear.',
  },
  {
    question: 'Do you offer custom stitching and bridal blouse embroidery in Kottayam?',
    answer:
      'Yes, we specialize in custom stitching, bridal outfits, hand-embroidered wedding blouses, and made-to-measure tailoring with friendly 1-on-1 consultations via WhatsApp.',
  },
  {
    question: 'How can I place an order?',
    answer:
      'You can browse our collections on this website, select your pieces, and complete your order seamlessly with our design team through WhatsApp.',
  },
  {
    question: 'Do you ship across India and internationally?',
    answer:
      'Yes, we provide reliable express courier shipping to every state in India, as well as international shipping for overseas clients and NRI wedding shoppers.',
  },
];

export default function AboutPage() {
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'About Us', url: '/about' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <JsonLd data={generateBreadcrumbSchema(breadcrumbs)} id="about-breadcrumbs-jsonld" />
      <JsonLd data={generateFaqSchema(faqs)} id="about-faq-jsonld" />
      {/* Editorial Title */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <p className="text-xs uppercase tracking-[0.25em] text-[#FF55D2] font-semibold mb-2">
          ABOUT FAIRY FINDS BOUTIQUE
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#1A1A1A] font-light leading-tight">
          Quality Craftsmanship Meets Modern Femininity
        </h1>
        <p className="mt-4 text-sm sm:text-base text-neutral-600 font-light leading-relaxed">
          Rooted in Neendoor, Kottayam, Fairy Finds Boutique was founded with a singular purpose: to bring graceful dresses, bridal wear, and traditional textile artistry into the modern wardrobe.
        </p>
      </div>

      {/* Hero Visual Banner */}
      <div className="relative aspect-[21/9] w-full bg-neutral-100 overflow-hidden border border-neutral-200 mb-20">
        <Image
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1800"
          alt="Fairy Finds Boutique Studio"
          fill
          priority
          className="object-cover object-center"
        />
      </div>

      {/* Two Column Narrative */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24">
        <div className="space-y-6">
          <span className="text-xs uppercase tracking-widest text-[#FF55D2] font-semibold">
            Our Philosophy
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#1A1A1A] font-light">
            Timeless Elegance, Never Mass Produced
          </h2>
          <p className="text-sm text-neutral-600 leading-relaxed font-light">
            Based in Kottayam, Kerala, every garment at Fairy Finds Boutique is created in limited runs or crafted as an individualized custom bridal order. We believe true luxury lies in the intention behind each stitch, the drape of pure fabrics, and the comfort of garments tailored to celebrate the feminine form.
          </p>
          <p className="text-sm text-neutral-600 leading-relaxed font-light">
            Whether choosing from our ready-to-wear collection or ordering a custom bridal outfit, our clients receive personalized styling attention through direct one-on-one communication on WhatsApp.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="relative aspect-[3/4] bg-neutral-100 border border-neutral-200 overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600"
              alt="Silk weaving craftsmanship"
              fill
              className="object-cover"
            />
          </div>
          <div className="relative aspect-[3/4] bg-neutral-100 border border-neutral-200 overflow-hidden mt-8">
            <Image
              src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=600"
              alt="Embroidered lehenga detail"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>

      {/* Values Grid */}
      <div className="border-t border-neutral-200 pt-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 bg-[#FAF9F6] border border-neutral-200 space-y-3">
            <Sparkles className="w-6 h-6 text-[#FF55D2]" />
            <h3 className="font-serif text-xl font-medium text-[#1A1A1A]">Ready-to-Wear Outfits</h3>
            <p className="text-xs text-neutral-600 leading-relaxed font-light">
              Limited collections made with quality fabrics, ready for immediate delivery with exact size guidance.
            </p>
          </div>

          <div className="p-8 bg-[#FAF9F6] border border-neutral-200 space-y-3">
            <Scissors className="w-6 h-6 text-[#FF55D2]" />
            <h3 className="font-serif text-xl font-medium text-[#1A1A1A]">Custom Tailoring</h3>
            <p className="text-xs text-neutral-600 leading-relaxed font-light">
              Custom orders for bridal wear, wedding sarees, blouse embroidery, and festive outfits made to your measurements.
            </p>
          </div>

          <div className="p-8 bg-[#FAF9F6] border border-neutral-200 space-y-3">
            <Heart className="w-6 h-6 text-[#FF55D2]" />
            <h3 className="font-serif text-xl font-medium text-[#1A1A1A]">Personal Boutique Care</h3>
            <p className="text-xs text-neutral-600 leading-relaxed font-light">
              No automated bots or impersonal checkouts. You converse directly with our team to guarantee delight with every order.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-24 border-t border-neutral-200 pt-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs uppercase tracking-[0.25em] text-[#FF55D2] font-semibold mb-2">
            FREQUENTLY ASKED QUESTIONS
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#1A1A1A] font-light">
            Questions & Answers
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-neutral-500 font-light">
            Helpful information regarding our boutique location, custom stitching services, and ordering.
          </p>
        </div>

        <div className="max-w-3xl mx-auto divide-y divide-neutral-200 border-y border-neutral-200">
          {faqs.map((faq, idx) => (
            <div key={idx} className="py-6 space-y-2">
              <h3 className="font-serif text-lg sm:text-xl font-normal text-[#1A1A1A]">
                {faq.question}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 font-light leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mt-20 text-center bg-[#1A1A1A] text-white p-12 sm:p-16">
        <h2 className="font-serif text-3xl sm:text-4xl font-light mb-4">
          Experience the Fairy Finds Collection
        </h2>
        <p className="text-xs sm:text-sm text-neutral-300 max-w-xl mx-auto mb-8 font-light">
          Discover our current ready-to-wear pieces or start a custom tailoring order today.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/shop"
            className="px-8 py-3.5 bg-[#FF55D2] hover:bg-[#FD00B9] text-white text-xs uppercase tracking-widest font-semibold transition-colors"
          >
            Shop All Pieces
          </Link>
          <Link
            href="/custom"
            className="px-8 py-3.5 border border-neutral-500 hover:border-white text-white text-xs uppercase tracking-widest font-semibold transition-colors"
          >
            Custom Tailoring
          </Link>
        </div>
      </div>
    </div>
  );
}
