import React from 'react';
import { getCategories, getProducts } from '@/lib/data/store';
import CategoryManagerClient from '@/components/admin/CategoryManagerClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminCategoriesPage() {
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts(),
  ]);

  return (
    <CategoryManagerClient
      initialCategories={categories}
      products={products}
    />
  );
}
