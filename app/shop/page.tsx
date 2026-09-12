import React from 'react';
import { getProducts, getCategories, getCollections } from '@/lib/data/store';
import ShopClient from '@/components/shop/ShopClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    collection?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const [products, categories, collections] = await Promise.all([
    getProducts(),
    getCategories(),
    getCollections(),
  ]);

  return (
    <ShopClient
      initialProducts={products}
      categories={categories}
      collections={collections}
      initialCategory={params.category}
      initialCollection={params.collection}
    />
  );
}
