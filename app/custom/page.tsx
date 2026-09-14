import React from 'react';
import { Metadata } from 'next';
import { getSettings } from '@/lib/data/store';
import CustomOrderFlow from '@/components/custom/CustomOrderFlow';
import JsonLd from '@/components/seo/JsonLd';
import { generateBreadcrumbSchema } from '@/lib/seo/schema';
import { SITE_URL } from '@/lib/seo/constants';

export const metadata: Metadata = {
  title: 'Custom-Made Dresses',
  description:
    'Commission custom-made dresses, bridal sarees, lehengas, and bespoke tailored outfits with Fairy Finds Boutique in Kottayam, Kerala. One-on-one WhatsApp design consultations and delivery across India.',
  alternates: {
    canonical: `${SITE_URL}/custom`,
  },
  openGraph: {
    title: 'Custom-Made Dresses & Bespoke Tailoring | Fairy Finds Boutique',
    description:
      'Commission custom-made dresses, bridal sarees, lehengas, and bespoke tailored outfits with Fairy Finds Boutique in Kottayam, Kerala.',
    url: `${SITE_URL}/custom`,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Custom-Made Dresses | Fairy Finds Boutique',
    description:
      'Commission custom-made dresses, bridal sarees, and bespoke outfits with Fairy Finds Boutique in Kottayam, Kerala.',
  },
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CustomMadePage() {
  const settings = await getSettings();

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Custom-Made Atelier', url: '/custom' },
  ];

  return (
    <>
      <JsonLd data={generateBreadcrumbSchema(breadcrumbs)} id="custom-breadcrumbs-jsonld" />
      <CustomOrderFlow settings={settings} />
    </>
  );
}
