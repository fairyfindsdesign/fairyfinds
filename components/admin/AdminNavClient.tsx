'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { logoutAdmin } from '@/app/actions/auth';
import {
  Package,
  Layers,
  LayoutTemplate,
  Settings,
  Store,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Star,
  ChevronRight,
  ShieldCheck,
  Tag,
  Globe,
  Ruler,
  Sparkles,
} from 'lucide-react';

interface AdminNavClientProps {
  children: React.ReactNode;
}

export default function AdminNavClient({ children }: AdminNavClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Close mobile drawer and clear pending on route change
  useEffect(() => {
    setPendingPath(null);
    setMobileMenuOpen(false);
  }, [pathname]);

  // If on admin login page, bypass the admin navigation layout
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleSignOut = async () => {
    await logoutAdmin();
    window.location.href = '/admin/login';
  };

  const handleNavClick = (href: string, e: React.MouseEvent) => {
    if (href === pathname) return;
    setPendingPath(href);
    setMobileMenuOpen(false);
    startTransition(() => {
      router.push(href);
    });
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: Store },
    { name: 'Products & Stock', href: '/admin/products', icon: Package },
    { name: 'Size Charts', href: '/admin/size-charts', icon: Ruler },
    { name: 'Custom Designs', href: '/admin/custom-designs', icon: Sparkles },
    { name: 'Categories', href: '/admin/categories', icon: Tag },
    { name: 'Collections', href: '/admin/collections', icon: Layers },
    { name: 'Homepage CMS', href: '/admin/homepage', icon: LayoutTemplate },
    { name: 'Navigation Menu', href: '/admin/navigation', icon: Menu },
    { name: 'Customer Reviews', href: '/admin/reviews', icon: Star },
    { name: 'SEO & Discovery', href: '/admin/seo', icon: Globe },
    { name: 'Store Settings', href: '/admin/settings', icon: Settings },
  ];

  const isLinkActive = (href: string) => {
    const target = pendingPath || pathname;
    if (href === '/admin') {
      return target === '/admin';
    }
    return target?.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#1A1A1A] text-white px-3.5 sm:px-6 py-3 flex items-center justify-between border-b border-neutral-800 shadow-xs">
        {/* Left: Brand & CMS Badge */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Mobile Menu Trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 -ml-1.5 flex items-center justify-center text-neutral-300 hover:text-white active:scale-90 transition-transform md:hidden rounded-xs"
            aria-label="Toggle admin navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="relative w-6 h-6 sm:w-7 sm:h-7 rounded-full overflow-hidden shrink-0 border border-neutral-700">
              <Image
                src="/logo-white.png"
                alt="Fairy Finds"
                fill
                sizes="28px"
                className="object-contain"
              />
            </div>
            <span className="font-serif text-lg sm:text-xl tracking-[0.18em] font-semibold uppercase text-white truncate">
              Fairy Finds
            </span>
            <span className="text-[9px] sm:text-[10px] uppercase tracking-widest bg-[#FF55D2] text-white px-2 py-0.5 font-bold rounded-xs">
              CMS
            </span>
          </Link>
        </div>

        {/* Right: Live Storefront & Exit */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Link
            href="/"
            target="_blank"
            className="text-[11px] sm:text-xs uppercase tracking-wider text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors bg-neutral-800/90 hover:bg-neutral-800 px-3 py-2 rounded-xs active:scale-95"
          >
            <span className="hidden xs:inline sm:inline">Live Store</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="w-9 h-9 flex items-center justify-center text-neutral-400 hover:text-red-400 transition-colors rounded-xs active:scale-90 cursor-pointer"
            title="Sign Out of Admin"
            aria-label="Sign Out of Admin"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Top Transition Progress Bar for Instant Click Feedback */}
      {isPending && (
        <div className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FF55D2] via-[#FD00B9] to-[#FF55D2] z-[100] animate-pulse" />
      )}

      {/* Mobile Horizontal Quick-Scroll Navigation Strip */}
      <div className="md:hidden bg-[#242424] border-b border-neutral-800 px-3 py-2 overflow-x-auto scrollbar-none flex items-center gap-2 shrink-0 z-30">
        {navigation.map((item) => {
          const active = isLinkActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              prefetch={true}
              onClick={(e) => handleNavClick(item.href, e)}
              className={`min-h-[36px] px-3.5 py-1.5 text-[11px] uppercase tracking-wider font-semibold whitespace-nowrap rounded-xs flex items-center gap-1.5 transition-all active:scale-95 ${
                active
                  ? 'bg-[#FF55D2] text-white shadow-xs font-bold'
                  : 'bg-neutral-800 text-neutral-300 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.name.replace('Store ', '').replace(' & Stock', '')}</span>
            </Link>
          );
        })}
      </div>

      {/* Mobile Slide-Over Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="fixed inset-y-0 left-0 max-w-[280px] w-full bg-white shadow-2xl p-5 flex flex-col justify-between z-10 animate-in slide-in-from-left duration-300">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                <div className="flex items-center gap-2">
                  <span className="font-serif text-lg tracking-wider font-semibold text-[#1A1A1A]">
                    ADMIN PORTAL
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-neutral-400 hover:text-black rounded-xs active:scale-90"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] uppercase tracking-widest text-neutral-400 font-semibold px-2 py-1">
                  Management Sections
                </div>
                {navigation.map((item) => {
                  const active = isLinkActive(item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      prefetch={true}
                      onClick={(e) => handleNavClick(item.href, e)}
                      className={`min-h-[44px] flex items-center justify-between px-3 py-2 text-xs uppercase tracking-wider font-medium rounded-xs transition-colors ${
                        active
                          ? 'bg-[#FF55D2] text-white font-semibold shadow-xs'
                          : 'text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-neutral-500'}`} />
                        <span>{item.name}</span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 ${active ? 'text-white' : 'text-neutral-300'}`} />
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-200 space-y-2">
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xs text-[11px] text-neutral-500 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#FF55D2] shrink-0 mt-0.5" />
                <p>Design layout & styling tokens are developer-locked to safeguard brand integrity.</p>
              </div>
              <Link
                href="/"
                target="_blank"
                className="w-full py-2.5 px-3 bg-[#1A1A1A] hover:bg-[#FF55D2] text-white text-xs uppercase tracking-wider font-semibold rounded-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>View Live Store</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full py-2.5 px-3 bg-red-50 hover:bg-red-100 text-red-600 text-xs uppercase tracking-wider font-semibold rounded-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out of Admin</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Subnav / Sidebar & Main Content */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Desktop Sidebar Nav (Hidden on Mobile) */}
        <aside className="hidden md:block w-64 bg-white border-r border-neutral-200 p-4 space-y-1 shrink-0">
          <div className="text-[10px] uppercase tracking-widest text-neutral-400 font-semibold px-3 py-2">
            Management
          </div>
          {navigation.map((item) => {
            const active = isLinkActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                prefetch={true}
                onClick={(e) => handleNavClick(item.href, e)}
                className={`flex items-center gap-3 px-3 py-2.5 text-xs uppercase tracking-wider font-medium rounded-xs transition-colors ${
                  active
                    ? 'bg-neutral-100 text-[#FF55D2] font-semibold border-l-2 border-[#FF55D2]'
                    : 'text-neutral-700 hover:text-[#FF55D2] hover:bg-neutral-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-[#FF55D2]' : 'text-neutral-500'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}

          <div className="pt-8 px-3">
            <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-xs text-[11px] text-neutral-500 space-y-1">
              <strong className="text-neutral-800 block uppercase tracking-wider">CMS Security</strong>
              <p>Design layout & styling tokens are developer-locked to maintain brand integrity.</p>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-3.5 sm:p-6 md:p-8 lg:p-10 max-w-7xl w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
