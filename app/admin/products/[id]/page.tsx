import React from 'react';
import { notFound } from 'next/navigation';
import { getProductBySlug, getCategories, getCollections, getProducts, getSizeCharts } from '@/lib/data/store';
import ProductFormClient from '@/components/admin/ProductFormClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface EditProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const [product, allProducts, categories, collections, sizeCharts] = await Promise.all([
    getProductBySlug(id),
    getProducts(),
    getCategories(),
    getCollections(),
    getSizeCharts(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <ProductFormClient
      initialProduct={product}
      existingProducts={allProducts}
      categories={categories}
      collections={collections}
      sizeCharts={sizeCharts}
    />
  );
}
