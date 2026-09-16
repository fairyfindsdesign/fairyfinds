import type { MetadataRoute } from 'next';
import { getProducts, getCategories, getCollections, getSettings } from '@/lib/data/store';
import { SITE_URL } from '@/lib/seo/constants';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, collections, settings] = await Promise.all([
    getProducts().catch(() => []),
    getCategories().catch(() => []),
    getCollections().catch(() => []),
    getSettings().catch(() => null),
  ]);

  const baseUrl = settings?.seo_config?.global?.canonical_base || SITE_URL;
  const now = new Date();

  // 1. Static Core Public Pages (Home, Shop, and Custom are highest priority)
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/custom`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ];

  // 2. Category Pages (Clean URLs without query parameters)
  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${baseUrl}/category/${cat.slug}`,
    lastModified: cat.created_at ? new Date(cat.created_at) : now,
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  // 3. Collection Pages
  const collectionPages: MetadataRoute.Sitemap = collections
    .filter((col) => col.is_published && col.has_dedicated_page)
    .map((col) => ({
      url: `${baseUrl}/collections/${col.slug}`,
      lastModified: col.created_at ? new Date(col.created_at) : now,
      changeFrequency: 'weekly',
      priority: 0.85,
    }));

  // 4. Product Pages (Active, published items)
  const productPages: MetadataRoute.Sitemap = products
    .filter((prod) => prod.is_published && prod.slug)
    .map((prod) => {
      let lastMod = now;
      if (prod.updated_at) {
        lastMod = new Date(prod.updated_at);
      } else if (prod.created_at) {
        lastMod = new Date(prod.created_at);
      }

      return {
        url: `${baseUrl}/product/${prod.slug}`,
        lastModified: lastMod,
        changeFrequency: 'weekly',
        priority: 0.8,
      };
    });

  return [
    ...staticPages,
    ...categoryPages,
    ...collectionPages,
    ...productPages,
  ];
}
