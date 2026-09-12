import React from 'react';
import { getProducts } from '@/lib/data/store';
import ProductListClient from '@/components/admin/ProductListClient';

export const revalidate = 0;

export default async function AdminProductsPage() {
  const products = await getProducts();

  return <ProductListClient initialProducts={products} />;
}
