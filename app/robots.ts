import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo/constants';
import { getSettings } from '@/lib/data/store';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getSettings().catch(() => null);
  const isIndexed = settings?.seo_config?.crawl?.is_indexed ?? true;
  const canonicalBase = settings?.seo_config?.global?.canonical_base || SITE_URL;

  if (!isIndexed) {
    return {
      rules: [
        {
          userAgent: '*',
          disallow: '/',
        },
      ],
      sitemap: `${canonicalBase}/sitemap.xml`,
    };
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/',
          '/api/',
          '/cart',
        ],
      },
    ],
    sitemap: `${canonicalBase}/sitemap.xml`,
  };
}
