'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingBag, Menu, X, ChevronDown, Search, Loader2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { NavItem } from '@/lib/types';
import { initialNavigation } from '@/lib/data/initial-data';

interface NavbarProps {
  initialNavigation?: NavItem[];
}

export default function Navbar({ initialNavigation: navProp }: NavbarProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { totalCount } = useCart();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    products: Array<{
      id: string;
      name: string;
      slug: string;
      price: number;
      image: string;
      category_name: string;
    }>;
    categories: Array<{
      id: string;
      name: string;
      slug: string;
    }>;
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [desktopSearchOpen, setDesktopSearchOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const desktopInputRef = useRef<HTMLInputElement>(null);

  const navigation = (navProp || initialNavigation).filter((item) => item.is_visible);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
      if (desktopSearchRef.current && !desktopSearchRef.current.contains(event.target as Node)) {
        setDesktopSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
    setIsSearchFocused(false);
    setDesktopSearchOpen(false);
    setMobileSearchOpen(false);
  }, [pathname]);

  // Debounced search API fetch
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
        }
      } catch (err) {
        console.error('Failed to search', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearchFocused(false);
    setDesktopSearchOpen(false);
    setMobileSearchOpen(false);
    router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const [isScrolled, setIsScrolled] = useState(false);

  // Track scroll position to ensure navbar has solid background when moving across sections
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open to prevent underlying sections from scrolling
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Hide main navbar on admin pages for cleaner CMS dashboard
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const isLinkActive = (href?: string) => {
    if (!href) return false;
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href);
  };

  return (
    <>
      <header
        className={`sticky top-0 z-[60] transition-all duration-300 ${
          isScrolled
            ? 'bg-black/90 backdrop-blur-md border-b border-white/10 shadow-md'
            : 'bg-black/80 backdrop-blur-md border-b border-white/10 shadow-xs'
        }`}
      >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-20">
          {/* Mobile menu trigger */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-1 text-white hover:text-[#FF55D2] active:scale-95 transition-all cursor-pointer rounded-xs"
              aria-label="Open navigation menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Brand Logo - smaller and refined */}
          <div className="flex-1 lg:flex-none text-center lg:text-left">
            <Link href="/" className="inline-flex items-center gap-2 sm:gap-2.5 group">
              <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-300">
                <Image
                  src="/logo-white.png"
                  alt="Fairy Finds Boutique Logo"
                  fill
                  sizes="32px"
                  className="object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-serif text-lg sm:text-xl tracking-[0.18em] font-semibold text-white group-hover:text-[#FF55D2] transition-colors uppercase leading-none">
                  Fairy Finds
                </span>
                <span className="text-[7.5px] sm:text-[8px] tracking-[0.3em] uppercase font-sans mt-0.5 text-white/70 transition-colors">
                  Boutique
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links: Home, Featured (dropdown), About, Contact + Cart Icon */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigation.map((item) => {
              if (item.isDropdown && item.dropdownItems && item.dropdownItems.length > 0) {
                return (
                  <div
                    key={item.id}
                    ref={dropdownRef}
                    className="relative"
                    onMouseEnter={() => setDropdownOpen(true)}
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <button
                      type="button"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="text-xs uppercase tracking-widest py-1 transition-colors flex items-center gap-1.5 font-medium cursor-pointer text-white/90 hover:text-[#FF55D2]"
                      aria-expanded={dropdownOpen}
                    >
                      <span>{item.label}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          dropdownOpen
                            ? 'rotate-180 text-[#FF55D2]'
                            : 'text-white/70'
                        }`}
                      />
                    </button>

                    {/* Dropdown Menu Card */}
                    {dropdownOpen && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-72 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="bg-[#1A1A1A]/95 backdrop-blur-xl border border-white/15 shadow-2xl p-2 rounded-xs">
                          <div className="px-3 py-2 border-b border-white/10 mb-1">
                            <p className="text-[10px] uppercase tracking-[0.25em] text-[#FF55D2] font-semibold">
                              Boutique Collections
                            </p>
                          </div>
                          {item.dropdownItems.map((subItem) => (
                            <Link
                              key={subItem.id}
                              href={subItem.href}
                              onClick={() => setDropdownOpen(false)}
                              className="group block px-3 py-2.5 rounded-xs hover:bg-white/10 transition-colors"
                            >
                              <div className="font-sans text-sm font-medium text-white group-hover:text-[#FF55D2] transition-colors flex items-center justify-between">
                                <span>{subItem.label}</span>
                              </div>
                              {subItem.description && (
                                <p className="text-[11px] text-neutral-400 group-hover:text-neutral-300 font-light mt-0.5 line-clamp-1">
                                  {subItem.description}
                                </p>
                              )}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              const active = isLinkActive(item.href);

              return (
                <Link
                  key={item.id}
                  href={item.href || '/'}
                  className={`text-xs uppercase tracking-widest transition-colors relative py-1 ${
                    active
                      ? 'text-white font-semibold'
                      : 'text-white/90 hover:text-[#FF55D2]'
                  }`}
                >
                  {item.label}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#FF55D2]" />
                  )}
                </Link>
              );
            })}

            {/* Desktop Search */}
            <div className="relative" ref={desktopSearchRef}>
              {desktopSearchOpen ? (
                <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                  <div className="relative flex items-center">
                    <Search className="w-3.5 h-3.5 text-white/50 absolute left-2.5 pointer-events-none" />
                    <input
                      ref={desktopInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search pieces..."
                      className="w-48 xl:w-56 h-8 pl-8 pr-7 bg-white/10 hover:bg-white/15 focus:bg-white/20 text-white placeholder-white/50 text-xs rounded-full border border-white/20 focus:border-[#FF55D2] focus:outline-hidden transition-all"
                      autoFocus
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setSearchResults(null);
                        }}
                        className="absolute right-2 text-white/50 hover:text-white p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Desktop Dropdown */}
                  {searchQuery.trim().length >= 2 && (
                    <div className="absolute top-full right-0 mt-2 w-80 bg-[#1A1A1A]/95 backdrop-blur-xl border border-white/15 shadow-2xl p-2.5 rounded-sm z-50 animate-in fade-in slide-in-from-top-1">
                      {searchResults?.products && searchResults.products.length > 0 ? (
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase tracking-widest text-[#FF55D2] font-semibold px-2 py-1">
                            Garments
                          </p>
                          {searchResults.products.slice(0, 4).map((product) => (
                            <Link
                              key={product.id}
                              href={`/products/${product.slug}`}
                              onClick={() => setDesktopSearchOpen(false)}
                              className="flex items-center gap-2.5 p-1.5 hover:bg-white/10 rounded-xs transition-colors group"
                            >
                              <div className="relative w-9 h-9 bg-neutral-800 rounded-xs overflow-hidden shrink-0">
                                {product.image && (
                                  <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    sizes="36px"
                                    className="object-cover"
                                  />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-white group-hover:text-[#FF55D2] truncate font-medium">
                                  {product.name}
                                </p>
                                <p className="text-[11px] text-white/80">₹{product.price.toLocaleString('en-IN')}</p>
                              </div>
                            </Link>
                          ))}
                          <button
                            type="button"
                            onClick={() => handleSearchSubmit()}
                            className="w-full mt-2 text-[11px] uppercase tracking-wider py-2 bg-[#FF55D2] hover:bg-[#FD00B9] text-white font-semibold rounded-xs transition-colors text-center cursor-pointer"
                          >
                            View All Results
                          </button>
                        </div>
                      ) : isSearching ? (
                        <div className="p-4 text-center text-xs text-neutral-400 flex items-center justify-center gap-2">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF55D2]" />
                          <span>Searching collection...</span>
                        </div>
                      ) : searchResults ? (
                        <div className="p-3 text-center text-xs text-neutral-400">
                          No garments found for &quot;{searchQuery}&quot;
                        </div>
                      ) : null}
                    </div>
                  )}
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setDesktopSearchOpen(true);
                    setTimeout(() => desktopInputRef.current?.focus(), 50);
                  }}
                  className="p-1.5 text-white/90 hover:text-[#FF55D2] transition-colors cursor-pointer flex items-center gap-1.5"
                  aria-label="Open search"
                >
                  <Search className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wider font-medium hidden xl:inline">Search</span>
                </button>
              )}
            </div>

            {/* Inline Cart Icon alongside navbar links */}
            <Link
              href="/cart"
              className="relative p-1.5 active:scale-90 transition-all cursor-pointer rounded-xs flex items-center gap-1.5 ml-2 pl-3 group text-white hover:text-[#FF55D2] border-l border-white/20"
              aria-label={`Shopping Bag with ${totalCount} items`}
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 text-white group-hover:text-[#FF55D2] transition-colors" />
                {totalCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#FF55D2] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-cart-bounce">
                    {totalCount}
                  </span>
                )}
              </div>
              <span className="text-xs uppercase tracking-wider font-semibold transition-colors text-white group-hover:text-[#FF55D2]">
                Bag {totalCount > 0 ? `(${totalCount})` : ''}
              </span>
            </Link>
          </nav>

          {/* Mobile Right Action: Search Trigger + Shopping Bag Link to /cart */}
          <div className="flex items-center gap-1 lg:hidden">
            <button
              type="button"
              onClick={() => {
                const next = !mobileSearchOpen;
                setMobileSearchOpen(next);
                if (next) {
                  setTimeout(() => searchInputRef.current?.focus(), 100);
                } else {
                  setIsSearchFocused(false);
                }
              }}
              className={`p-2 active:scale-90 transition-all cursor-pointer rounded-xs ${
                mobileSearchOpen ? 'text-[#FF55D2]' : 'text-white hover:text-[#FF55D2]'
              }`}
              aria-label={mobileSearchOpen ? 'Close search' : 'Open search'}
            >
              {mobileSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
            </button>

            <Link
              href="/cart"
              className="relative p-2 active:scale-90 transition-all cursor-pointer rounded-xs text-white hover:text-[#FF55D2]"
              aria-label={`Shopping Bag with ${totalCount} items`}
            >
              <ShoppingBag className="w-5 h-5" />
              {totalCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#FF55D2] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm animate-cart-bounce">
                  {totalCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Top Search Bar - Visible when triggered */}
        {mobileSearchOpen && (
          <div className="pb-3 lg:hidden relative animate-in fade-in slide-in-from-top-2 duration-200" ref={searchContainerRef}>
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="relative flex items-center">
              <div className="absolute left-3.5 flex items-center pointer-events-none text-white/50">
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#FF55D2]" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                placeholder="Search dresses, sarees, kurtis..."
                className="w-full h-10 pl-10 pr-9 bg-white/10 hover:bg-white/15 focus:bg-white/20 text-white placeholder-white/50 text-xs tracking-wide rounded-full border border-white/15 focus:border-[#FF55D2] focus:outline-hidden transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults(null);
                  }}
                  className="absolute right-3 p-1 text-white/50 hover:text-white transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </form>

          {/* Mobile Predictive Dropdown */}
          {isSearchFocused && searchQuery.trim().length >= 2 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#1A1A1A]/95 backdrop-blur-xl border border-white/15 shadow-2xl rounded-sm overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Categories */}
              {searchResults?.categories && searchResults.categories.length > 0 && (
                <div className="p-3 border-b border-white/10">
                  <p className="text-[10px] uppercase tracking-widest text-[#FF55D2] font-semibold mb-2">
                    Matching Categories
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {searchResults.categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/shop?category=${cat.slug}`}
                        onClick={() => setIsSearchFocused(false)}
                        className="px-2.5 py-1 bg-white/10 hover:bg-[#FF55D2] text-white text-[11px] rounded-xs transition-colors"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Products */}
              {searchResults?.products && searchResults.products.length > 0 ? (
                <div className="max-h-[60vh] overflow-y-auto divide-y divide-white/5 p-2">
                  <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-semibold px-2 py-1.5">
                    Garments ({searchResults.products.length})
                  </p>
                  {searchResults.products.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      onClick={() => setIsSearchFocused(false)}
                      className="flex items-center gap-3 p-2 hover:bg-white/10 rounded-xs transition-colors group"
                    >
                      <div className="relative w-11 h-11 bg-neutral-800 rounded-xs overflow-hidden shrink-0">
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="44px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-white/40">FF</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white group-hover:text-[#FF55D2] transition-colors truncate">
                          {product.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] font-semibold text-white/90">
                            ₹{product.price.toLocaleString('en-IN')}
                          </span>
                          {product.category_name && (
                            <span className="text-[9px] uppercase tracking-wider text-neutral-400 truncate">
                              • {product.category_name}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}

                  <button
                    type="button"
                    onClick={() => handleSearchSubmit()}
                    className="w-full mt-2 py-2.5 px-3 bg-white/10 hover:bg-[#FF55D2] text-white text-xs uppercase tracking-wider font-semibold rounded-xs transition-colors flex items-center justify-center gap-2 text-center cursor-pointer"
                  >
                    <span>View all results for &quot;{searchQuery}&quot;</span>
                  </button>
                </div>
              ) : isSearching ? (
                <div className="p-6 text-center text-xs text-neutral-400 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#FF55D2]" />
                  <span>Searching boutique collection...</span>
                </div>
              ) : searchResults ? (
                <div className="p-6 text-center">
                  <p className="text-xs text-neutral-300">
                    No garments found for &quot;{searchQuery}&quot;
                  </p>
                  <p className="text-[11px] text-neutral-500 mt-1">
                    Try searching for &quot;saree&quot;, &quot;dress&quot;, or &quot;kurti&quot;
                  </p>
                </div>
              ) : null}
            </div>
          )}
        </div>
        )}
      </div>
      </header>

      {/* Mobile Slide-over Drawer - Rendered as a sibling so it is NOT trapped in header's stacking context */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="fixed inset-y-0 left-0 w-full max-w-[340px] sm:max-w-sm bg-[#1A1A1A]/95 backdrop-blur-xl border-r border-white/10 shadow-2xl p-6 flex flex-col justify-between z-[101] animate-in slide-in-from-left duration-300 text-white">
            <div>
              {/* Mobile Drawer Header */}
              <div className="flex items-center justify-between pb-6 border-b border-white/10">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex items-center gap-2 font-serif text-base tracking-[0.18em] font-semibold text-white uppercase"
                >
                  <div className="relative w-6 h-6 rounded-full overflow-hidden shrink-0">
                    <Image
                      src="/logo-white.png"
                      alt="Fairy Finds Boutique Logo"
                      fill
                      sizes="24px"
                      className="object-contain"
                    />
                  </div>
                  <span>Fairy Finds Boutique</span>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-white/70 hover:text-white transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Links */}
              <div className="py-6 space-y-3">
                {navigation.map((item) => {
                  if (item.isDropdown && item.dropdownItems) {
                    return (
                      <div key={item.id} className="py-1">
                        <button
                          type="button"
                          onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
                          className="w-full flex items-center justify-between py-2 text-base tracking-wider uppercase text-white/90 font-medium"
                        >
                          <span>{item.label}</span>
                          <ChevronDown
                            className={`w-4 h-4 text-white/60 transition-transform ${
                              mobileDropdownOpen ? 'rotate-180 text-[#FF55D2]' : ''
                            }`}
                          />
                        </button>

                        {mobileDropdownOpen && (
                          <div className="pl-3 mt-1 space-y-2 border-l-2 border-[#FF55D2]/50">
                            {item.dropdownItems.map((subItem) => (
                              <Link
                                key={subItem.id}
                                href={subItem.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="block py-1.5 text-xs tracking-wider uppercase text-neutral-300 hover:text-[#FF55D2] transition-colors"
                              >
                                {subItem.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }

                  const active = isLinkActive(item.href);

                  return (
                    <Link
                      key={item.id}
                      href={item.href || '/'}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`min-h-[44px] flex items-center px-3 text-base tracking-wider uppercase rounded-xs transition-colors ${
                        active
                          ? 'text-[#FF55D2] font-semibold bg-white/10'
                          : 'text-white/85 hover:text-[#FF55D2] active:bg-white/5'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}

                {/* Mobile Drawer Shopping Bag Link to /cart */}
                <Link
                  href="/cart"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-between min-h-[44px] px-3 text-base tracking-wider uppercase text-white/90 font-medium hover:text-[#FF55D2] transition-colors rounded-xs border-t border-white/10 pt-3 mt-2"
                >
                  <span className="flex items-center gap-2.5">
                    <ShoppingBag className="w-5 h-5 text-white/80" />
                    <span>Shopping Bag</span>
                  </span>
                  {totalCount > 0 && (
                    <span className="px-2 py-0.5 bg-[#FF55D2] text-white text-[11px] font-bold rounded-full shadow-xs">
                      {totalCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>

            {/* Mobile Footer Info */}
            <div className="pt-6 border-t border-white/10">
              <p className="text-xs text-neutral-400 font-light">
                Fairy Finds Boutique • Ready-to-wear & custom tailoring
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
