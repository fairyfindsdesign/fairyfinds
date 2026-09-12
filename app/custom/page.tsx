import React from 'react';
import { Metadata } from 'next';
import { getSettings } from '@/lib/data/store';
import CustomOrderFlow from '@/components/custom/CustomOrderFlow';

export const metadata: Metadata = {
  title: 'Custom Made & Bespoke Tailoring',
  description:
    'Design your dream garment with Fairy Finds Boutique. Discuss measurements, fabric selections, and fittings directly through WhatsApp.',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CustomMadePage() {
  const settings = await getSettings();

  return <CustomOrderFlow settings={settings} />;
}
