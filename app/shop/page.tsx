import React from 'react';
import { Metadata } from 'next';
import { getProducts, getCategories, getCollections, getSettings } from '@/lib/data/store';
import ShopClient from '@/components/shop/ShopClient';
import JsonLd from '@/components/seo/JsonLd';
import { generateBreadcrumbSchema, generateItemListSchema } from '@/lib/seo/schema';
import { SITE_URL, formatMetaTitle } from '@/lib/seo/constants';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    collection?: string;
    q?: string;
  }>;
}

export async function generateMetadata({ searchParams }: ShopPageProps): Promise<Metadata> {
  const params = await searchParams;
  const [categories, collections, settings] = await Promise.all([
    getCategories(),
    getCollections(),
    getSettings(),
  ]);

  const shopSeo = settings.seo_config?.pages?.shop;
  let title = shopSeo?.title || 'Ready-to-Wear Fashion & Designer Outfits';
  let description =
    shopSeo?.description ||
    'Browse ready-to-wear women\'s clothing, sarees, dresses, and designer outfits from Fairy Finds Boutique in Kottayam, Kerala. All-India shipping.';

  if (params.category) {
    const cat = categories.find((c) => c.slug.toLowerCase() === params.category?.toLowerCase());
    if (cat) {
      const lower = cat.slug.toLowerCase();
      if (lower.includes('dress')) {
        title = "Women's Dresses";
        description =
          "Shop ready-to-wear women's dresses from Fairy Finds Boutique in Kottayam, Kerala. Graceful styles and modern fashion with delivery across India.";
      } else if (lower.includes('saree')) {
        title = 'Saree Collection';
        description =
          'Discover pure silk, georgette, and organza sarees handcrafted for celebrations by Fairy Finds Boutique in Kottayam, Kerala.';
      } else if (lower.includes('kurithi') || lower.includes('kurti')) {
        title = 'Kurithi Collection';
        description =
          'Shop elegant ready-to-wear Kurithis and ethnic designer ensembles from Fairy Finds Boutique in Kottayam, Kerala. Fast shipping across India.';
      } else if (lower.includes('blouse') || lower.includes('top')) {
        title = 'Designer Blouses & Tops';
        description =
          'Intricately tailored blouses and structured tops designed to elevate any outfit from Fairy Finds Boutique, Kottayam.';
      } else {
        title = cat.name;
        description =
          cat.description ||
          `Shop the ${cat.name} collection at Fairy Finds Boutique in Kottayam, Kerala. Free delivery above Rs. 2,000 across India.`;
      }
    }
  } else if (params.collection) {
    const col = collections.find((c) => c.slug.toLowerCase() === params.collection?.toLowerCase());
    if (col) {
      title = `${col.name} Edit`;
      description =
        col.description ||
        `Explore the ${col.name} collection at Fairy Finds Boutique in Kottayam, Kerala.`;
    }
  }

  const canonicalUrl = `${SITE_URL}/shop`;
  const pageTitle = formatMetaTitle(title);

  return {
    title: {
      absolute: pageTitle,
    },
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: pageTitle,
      description,
      url: canonicalUrl,
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description,
    },
  };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const [products, categories, collections] = await Promise.all([
    getProducts(),
    getCategories(),
    getCollections(),
  ]);

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Shop', url: '/shop' },
  ];

  if (params.category) {
    const cat = categories.find((c) => c.slug.toLowerCase() === params.category?.toLowerCase());
    if (cat) {
      breadcrumbs.push({ name: cat.name, url: `/category/${cat.slug}` });
    }
  }

  const itemList = generateItemListSchema(
    'Fairy Finds Boutique - Ready-to-Wear Catalog',
    products.filter((p) => p.is_published).map((p) => ({
      name: p.name,
      slug: p.slug,
      image: p.images?.[0],
      price: p.price,
    }))
  );

  return (
    <>
      <JsonLd data={generateBreadcrumbSchema(breadcrumbs)} id="shop-breadcrumbs-jsonld" />
      <JsonLd data={itemList} id="shop-itemlist-jsonld" />
      <ShopClient
        initialProducts={products}
        categories={categories}
        collections={collections}
        initialCategory={params.category}
        initialCollection={params.collection}
        initialSearch={params.q}
      />
    </>
  );
}
