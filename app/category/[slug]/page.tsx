import React from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import { getCategories, getProducts, getSettings } from '@/lib/data/store';
import ProductCard from '@/components/ui/ProductCard';
import JsonLd from '@/components/seo/JsonLd';
import { generateBreadcrumbSchema, generateItemListSchema } from '@/lib/seo/schema';
import { SITE_URL } from '@/lib/seo/constants';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [categories, settings] = await Promise.all([
    getCategories(),
    getSettings().catch(() => null),
  ]);
  const category = categories.find((c) => c.slug.toLowerCase() === slug.toLowerCase());

  if (!category) {
    return { title: 'Category Not Found' };
  }

  const canonicalBase = settings?.seo_config?.global?.canonical_base || SITE_URL;

  // Curated natural titles & descriptions based on search intent
  let title = category.name;
  let description =
    category.description ||
    `Shop the ${category.name} collection at Fairy Finds Boutique in Kottayam, Kerala. Artisanal women\'s fashion with shipping across India.`;

  const lowerSlug = category.slug.toLowerCase();
  if (lowerSlug.includes('dress')) {
    title = "Women's Dresses";
    description =
      "Shop ready-to-wear women's dresses from Fairy Finds Boutique in Kottayam, Kerala. Discover fluid silhouettes, floral prints, and contemporary styles with delivery across India.";
  } else if (lowerSlug.includes('saree')) {
    title = 'Saree Collection';
    description =
      'Discover artisanal pure silk, georgette, and organza sarees handcrafted for celebrations by Fairy Finds Boutique in Kottayam, Kerala. All-India shipping available.';
  } else if (lowerSlug.includes('kurithi') || lowerSlug.includes('kurti')) {
    title = 'Kurithi Collection';
    description =
      'Explore elegant ready-to-wear Kurithis and ethnic designer outfits from Fairy Finds Boutique in Kottayam, Kerala. Artisanal craftsmanship with delivery across India.';
  } else if (lowerSlug.includes('blouse') || lowerSlug.includes('top')) {
    title = 'Artisanal Blouses & Tops';
    description =
      'Intricately tailored blouses and structured tops designed to elevate any ensemble. Fairy Finds Boutique, Kottayam, Kerala.';
  }

  const canonicalUrl = `${canonicalBase}/category/${category.slug}`;
  const ogTitle = `${title} | Fairy Finds Boutique`;

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
      images: category.image_url ? [{ url: category.image_url, alt: category.name }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description,
      images: category.image_url ? [category.image_url] : undefined,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const [categories, allProducts] = await Promise.all([
    getCategories(),
    getProducts(),
  ]);

  const category = categories.find((c) => c.slug.toLowerCase() === slug.toLowerCase());

  if (!category) {
    notFound();
  }

  const categoryProducts = allProducts.filter(
    (p) => p.is_published && (p.category_id === category.id || p.category_name?.toLowerCase() === category.name.toLowerCase())
  );

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Shop', url: '/shop' },
    { name: category.name, url: `/category/${category.slug}` },
  ];

  const itemList = generateItemListSchema(
    `${category.name} - Fairy Finds Boutique`,
    categoryProducts.map((p) => ({
      name: p.name,
      slug: p.slug,
      image: p.images?.[0],
      price: p.price,
    }))
  );

  return (
    <div>
      <JsonLd data={generateBreadcrumbSchema(breadcrumbs)} id="breadcrumb-jsonld" />
      <JsonLd data={itemList} id="itemlist-jsonld" />

      {/* Category Editorial Hero Banner */}
      <div className="relative py-20 md:py-28 bg-[#1A1A1A] text-white overflow-hidden">
        {category.image_url && (
          <div className="absolute inset-0 opacity-35">
            <Image
              src={category.image_url}
              alt={`${category.name} collection preview - Fairy Finds Boutique`}
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
            <span className="text-[#FF55D2] font-semibold">{category.name}</span>
          </nav>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light text-white">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-neutral-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-light">
              {category.description}
            </p>
          )}
        </div>
      </div>

      {/* Category Products Catalog */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex justify-between items-center pb-6 mb-8 border-b border-neutral-200">
          <p className="text-xs uppercase tracking-widest text-neutral-500">
            Showing {categoryProducts.length} Piece{categoryProducts.length === 1 ? '' : 's'}
          </p>
          <Link
            href="/shop"
            className="text-xs uppercase tracking-widest font-semibold text-[#1A1A1A] hover:text-[#FF55D2] transition-colors"
          >
            Explore All Ready-to-Wear →
          </Link>
        </div>

        {categoryProducts.length === 0 ? (
          <div className="py-20 text-center bg-[#FAF9F6] p-8 border border-neutral-200">
            <h2 className="font-serif text-2xl text-[#1A1A1A] mb-2">New Pieces Coming Soon</h2>
            <p className="text-xs text-neutral-500 mb-6">
              Garments for the {category.name} category are currently being curated and handcrafted.
            </p>
            <Link
              href="/shop"
              className="px-6 py-2.5 bg-[#1A1A1A] text-white text-xs uppercase tracking-widest hover:bg-[#FF55D2] transition-colors"
            >
              Browse Available Styles
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {categoryProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
