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

export const metadata: Metadata = {
  title: {
    template: '%s | Fairy Finds Boutique',
    default: 'Fairy Finds Boutique | Ready-to-Wear & Custom Haute Couture',
  },
  description:
    'A modern, feminine fashion boutique offering curated ready-to-wear clothing alongside bespoke custom-made garments with seamless WhatsApp ordering.',
  keywords: [
    'Fairy Finds Boutique',
    'Sarees',
    'Lehengas',
    'Custom Dresses',
    'Blouses',
    'Sri Lanka Fashion',
    'Bespoke Couture',
  ],
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

import BackToTop from '@/components/ui/BackToTop';
import ScrollReset from '@/components/ui/ScrollReset';
import DynamicFavicon from '@/components/ui/DynamicFavicon';
import GSAPProvider from '@/components/animation/GSAPProvider';
import { getNavigation, getSettings, getCollections } from '@/lib/data/store';

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
