'use client';

import React, { useState, useMemo } from 'react';
import { Product, Category, Collection } from '@/lib/types';
import ProductCard from '@/components/ui/ProductCard';
import { Filter, SlidersHorizontal, RotateCcw } from 'lucide-react';

interface ShopClientProps {
  initialProducts: Product[];
  categories: Category[];
  collections: Collection[];
  initialCategory?: string;
  initialCollection?: string;
}

export default function ShopClient({
  initialProducts,
  categories,
  collections,
  initialCategory,
  initialCollection,
}: ShopClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [selectedCollection, setSelectedCollection] = useState<string>(initialCollection || 'all');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'newest'>('featured');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Available sizes extracted from products
  const availableSizes = useMemo(() => {
    const sizeSet = new Set<string>();
    initialProducts.forEach((p) => {
      p.variants?.forEach((v) => sizeSet.add(v.size));
    });
    return Array.from(sizeSet);
  }, [initialProducts]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return initialProducts
      .filter((p) => {
        // Category filter
        if (selectedCategory !== 'all') {
          const cat = categories.find((c) => c.slug === selectedCategory);
          if (cat && p.category_id !== cat.id) return false;
        }

        // Collection filter
        if (selectedCollection !== 'all') {
          const col = collections.find((c) => c.slug === selectedCollection);
          if (col && p.collection_id !== col.id) return false;
        }

        // Size filter
        if (selectedSize !== 'all') {
          const hasSize = p.variants?.some(
            (v) => v.size === selectedSize && v.stock_quantity > 0
          );
          if (!hasSize) return false;
        }

        // In stock only filter
        if (inStockOnly) {
          const totalStock = p.variants?.reduce((sum, v) => sum + v.stock_quantity, 0) ?? 0;
          if (totalStock === 0) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'newest') return (b.created_at || '').localeCompare(a.created_at || '');
        return a.is_featured ? -1 : 1;
      });
  }, [
    initialProducts,
    selectedCategory,
    selectedCollection,
    selectedSize,
    inStockOnly,
    sortBy,
    categories,
    collections,
  ]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedCollection('all');
    setSelectedSize('all');
    setInStockOnly(false);
    setSortBy('featured');
  };

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    selectedCollection !== 'all' ||
    selectedSize !== 'all' ||
    inStockOnly;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      {/* Header Banner */}
      <div className="border-b border-neutral-200 pb-8 mb-10">
        <p className="text-xs uppercase tracking-[0.25em] text-[#FF55D2] font-semibold mb-2">
          READY-TO-WEAR ATELIER
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl text-[#1A1A1A] font-light">
          The Ready-Made Collection
        </h1>
        <p className="text-sm text-neutral-500 mt-2 font-light max-w-2xl">
          Carefully designed garments available in standard sizes. Select your size, review your bag, and complete your order seamlessly through WhatsApp.
        </p>
      </div>

      {/* Filter Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-8 border-b border-neutral-100">
        {/* Category Pills (Desktop) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 text-xs uppercase tracking-wider whitespace-nowrap transition-colors rounded-xs ${
              selectedCategory === 'all'
                ? 'bg-[#1A1A1A] text-white font-medium'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            All Pieces ({initialProducts.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-4 py-2 text-xs uppercase tracking-wider whitespace-nowrap transition-colors rounded-xs ${
                selectedCategory === cat.slug
                  ? 'bg-[#1A1A1A] text-white font-medium'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Sort & Mobile Filter Trigger */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs text-neutral-500 hover:text-[#FF55D2] flex items-center gap-1 uppercase tracking-wider mr-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-neutral-400 hidden sm:inline">
              Sort By:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs uppercase tracking-wider bg-white border border-neutral-200 px-3 py-2 rounded-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF55D2]"
            >
              <option value="featured">Featured First</option>
              <option value="newest">Newest Additions</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sub-Filters: Collection, Size, Stock Toggle */}
      <div className="flex flex-wrap items-center gap-4 mb-8 text-xs">
        {/* Collection Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-neutral-500 uppercase tracking-wider text-[11px]">Collection:</span>
          <select
            value={selectedCollection}
            onChange={(e) => setSelectedCollection(e.target.value)}
            className="border border-neutral-200 bg-white px-2.5 py-1.5 rounded-xs text-neutral-800"
          >
            <option value="all">All Collections</option>
            {collections.map((col) => (
              <option key={col.id} value={col.slug}>
                {col.name}
              </option>
            ))}
          </select>
        </div>

        {/* Size Filter */}
        <div className="flex items-center gap-2">
          <span className="text-neutral-500 uppercase tracking-wider text-[11px]">Size:</span>
          <select
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
            className="border border-neutral-200 bg-white px-2.5 py-1.5 rounded-xs text-neutral-800"
          >
            <option value="all">All Sizes</option>
            {availableSizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        {/* In Stock Only Checkbox */}
        <label className="flex items-center gap-2 cursor-pointer select-none text-neutral-700 ml-auto">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="rounded-xs border-neutral-300 text-[#FF55D2] focus:ring-[#FF55D2]"
          />
          <span className="uppercase tracking-wider text-[11px]">In Stock Only</span>
        </label>
      </div>

      {/* Products Grid - 2 columns on mobile */}
      {filteredProducts.length === 0 ? (
        <div className="py-20 text-center bg-neutral-50 border border-neutral-200 p-8">
          <h3 className="font-serif text-2xl text-[#1A1A1A] mb-2">No garments found</h3>
          <p className="text-xs text-neutral-500 mb-6 max-w-md mx-auto">
            No ready-to-wear items match your selected filter criteria. Try resetting filters to explore all available designs.
          </p>
          <button
            onClick={resetFilters}
            className="px-6 py-2.5 bg-[#1A1A1A] text-white text-xs uppercase tracking-widest hover:bg-[#FF55D2] active:scale-95 transition-all"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
