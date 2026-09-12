'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CartDrawer() {
  const {
    items,
    removeItem,
    updateQuantity,
    totalCount,
    subtotal,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
  } = useCart();

  if (!isCartDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="cart-title" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
        onClick={() => setIsCartDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-full sm:w-screen sm:max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="px-6 py-5 border-b border-neutral-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-[#FF55D2]" />
              <h2 id="cart-title" className="font-serif text-lg font-semibold tracking-wider text-[#1A1A1A] uppercase">
                Your Shopping Bag ({totalCount})
              </h2>
            </div>
            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-2 text-neutral-400 hover:text-black active:scale-90 rounded-full hover:bg-neutral-100 transition-all"
              aria-label="Close bag"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-neutral-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <ShoppingBag className="w-12 h-12 text-neutral-300 mb-4 stroke-1" />
                <p className="font-sans text-base font-medium text-neutral-800 mb-1">Your bag is currently empty</p>
                <p className="text-xs text-neutral-400 mb-6 max-w-xs font-sans">
                  Explore our curated ready-to-wear pieces and find something exquisite.
                </p>
                <Link
                  href="/shop"
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="px-6 py-2.5 bg-[#1A1A1A] text-white text-xs uppercase tracking-widest font-medium hover:bg-[#FF55D2] transition-colors"
                >
                  Explore Collection
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="py-4 flex gap-4">
                  {/* Thumbnail */}
                  <div className="w-20 h-24 relative bg-neutral-50 overflow-hidden flex-shrink-0 border border-neutral-200">
                    <Image
                      src={item.product.images[0] || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=300'}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <Link
                          href={`/product/${item.product.slug}`}
                          onClick={() => setIsCartDrawerOpen(false)}
                          className="text-xs font-semibold text-[#1A1A1A] hover:text-[#FF55D2] transition-colors line-clamp-1"
                        >
                          {item.product.name}
                        </Link>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-neutral-400 hover:text-red-500 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-[11px] text-neutral-500 mt-0.5">
                        Size: <span className="font-medium text-neutral-800">{item.size}</span>
                      </div>
                      <div className="text-xs font-medium text-[#1A1A1A] mt-1">
                        Rs. {item.price.toLocaleString()}
                      </div>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-50">
                      <div className="flex items-center border border-neutral-200 rounded-xs">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-neutral-100 active:scale-90 text-neutral-600 transition-all"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-medium text-neutral-800 min-w-[24px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-neutral-100 active:scale-90 text-neutral-600 transition-all"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="text-xs font-semibold text-[#1A1A1A]">
                        Rs. {(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer with Subtotal & Proceed to /cart */}
          {items.length > 0 && (
            <div className="border-t border-neutral-200 px-6 py-5 bg-neutral-50 space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-neutral-500">
                  <span>Subtotal ({totalCount} items)</span>
                  <span className="font-semibold text-neutral-900">
                    Rs. {subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-sans font-bold text-[#1A1A1A] pt-1 border-t border-neutral-200/60">
                  <span>Estimated Total</span>
                  <span className="text-[#1A1A1A]">
                    Rs. {subtotal.toLocaleString()}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  Taxes and personalized delivery options confirmed via WhatsApp.
                </p>
              </div>

              <div className="space-y-2">
                <Link
                  href="/cart"
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="w-full py-3.5 px-4 bg-[#FF55D2] hover:bg-[#FD00B9] active:bg-[#D5009C] text-white text-xs font-semibold uppercase tracking-widest flex items-center justify-center space-x-2 transition-colors shadow-sm"
                >
                  <span>Proceed to WhatsApp Order</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <button
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="w-full py-2.5 text-xs tracking-wider uppercase text-neutral-600 hover:text-black font-medium text-center transition-colors"
                >
                  Continue Browsing
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
