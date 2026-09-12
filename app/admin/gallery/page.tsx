import React from 'react';
import { getCustomerPhotos, getProducts } from '@/lib/data/store';
import CustomerGalleryCMSClient from '@/components/admin/CustomerGalleryCMSClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminGalleryPage() {
  const [photos, products] = await Promise.all([
    getCustomerPhotos(),
    getProducts(),
  ]);

  return <CustomerGalleryCMSClient initialPhotos={photos} products={products} />;
}
