import React from 'react';
import { Metadata } from 'next';
import { getSettings, getCustomDesigns } from '@/lib/data/store';
import CustomOrderFlow from '@/components/custom/CustomOrderFlow';
import CustomDesignsShowcase from '@/components/custom/CustomDesignsShowcase';
import JsonLd from '@/components/seo/JsonLd';
import { generateBreadcrumbSchema } from '@/lib/seo/schema';
import { SITE_URL, formatMetaTitle } from '@/lib/seo/constants';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const customSeo = settings.seo_config?.pages?.custom;
  const canonicalBase = settings.seo_config?.global?.canonical_base || SITE_URL;

  const rawTitle = customSeo?.title || 'Custom-Made Dresses & Tailoring';
  const title = formatMetaTitle(rawTitle);
  const description =
    customSeo?.description ||
    'Order custom-made dresses, bridal sarees, lehengas, and tailored outfits with Fairy Finds Boutique in Kottayam, Kerala. One-on-one WhatsApp consultations and all-India delivery.';

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
  const [settings, designs] = await Promise.all([
    getSettings(),
    getCustomDesigns(),
  ]);

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Custom Tailoring', url: '/custom' },
  ];

  return (
    <>
      <JsonLd data={generateBreadcrumbSchema(breadcrumbs)} id="custom-breadcrumbs-jsonld" />
      <CustomOrderFlow settings={settings} />
      <div id="showcase">
        <CustomDesignsShowcase
          designs={designs}
          title="Recent Custom Work"
          subtitle="COMPLETED DESIGNS"
          whatsappNumber={settings.whatsapp_number}
          showCta={false}
        />
      </div>
    </>
  );
}
