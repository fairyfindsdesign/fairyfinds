'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { MessageCircle, Heart } from 'lucide-react';
import { InstagramIcon } from '@/components/ui/Icons';

import { StoreSettings, Collection } from '@/lib/types';

interface FooterProps {
  settings?: StoreSettings;
  collections?: Collection[];
}

export default function Footer({ settings, collections }: FooterProps) {
  const pathname = usePathname();

  // Hide footer on admin pages
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const instagramUrl = settings?.instagram_url || 'https://instagram.com';
  const cleanNumber = (settings?.whatsapp_number || '+94771234567').replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=Hello%20Fairy%20Finds%20Boutique`;

  const publishedCollections = collections?.filter((c) => c.is_published) || [];
  const displayCollections = publishedCollections.length > 0
    ? publishedCollections.slice(0, 4)
    : [
        { id: 'c1', name: 'Red Saree Collection', slug: 'red-saree' },
        { id: 'c2', name: 'Green Lehenga Edit', slug: 'green-lehenga' },
      ];

  return (
    <footer className="bg-[#1A1A1A] text-white pt-16 pb-12 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-14 border-b border-neutral-800">
          {/* Brand Column */}
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden shrink-0 border border-neutral-700/80 group-hover:border-[#FF55D2] transition-colors">
                <Image
                  src="/logo-white.png"
                  alt="Fairy Finds Logo"
                  fill
                  sizes="40px"
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-serif text-xl sm:text-2xl tracking-[0.2em] font-semibold text-white group-hover:text-[#FF55D2] transition-colors uppercase leading-tight">
                  {settings?.store_name?.trim() || 'Fairy Finds'}
                </span>
                <span className="block text-[9px] tracking-[0.35em] text-neutral-400 uppercase font-sans">
                  Boutique Atelier
                </span>
              </div>
            </Link>
            <p className="text-neutral-400 text-xs leading-relaxed max-w-sm">
              A modern, feminine fashion boutique offering curated ready-to-wear silhouettes alongside bespoke made-to-measure couture.
            </p>
            {settings?.address && (
              <p className="text-neutral-500 text-[11px] leading-relaxed max-w-sm pt-1">
                📍 {settings.address}
              </p>
            )}
            <div className="flex items-center space-x-4 pt-2">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-neutral-700 flex items-center justify-center text-neutral-400 hover:text-[#FF55D2] hover:border-[#FF55D2] transition-colors"
                aria-label="Follow us on Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-neutral-700 flex items-center justify-center text-neutral-400 hover:text-[#FF55D2] hover:border-[#FF55D2] transition-colors"
                aria-label="Chat with stylist on WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Shop Links */}
          <div className="space-y-3">
            <h3 className="font-sans text-xs uppercase tracking-widest text-neutral-200 font-semibold">
              Collections & Shop
            </h3>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>
                <Link href="/shop" className="hover:text-[#FF55D2] transition-colors">
                  All Ready-to-Wear
                </Link>
              </li>
              {displayCollections.map((col) => (
                <li key={col.id}>
                  <Link href={`/collections/${col.slug}`} className="hover:text-[#FF55D2] transition-colors">
                    {col.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/shop?category=dresses" className="hover:text-[#FF55D2] transition-colors">
                  Modern Dresses
                </Link>
              </li>
              <li>
                <Link href="/shop?category=blouses" className="hover:text-[#FF55D2] transition-colors">
                  Artisanal Blouses
                </Link>
              </li>
            </ul>
          </div>

          {/* Custom & Client Care */}
          <div className="space-y-3">
            <h3 className="font-sans text-xs uppercase tracking-widest text-neutral-200 font-semibold">
              Client Care & Bespoke
            </h3>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>
                <Link href="/custom" className="text-[#FF55D2] hover:underline transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF55D2]" />
                  Custom Made Orders
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#FF55D2] transition-colors">
                  Our Story & Atelier
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#FF55D2] transition-colors">
                  Contact & Location
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-[#FF55D2] transition-colors">
                  View Bag & WhatsApp Order
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-[#FF55D2] transition-colors">
                  Store Management
                </Link>
              </li>
            </ul>
          </div>

          {/* WhatsApp Process Note */}
          <div className="space-y-3 bg-neutral-900/60 p-5 rounded-sm border border-neutral-800">
            <h3 className="font-sans text-xs uppercase tracking-widest text-neutral-200 font-semibold flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-[#FF55D2]" />
              Frictionless Ordering
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              We provide personal, boutique-level care. Once you submit your order, your details open directly in WhatsApp with our stylist to confirm sizing, tailoring, and delivery.
            </p>
            {settings?.whatsapp_number && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FF55D2] hover:underline pt-1"
              >
                <span>Direct Hotline: {settings.whatsapp_number}</span>
              </a>
            )}
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} Fairy Finds Boutique. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 flex items-center gap-1">
            Crafted with <Heart className="w-3 h-3 text-[#FF55D2] fill-[#FF55D2]" /> for fashion connoisseurs
          </p>
        </div>
      </div>
    </footer>
  );
}
