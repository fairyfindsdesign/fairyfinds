import React from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getCollectionBySlug, getProducts } from '@/lib/data/store';
import ProductCard from '@/components/ui/ProductCard';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface CollectionPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);

  if (!collection) {
    return { title: 'Collection Not Found' };
  }

  return {
    title: `${collection.name} Collection | Fairy Finds Boutique`,
    description: collection.description,
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const [collection, allProducts] = await Promise.all([
    getCollectionBySlug(slug),
    getProducts(),
  ]);

  if (!collection) {
    notFound();
  }

  const collectionProducts = allProducts.filter(
    (p) => p.collection_id === collection.id || p.collection_name?.toLowerCase() === collection.name.toLowerCase()
  );

  return (
    <div>
      {/* Editorial Collection Hero */}
      <div className="relative py-24 md:py-32 bg-[#1A1A1A] text-white overflow-hidden">
        {collection.image_url && (
          <div className="absolute inset-0 opacity-40">
            <Image
              src={collection.image_url}
              alt={collection.name}
              fill
              priority
              className="object-cover object-center"
            />
          </div>
        )}
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4 z-10">
          <p className="text-xs uppercase tracking-[0.3em] text-[#FF55D2] font-semibold">
            CURATED BOUTIQUE EDIT
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light text-white">
            {collection.name}
          </h1>
          {collection.description && (
            <p className="text-neutral-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-light">
              {collection.description}
            </p>
          )}
        </div>
      </div>

      {/* Collection Catalog */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex justify-between items-center pb-6 mb-8 border-b border-neutral-200">
          <p className="text-xs uppercase tracking-widest text-neutral-500">
            Showing {collectionProducts.length} Piece{collectionProducts.length === 1 ? '' : 's'}
          </p>
          <Link
            href="/shop"
            className="text-xs uppercase tracking-widest font-semibold text-[#1A1A1A] hover:text-[#FF55D2] transition-colors"
          >
            Explore All Styles →
          </Link>
        </div>

        {collectionProducts.length === 0 ? (
          <div className="py-20 text-center bg-neutral-50 p-8 border border-neutral-200">
            <h3 className="font-serif text-2xl text-[#1A1A1A] mb-2">Collection Arriving Soon</h3>
            <p className="text-xs text-neutral-500 mb-6">
              New couture pieces for this collection are currently being handcrafted in the atelier.
            </p>
            <Link
              href="/shop"
              className="px-6 py-2.5 bg-[#1A1A1A] text-white text-xs uppercase tracking-widest hover:bg-[#FF55D2] transition-colors"
            >
              Browse Available Ready-to-Wear
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {collectionProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
