'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/types';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Calculate stock status across variants
  const totalStock = product.variants?.reduce((sum, v) => sum + v.stock_quantity, 0) ?? 0;
  const isOutOfStock = totalStock === 0;
  const isLowStock = !isOutOfStock && totalStock <= 3;

  const primaryImage = product.images[0] || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800';
  const secondaryImage = product.images[1] || primaryImage;

  return (
    <div
      className="group relative flex flex-col bg-white rounded-xs p-1.5 sm:p-0 hover:-translate-y-1 hover:shadow-md active:scale-[0.99] transition-all duration-300 gsap-fade-up"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image container */}
      <Link
        href={`/product/${product.slug}`}
        className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100 block rounded-xs"
      >
        {/* Primary Image */}
        <Image
          src={primaryImage}
          alt={`${product.name} - Fairy Finds Boutique`}
          fill
          priority={priority}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
          className={`object-cover object-center transition-all duration-700 ease-out group-hover:scale-105 ${
            isHovered && secondaryImage !== primaryImage ? 'opacity-0' : 'opacity-100'
          }`}
        />

        {/* Secondary Image crossfade on hover */}
        {secondaryImage !== primaryImage && (
          <Image
            src={secondaryImage}
            alt={`${product.name} alternate view - Fairy Finds Boutique`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
            className={`object-cover object-center absolute inset-0 transition-all duration-700 ease-out group-hover:scale-105 ${
              isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          />
        )}

        {/* Stock / Type Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {isOutOfStock ? (
            <span className="bg-[#1A1A1A] text-white text-[10px] uppercase tracking-widest font-semibold px-2.5 py-1">
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="bg-[#FF55D2] text-white text-[10px] uppercase tracking-widest font-semibold px-2.5 py-1">
              Limited Stock
            </span>
          ) : null}

          {product.collection_name && (
            <span className="bg-white/90 backdrop-blur-xs text-[#1A1A1A] text-[9px] uppercase tracking-widest font-medium px-2 py-0.5 border border-neutral-200">
              {product.collection_name}
            </span>
          )}
        </div>

        {/* Hover Quick Action Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="text-white text-xs uppercase tracking-widest font-medium border-b border-[#FF55D2] pb-0.5">
            View Product Details
          </span>
        </div>
      </Link>

      {/* Product Details */}
      <div className="pt-4 flex flex-col flex-1">
        {/* Category tag */}
        {product.category_name && (
          <span className="text-[10px] uppercase tracking-widest text-neutral-400 mb-1">
            {product.category_name}
          </span>
        )}

        {/* Title */}
        <h3 className="font-serif text-base text-[#1A1A1A] group-hover:text-[#FF55D2] transition-colors leading-snug">
          <Link href={`/product/${product.slug}`}>
            {product.name}
          </Link>
        </h3>

        {/* Sizes summary */}
        {product.variants && product.variants.length > 0 && (
          <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-neutral-500">
            <span className="text-neutral-400">Sizes:</span>
            {product.variants.map((v) => (
              <span
                key={v.id}
                className={`px-1 py-0.5 text-[10px] border ${
                  v.stock_quantity === 0
                    ? 'border-neutral-200 text-neutral-300 line-through'
                    : 'border-neutral-200 text-neutral-600'
                }`}
              >
                {v.size}
              </span>
            ))}
          </div>
        )}

        {/* Price */}
        <div className="mt-2 text-sm font-semibold text-[#1A1A1A]">
          Rs. {product.price.toLocaleString()}
        </div>
      </div>
    </div>
  );
}
