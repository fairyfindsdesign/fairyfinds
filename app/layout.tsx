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
import ScrollReset from '@/components/ui/ScrollReset';
import DynamicFavicon from '@/components/ui/DynamicFavicon';
import GSAPProvider from '@/components/animation/GSAPProvider';
import JsonLd from '@/components/seo/JsonLd';
import { getNavigation, getSettings, getCollections } from '@/lib/data/store';
import { SITE_URL, DEFAULT_SEO, BUSINESS_INFO } from '@/lib/seo/constants';
import { generateBoutiqueSchema, generateWebSiteSchema } from '@/lib/seo/schema';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: '%s | Fairy Finds Boutique',
    default: DEFAULT_SEO.title,
  },
  description: DEFAULT_SEO.description,
  keywords: DEFAULT_SEO.keywords,
  authors: [{ name: BUSINESS_INFO.name, url: SITE_URL }],
  creator: BUSINESS_INFO.name,
  publisher: BUSINESS_INFO.name,
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
    url: SITE_URL,
    siteName: BUSINESS_INFO.name,
    title: DEFAULT_SEO.title,
    description: DEFAULT_SEO.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_SEO.title,
    description: DEFAULT_SEO.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
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
    apple: [
      { url: '/logo.png' },
    ],
  },
};

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

  return (
    <html lang="en" className={`${cormorant.variable} ${manrope.variable} h-full antialiased`}>
      <head>
        <JsonLd data={generateBoutiqueSchema(settings)} id="boutique-jsonld" />
        <JsonLd data={generateWebSiteSchema()} id="website-jsonld" />
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
          <Footer settings={settings} collections={collections} />
        </CartProvider>
      </body>
    </html>
  );
}
