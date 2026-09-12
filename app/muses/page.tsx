import React from 'react';
import { Metadata } from 'next';
import { getCustomerPhotos, getSettings } from '@/lib/data/store';
import CustomerMusesClient from '@/components/gallery/CustomerMusesClient';

export const metadata: Metadata = {
  title: 'Client Diaries & Muses | Fairy Finds Boutique',
  description:
    'A curated showcase of celebratory moments, real client photography, and heirloom silhouettes worn by patrons of Fairy Finds across the globe.',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function MusesPage() {
  const [photos, settings] = await Promise.all([
    getCustomerPhotos(),
    getSettings(),
  ]);

  return <CustomerMusesClient initialPhotos={photos} settings={settings} />;
}
