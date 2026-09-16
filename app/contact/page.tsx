import React from 'react';
import Link from 'next/link';
import { getSettings } from '@/lib/data/store';
import { MessageCircle, Mail, MapPin, Clock, Phone } from 'lucide-react';

import { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import { generateBreadcrumbSchema } from '@/lib/seo/schema';
import { SITE_URL, BUSINESS_INFO, formatMetaTitle } from '@/lib/seo/constants';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const contactSeo = settings.seo_config?.pages?.contact;
  const canonicalBase = settings.seo_config?.global?.canonical_base || SITE_URL;

  const rawTitle = contactSeo?.title || 'Contact & Atelier Location in Kottayam';
  const title = formatMetaTitle(rawTitle);
  const description =
    contactSeo?.description ||
    'Contact Fairy Finds Boutique in Neendoor, Kottayam, Kerala. Connect via WhatsApp or email for ready-to-wear orders, bespoke bridal tailoring, and consultations across India.';

  return {
    title: {
      absolute: title,
    },
    description,
    alternates: {
      canonical: `${canonicalBase}/contact`,
    },
    openGraph: {
      title,
      description,
      url: `${canonicalBase}/contact`,
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

export default async function ContactPage() {
  const settings = await getSettings();
  const cleanNumber = settings.whatsapp_number.replace(/[^0-9]/g, '');

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Contact Us', url: '/contact' },
  ];

  const contactSchema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact Fairy Finds Boutique',
    description: 'Contact details and atelier location for Fairy Finds Boutique in Kottayam, Kerala.',
    url: `${SITE_URL}/contact`,
    mainEntity: {
      '@type': 'ClothingStore',
      name: BUSINESS_INFO.name,
      telephone: settings.whatsapp_number || BUSINESS_INFO.telephone,
      email: settings.contact_email || BUSINESS_INFO.email,
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Neendoor',
        addressLocality: 'Kottayam',
        addressRegion: 'Kerala',
        addressCountry: 'IN',
      },
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <JsonLd data={generateBreadcrumbSchema(breadcrumbs)} id="contact-breadcrumbs-jsonld" />
      <JsonLd data={contactSchema} id="contact-schema-jsonld" />
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <p className="text-xs uppercase tracking-[0.25em] text-[#FF55D2] font-semibold mb-2">
          GET IN TOUCH
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl text-[#1A1A1A] font-light">
          We Are Delighted to Assist You
        </h1>
        <p className="mt-3 text-sm text-neutral-500 font-light leading-relaxed">
          For styling guidance, size verification, or custom commission inquiries, our atelier team is available on WhatsApp and email.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
        {/* WhatsApp Card */}
        <div className="p-8 bg-[#FAF9F6] border border-neutral-200 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700">
              <MessageCircle className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-2xl text-[#1A1A1A] font-medium">WhatsApp Atelier</h3>
            <p className="text-xs text-neutral-600 leading-relaxed font-light">
              Immediate replies for order confirmations, custom fittings, and inquiries.
            </p>
            <p className="text-xs font-semibold text-neutral-900 pt-2">
              {settings.whatsapp_number}
            </p>
          </div>

          <a
            href={`https://wa.me/${cleanNumber}?text=Hello%20Fairy%20Finds%20Boutique`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 bg-[#1A1A1A] hover:bg-[#FF55D2] text-white text-xs uppercase tracking-widest font-medium text-center transition-colors block"
          >
            Chat on WhatsApp
          </a>
        </div>

        {/* Email & Instagram Card */}
        <div className="p-8 bg-[#FAF9F6] border border-neutral-200 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="w-12 h-12 bg-neutral-200 rounded-full flex items-center justify-center text-[#1A1A1A]">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-2xl text-[#1A1A1A] font-medium">Email & Social</h3>
            <p className="text-xs text-neutral-600 leading-relaxed font-light">
              Send detailed inquiries, bridal proposals, or follow our journey on social channels.
            </p>
            <p className="text-xs font-semibold text-neutral-900 pt-2">
              {settings.contact_email}
            </p>
          </div>

          <a
            href={`mailto:${settings.contact_email}`}
            className="w-full py-3 border border-neutral-300 hover:border-black text-[#1A1A1A] text-xs uppercase tracking-widest font-medium text-center transition-colors block"
          >
            Send Email
          </a>
        </div>

        {/* Atelier Location Card */}
        <div className="p-8 bg-[#FAF9F6] border border-neutral-200 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="w-12 h-12 bg-neutral-200 rounded-full flex items-center justify-center text-[#1A1A1A]">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-2xl text-[#1A1A1A] font-medium">Atelier Location</h3>
            <p className="text-xs text-neutral-600 leading-relaxed font-light">
              {settings.address}
            </p>
            <div className="pt-2 text-xs text-neutral-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-neutral-400" />
              <span>Mon – Sat: 10:00 AM – 7:00 PM</span>
            </div>
          </div>

          <Link
            href="/custom"
            className="w-full py-3 bg-[#FF55D2] hover:bg-[#FD00B9] text-white text-xs uppercase tracking-widest font-semibold text-center transition-colors block"
          >
            Book Custom Fitting
          </Link>
        </div>
      </div>
    </div>
  );
}
