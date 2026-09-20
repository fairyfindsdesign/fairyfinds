import React from 'react';
import { getCategories, getCollections, getProducts, getSizeCharts } from '@/lib/data/store';
import ProductFormClient from '@/components/admin/ProductFormClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function NewProductPage() {
  const [products, categories, collections, sizeCharts] = await Promise.all([
    getProducts(),
    getCategories(),
    getCollections(),
    getSizeCharts(),
  ]);

  return (
    <ProductFormClient
      initialProduct={null}
      existingProducts={products}
      categories={categories}
      collections={collections}
      sizeCharts={sizeCharts}
    />
  );
}
