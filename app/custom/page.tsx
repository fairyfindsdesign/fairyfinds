import React from 'react';
import { Metadata } from 'next';
import { getSettings } from '@/lib/data/store';
import CustomOrderFlow from '@/components/custom/CustomOrderFlow';
import JsonLd from '@/components/seo/JsonLd';
import { generateBreadcrumbSchema } from '@/lib/seo/schema';
import { SITE_URL, formatMetaTitle } from '@/lib/seo/constants';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const customSeo = settings.seo_config?.pages?.custom;
  const canonicalBase = settings.seo_config?.global?.canonical_base || SITE_URL;

  const rawTitle = customSeo?.title || 'Custom-Made Dresses & Bespoke Tailoring';
  const title = formatMetaTitle(rawTitle);
  const description =
    customSeo?.description ||
    'Commission custom-made dresses, bridal sarees, lehengas, and bespoke tailored outfits with Fairy Finds Boutique in Kottayam, Kerala. One-on-one WhatsApp design consultations and delivery across India.';

  return {
    title: {
      absolute: title,
    },
    description,
    alternates: {
      canonical: `${canonicalBase}/custom`,
    },
    openGraph: {
      title,
      description,
      url: `${canonicalBase}/custom`,
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

export default async function CustomMadePage() {
  const settings = await getSettings();

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Custom Tailoring', url: '/custom' },
  ];

  return (
    <>
      <JsonLd data={generateBreadcrumbSchema(breadcrumbs)} id="custom-breadcrumbs-jsonld" />
      <CustomOrderFlow settings={settings} />
    </>
  );
}
