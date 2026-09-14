import React from 'react';
import { Metadata } from 'next';
import { getSettings } from '@/lib/data/store';
import CheckoutClient from '@/components/cart/CheckoutClient';

export const metadata: Metadata = {
  title: 'Your Bag & WhatsApp Order',
  description:
    'Review your selected ready-to-wear pieces and complete your boutique order directly via WhatsApp.',
  robots: {
    index: false,
    follow: false,
    noarchive: true,
  },
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CartPage() {
  const settings = await getSettings();

  return <CheckoutClient settings={settings} />;
}
