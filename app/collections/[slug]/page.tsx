import React from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import { getCollectionBySlug, getProducts, getSettings } from '@/lib/data/store';
import ProductCard from '@/components/ui/ProductCard';
import JsonLd from '@/components/seo/JsonLd';
import { generateBreadcrumbSchema, generateItemListSchema } from '@/lib/seo/schema';
import { SITE_URL } from '@/lib/seo/constants';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface CollectionPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [collection, settings] = await Promise.all([
    getCollectionBySlug(slug),
    getSettings().catch(() => null),
  ]);

  if (!collection) {
    return {
      title: 'Collection Not Found | Fairy Finds Boutique',
      robots: { index: false, follow: false },
    };
  }

  const canonicalBase = settings?.seo_config?.global?.canonical_base || SITE_URL;

  const title = `${collection.name} Collection`;
  const description =
    collection.description ||
    `Explore the ${collection.name} collection at Fairy Finds Boutique in Kottayam, Kerala. Quality women\'s fashion with all-India shipping.`;

  const canonicalUrl = `${canonicalBase}/collections/${collection.slug}`;
  const ogTitle = `${collection.name} Collection | Fairy Finds Boutique`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: ogTitle,
      description,
      url: canonicalUrl,
      images: collection.image_url ? [{ url: collection.image_url, alt: collection.name }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description,
      images: collection.image_url ? [collection.image_url] : undefined,
    },
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
    (p) =>
      p.is_published &&
      (p.collection_id === collection.id ||
        p.collection_name?.toLowerCase() === collection.name.toLowerCase())
  );

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Shop', url: '/shop' },
    { name: `${collection.name} Collection`, url: `/collections/${collection.slug}` },
  ];

  const itemList = generateItemListSchema(
    `${collection.name} Collection - Fairy Finds Boutique`,
    collectionProducts.map((p) => ({
      name: p.name,
      slug: p.slug,
      image: p.images?.[0],
      price: p.price,
    }))
  );

  return (
    <div>
      <JsonLd data={generateBreadcrumbSchema(breadcrumbs)} id="collection-breadcrumbs-jsonld" />
      <JsonLd data={itemList} id="collection-itemlist-jsonld" />

      {/* Editorial Collection Hero */}
      <div className="relative py-24 md:py-32 bg-[#1A1A1A] text-white overflow-hidden">
        {collection.image_url && (
          <div className="absolute inset-0 opacity-40">
            <Image
              src={collection.image_url}
              alt={`${collection.name} signature edit - Fairy Finds Boutique`}
              fill
              priority
              className="object-cover object-center"
            />
          </div>
        )}
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4 z-10">
          <nav aria-label="Breadcrumb" className="text-xs uppercase tracking-widest text-neutral-300 flex items-center justify-center gap-2 mb-2">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-white transition-colors">Shop</Link>
            <span>/</span>
            <span className="text-[#FF55D2] font-semibold">{collection.name}</span>
          </nav>
          <p className="text-xs uppercase tracking-[0.3em] text-[#FF55D2] font-semibold">
            SIGNATURE BOUTIQUE EDIT
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light text-white">
            {collection.name}
          </h1>
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
          <div className="py-20 text-center bg-[#FAF9F6] p-8 border border-neutral-200">
            <h2 className="font-serif text-2xl text-[#1A1A1A] mb-2">Collection Arriving Soon</h2>
            <p className="text-xs text-neutral-500 mb-6">
              New couture pieces for this collection are currently being handcrafted in the boutique studio.
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
