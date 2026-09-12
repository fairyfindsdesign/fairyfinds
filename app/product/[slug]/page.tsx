import React from 'react';
import { notFound } from 'next/navigation';
import { getProductBySlug, getProducts, getSettings } from '@/lib/data/store';
import ProductDetailClient from '@/components/product/ProductDetailClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: 'Product Not Found' };
  }

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: `${product.name} | Fairy Finds Boutique`,
      description: product.description,
      images: product.images?.[0] ? [{ url: product.images[0] }] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const [product, allProducts, settings] = await Promise.all([
    getProductBySlug(slug),
    getProducts(),
    getSettings(),
  ]);

  if (!product) {
    notFound();
  }

  // Related products from same category or collection
  const relatedProducts = allProducts.filter(
    (p) =>
      p.id !== product.id &&
      (p.category_id === product.category_id || p.collection_id === product.collection_id)
  );

  return (
    <ProductDetailClient
      product={product}
      relatedProducts={relatedProducts}
      settings={settings}
    />
  );
}
