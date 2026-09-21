import type { Metadata } from 'next';
import { Cormorant_Garamond, Manrope } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

import BackToTop from '@/components/ui/BackToTop';
import WhatsAppFloatingButton from '@/components/layout/WhatsAppFloatingButton';
import ScrollReset from '@/components/ui/ScrollReset';
import DynamicFavicon from '@/components/ui/DynamicFavicon';
import GSAPProvider from '@/components/animation/GSAPProvider';
import JsonLd from '@/components/seo/JsonLd';
import { getNavigation, getSettings, getCollections } from '@/lib/data/store';
import { SITE_URL, DEFAULT_SEO, BUSINESS_INFO } from '@/lib/seo/constants';
import { generateBoutiqueSchema, generateWebSiteSchema, generateSiteNavigationSchema } from '@/lib/seo/schema';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const seo = settings.seo_config;

  const siteTitle = seo?.global?.site_title || DEFAULT_SEO.title;
  const titleTemplate = seo?.global?.title_template || '%s | Fairy Finds Boutique';
  const metaDescription = seo?.global?.meta_description || DEFAULT_SEO.description;
  const keywords = seo?.global?.keywords && seo.global.keywords.length > 0 ? seo.global.keywords : DEFAULT_SEO.keywords;
  const canonicalBase = seo?.global?.canonical_base || SITE_URL;
  const isIndexed = seo?.crawl?.is_indexed ?? true;
  const googleVerification = seo?.verification?.google_site_verification || process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '';
  const bingVerification = seo?.verification?.bing_verification || process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION || '';

  const ogTitle = seo?.social?.og_title || siteTitle;
  const ogDescription = seo?.social?.og_description || metaDescription;
  const ogImage = seo?.social?.og_image
    ? (seo.social.og_image.startsWith('http') ? seo.social.og_image : `${canonicalBase}${seo.social.og_image.startsWith('/') ? '' : '/'}${seo.social.og_image}`)
    : `${canonicalBase}/og-image.jpg`;

  return {
    metadataBase: new URL(canonicalBase),
    title: {
      template: titleTemplate,
      default: siteTitle,
    },
    description: metaDescription,
    keywords: keywords,
    authors: [{ name: seo?.local_business?.name || BUSINESS_INFO.name, url: canonicalBase }],
    creator: seo?.local_business?.name || BUSINESS_INFO.name,
    publisher: seo?.local_business?.name || BUSINESS_INFO.name,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    alternates: {
      canonical: '/',
    },
    openGraph: {
      type: 'website',
      locale: 'en_IN',
      url: canonicalBase,
      siteName: seo?.local_business?.name || BUSINESS_INFO.name,
      title: ogTitle,
      description: ogDescription,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: siteTitle,
        },
      ],
    },
    twitter: {
      card: (seo?.social?.twitter_card as any) || 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
      images: [ogImage],
    },
    robots: {
      index: isIndexed,
      follow: isIndexed,
      googleBot: {
        index: isIndexed,
        follow: isIndexed,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: googleVerification,
      other: {
        ...(bingVerification ? { 'msvalidate.01': bingVerification } : {}),
      },
    },
    category: 'clothing',
    icons: {
      icon: [
        {
          url: '/favicon-light.png',
          media: '(prefers-color-scheme: light)',
          type: 'image/png',
        },
        {
          url: '/favicon-dark.png',
          media: '(prefers-color-scheme: dark)',
          type: 'image/png',
        },
      ],
      apple: [{ url: '/logo.png' }],
    },
  };
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [navigation, settings, collections] = await Promise.all([
    getNavigation(),
    getSettings(),
    getCollections(),
  ]);

  const gaId = settings?.seo_config?.verification?.google_analytics_id;

  return (
    <html lang="en" className={`${cormorant.variable} ${manrope.variable} h-full antialiased`}>
      <head>
        <JsonLd data={generateBoutiqueSchema(settings)} id="boutique-jsonld" />
        <JsonLd data={generateWebSiteSchema(settings)} id="website-jsonld" />
        <JsonLd data={generateSiteNavigationSchema(settings?.seo_config?.global?.canonical_base || SITE_URL)} id="navigation-jsonld" />
        {gaId && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
            <script
              id="ga4-init"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaId}');
                `,
              }}
            />
          </>
        )}
      </head>
      <body className="min-h-full flex flex-col bg-[#FFFFFF] text-[#1A1A1A] font-sans selection:bg-[#FF55D2] selection:text-white">
        <DynamicFavicon />
        <CartProvider>
          <ScrollReset />
          <AnnouncementBar message={settings.announcement_bar} />
          <Navbar initialNavigation={navigation} />
          <GSAPProvider>
            <main className="flex-1 pb-20 lg:pb-0">{children}</main>
          </GSAPProvider>
          <BackToTop />
          <WhatsAppFloatingButton settings={settings} />
          <Footer settings={settings} collections={collections} />
        </CartProvider>
      </body>
    </html>
  );
}
