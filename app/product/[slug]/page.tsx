import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { Metadata } from 'next';
import { getProductBySlug, getProducts, getSettings, getCategories, getSizeChartById } from '@/lib/data/store';
import ProductDetailClient from '@/components/product/ProductDetailClient';
import JsonLd from '@/components/seo/JsonLd';
import { generateProductSchema, generateBreadcrumbSchema } from '@/lib/seo/schema';
import { SITE_URL, BUSINESS_INFO } from '@/lib/seo/constants';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [product, settings] = await Promise.all([
    getProductBySlug(slug),
    getSettings().catch(() => null),
  ]);

  if (!product) {
    return {
      title: 'Product Not Found',
      robots: { index: false, follow: false },
    };
  }

  const canonicalBase = settings?.seo_config?.global?.canonical_base || SITE_URL;
  const title = product.name;

  // Construct a rich, unique meta description using actual garment details
  const detailsParts: string[] = [];
  if (product.category_name) detailsParts.push(product.category_name);
  if (product.fabric) detailsParts.push(product.fabric);
  const detailsText = detailsParts.length > 0 ? ` (${detailsParts.join(', ')})` : '';

  const cleanDescription = product.description
    ? product.description.replace(/(\r\n|\n|\r)/gm, ' ').trim()
    : `Shop ${product.name} at Fairy Finds Boutique in Kottayam, Kerala.`;

  const metaDescription = `${product.name}${detailsText}: ${cleanDescription.slice(0, 140)}... Available with personal WhatsApp ordering and all-India shipping from Fairy Finds Boutique.`;

  const canonicalUrl = `${canonicalBase}/product/${product.slug}`;

  const primaryImage = product.images?.[0]
    ? product.images[0].startsWith('http')
      ? product.images[0]
      : `${canonicalBase}${product.images[0].startsWith('/') ? product.images[0] : `/${product.images[0]}`}`
    : `${canonicalBase}/logo.png`;

  const totalStock = product.variants?.reduce((sum, v) => sum + (v.stock_quantity || 0), 0) ?? 0;
  const inStock = totalStock > 0;

  const ogTitle = `${product.name} | Fairy Finds Boutique`;

  return {
    title,
    description: metaDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: ogTitle,
      description: metaDescription,
      url: canonicalUrl,
      siteName: BUSINESS_INFO.name,
      type: 'website',
      images: [
        {
          url: primaryImage,
          width: 800,
          height: 1067,
          alt: `${product.name} - Fairy Finds Boutique`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: metaDescription,
      images: [primaryImage],
    },
    robots: {
      index: product.is_published,
      follow: true,
      googleBot: {
        index: product.is_published,
        follow: true,
        'max-image-preview': 'large',
      },
    },
    other: {
      'product:price:amount': product.price.toString(),
      'product:price:currency': 'INR',
      'product:availability': inStock ? 'in stock' : 'out of stock',
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const [product, allProducts, settings, categories] = await Promise.all([
    getProductBySlug(slug),
    getProducts(),
    getSettings(),
    getCategories(),
  ]);

  if (!product) {
    notFound();
  }

  // Safe SEO URL preservation: If accessed by raw ID and slug exists, permanently redirect to canonical slug
  if (slug === product.id && product.slug && product.slug !== product.id) {
    redirect(`/product/${product.slug}`);
  }

  // Related products from same category or collection
  const relatedProducts = allProducts.filter(
    (p) =>
      p.id !== product.id &&
      p.is_published &&
      (p.category_id === product.category_id || p.collection_id === product.collection_id)
  );

  // Match category slug for breadcrumb
  const category = categories.find(
    (c) => c.id === product.category_id || c.name.toLowerCase() === product.category_name?.toLowerCase()
  );

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Shop', url: '/shop' },
  ];

  if (category) {
    breadcrumbs.push({ name: category.name, url: `/category/${category.slug}` });
  } else if (product.category_name) {
    breadcrumbs.push({ name: product.category_name, url: '/shop' });
  }

  breadcrumbs.push({ name: product.name, url: `/product/${product.slug}` });

  const productSchema = generateProductSchema(product, settings);
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);
  const presetSizeChart = await getSizeChartById(product.size_chart_id || '');

  // If no global preset, use the product's own inline custom chart
  const sizeChart = presetSizeChart ?? (
    product.custom_size_chart && product.custom_size_chart.columns?.length > 0
      ? {
          id: `custom-${product.id}`,
          name: 'Custom Size Chart',
          unit: (product.custom_size_chart.unit || 'Inches') as 'Inches' | 'cm',
          columns: product.custom_size_chart.columns,
          rows: product.custom_size_chart.rows as any,
          notes: product.custom_size_chart.notes,
        }
      : null
  );

  return (
    <>
      <JsonLd data={productSchema} id="product-jsonld" />
      <JsonLd data={breadcrumbSchema} id="product-breadcrumb-jsonld" />
      <ProductDetailClient
        product={product}
        relatedProducts={relatedProducts}
        settings={settings}
        sizeChart={sizeChart}
      />
    </>
  );
}
