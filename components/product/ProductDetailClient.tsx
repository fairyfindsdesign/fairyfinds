'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Product, StoreSettings, SizeChart } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingBag,
  Heart,
  Share2,
  Check,
  ShieldCheck,
  Sparkles,
  Ruler,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  Zap,
  ArrowRight,
  Truck,
  X,
} from 'lucide-react';
import ProductCard from '@/components/ui/ProductCard';

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
  settings: StoreSettings;
  sizeChart?: SizeChart | null;
}

function formatMeasurement(val: string | undefined, unit: 'inches' | 'cm'): string {
  if (!val || val === '-') return '-';
  const match = val.match(/([\d.]+)/);
  if (!match) return val;
  const num = parseFloat(match[1]);
  if (isNaN(num)) return val;

  if (unit === 'cm') {
    const inCm = Math.round(num * 2.54);
    return `${inCm} cm`;
  }
  return val.includes('"') || val.toLowerCase().includes('in') ? val : `${val}"`;
}

export default function ProductDetailClient({
  product,
  relatedProducts,
  settings,
  sizeChart,
}: ProductDetailClientProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>(
    product.variants?.[0]?.size || ''
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [sizeUnit, setSizeUnit] = useState<'inches' | 'cm'>('inches');
  const [fabricOpen, setFabricOpen] = useState(true);
  const [careOpen, setCareOpen] = useState(false);
  const [addedNotice, setAddedNotice] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [sizePrompt, setSizePrompt] = useState(false);
  const sizeSelectorRef = useRef<HTMLDivElement>(null);

  // Lock body scroll and handle Escape key when size guide modal is open
  useEffect(() => {
    if (sizeChartOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setSizeChartOpen(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [sizeChartOpen]);

  // Selected variant stock info
  const selectedVariant = product.variants?.find((v) => v.size === selectedSize);
  const currentStock = selectedVariant ? selectedVariant.stock_quantity : 0;
  const isOutOfStock = currentStock <= 0;
  const isLimitedStock = currentStock > 0 && currentStock <= 2;

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizePrompt(true);
      sizeSelectorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => setSizePrompt(false), 3000);
      return;
    }
    if (isOutOfStock) return;
    addItem(product, selectedSize, quantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 3500);
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      setSizePrompt(true);
      sizeSelectorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => setSizePrompt(false), 3000);
      return;
    }
    if (isOutOfStock) return;
    addItem(product, selectedSize, quantity);
    router.push('/cart');
  };

  const handleCopyCode = () => {
    const code = product.product_code || product.id;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  // Direct WhatsApp inquiry for this specific piece
  const directWhatsAppInquiry = () => {
    const cleanNumber = settings.whatsapp_number.replace(/[^0-9]/g, '');
    const productCode = product.product_code || product.id;
    const variantSku = product.variants?.find((v) => v.size === selectedSize)?.sku;
    const skuText = variantSku ? ` (SKU: ${variantSku})` : '';

    const message = `*Fairy Finds Boutique - Garment Inquiry / Order*

• Product: *${product.name}*
• Product ID / Code: *${productCode}*${skuText}
• Selected Size: ${selectedSize || 'Standard'}
• Price: ${settings.currency_symbol || 'Rs.'} ${product.price.toLocaleString()}

Hello Fairy Finds, I would like to inquire about / order this piece. Is this size available for immediate dispatch?`;
    window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 pb-28 lg:pb-16">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-xs text-neutral-400 uppercase tracking-widest mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-black transition-colors">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-black transition-colors">Shop</Link>
        {product.category_name && (
          <>
            <span>/</span>
            <Link
              href={product.category_id ? `/category/${product.category_id.replace(/^cat-/, '')}` : '/shop'}
              className="hover:text-black transition-colors"
            >
              {product.category_name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-neutral-800 font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        {/* Images Gallery (Left) */}
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4 gsap-fade-up">
          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-visible">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-16 h-20 sm:w-20 sm:h-24 flex-shrink-0 bg-neutral-100 overflow-hidden border transition-all ${
                    selectedImageIndex === idx
                      ? 'border-[#FF55D2] ring-1 ring-[#FF55D2]'
                      : 'border-neutral-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} thumbnail ${idx + 1} - Fairy Finds Boutique`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Main Selected Image with Smooth Crossfade */}
          <div className="relative aspect-[3/4] flex-1 bg-neutral-100 overflow-hidden border border-neutral-200 shadow-sm">
            {(product.images && product.images.length > 0
              ? product.images
              : ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=1200']
            ).map((img, idx) => (
              <Image
                key={idx}
                src={img}
                alt={`${product.name} ${idx === 0 ? 'editorial view' : `detail ${idx + 1}`} - Fairy Finds Boutique`}
                fill
                priority={idx === 0}
                sizes="(max-width: 1024px) 100vw, 600px"
                className={`object-cover object-top transition-opacity duration-500 ${
                  selectedImageIndex === idx ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'
                }`}
              />
            ))}
            {isOutOfStock && (
              <div className="absolute top-4 left-4 bg-[#1A1A1A] text-white text-xs uppercase tracking-widest font-semibold px-3 py-1.5 shadow z-20">
                Out of Stock in {selectedSize}
              </div>
            )}
          </div>
        </div>

        {/* Product Details & Actions (Right) */}
        <div className="lg:col-span-5 flex flex-col justify-between gsap-fade-up">
          <div>
            {/* Collection / Category tag & Product Code */}
            <div className="flex flex-wrap items-center gap-2.5 mb-2">
              {product.collection_name && (
                <Link
                  href={`/collections/${product.collection_id}`}
                  className="text-xs uppercase tracking-widest font-semibold text-[#FF55D2] hover:underline"
                >
                  {product.collection_name} Collection
                </Link>
              )}
              {(product.product_code || product.id) && (
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200/80 border border-neutral-200 text-[11px] font-mono text-neutral-700 transition-colors rounded-xs active:scale-95"
                  title="Click to copy Product ID"
                >
                  <span>ID: {product.product_code || product.id}</span>
                  {copiedCode ? (
                    <span className="text-emerald-600 text-[10px] font-sans font-medium">Copied!</span>
                  ) : (
                    <Copy className="w-3 h-3 text-neutral-400" />
                  )}
                </button>
              )}
            </div>

            {/* Title */}
            <h1 className="font-serif text-3xl sm:text-4xl text-[#1A1A1A] font-light leading-tight">
              {product.name}
            </h1>

            {/* Price */}
            <div className="mt-4 flex flex-wrap items-baseline gap-3">
              <span className="text-2xl font-semibold text-[#1A1A1A]">
                Rs. {product.price.toLocaleString()}
              </span>
              {typeof product.delivery_fee === 'number' && product.delivery_fee > 0 ? (
                <span className="inline-flex items-center gap-1 text-xs text-neutral-600 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded-xs">
                  <Truck className="w-3 h-3 text-neutral-500" />
                  + Rs. {product.delivery_fee} delivery
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-xs font-medium">
                  <Truck className="w-3 h-3 text-emerald-600" />
                  Free Delivery
                </span>
              )}
              <span className="text-xs text-neutral-400">All local taxes included</span>
            </div>

            {/* Description */}
            <p className="mt-6 text-sm text-neutral-600 leading-relaxed font-light">
              {product.description}
            </p>

            {/* Size Selector */}
            <div ref={sizeSelectorRef} className="mt-8 pt-6 border-t border-neutral-200 scroll-mt-24">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-widest font-semibold text-neutral-900">
                  Select Size:
                </span>
                <button
                  type="button"
                  onClick={() => setSizeChartOpen(!sizeChartOpen)}
                  className="text-xs text-neutral-500 hover:text-[#FF55D2] flex items-center gap-1 uppercase tracking-wider underline transition-colors"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  Size Guide
                </button>
              </div>

              {/* Size Buttons */}
              <div className="grid grid-cols-4 gap-2.5">
                {product.variants?.map((variant) => {
                  const outOfStock = variant.stock_quantity <= 0;
                  const isSelected = selectedSize === variant.size;

                  return (
                    <button
                      key={variant.id}
                      type="button"
                      disabled={outOfStock}
                      onClick={() => {
                        setSelectedSize(variant.size);
                        setQuantity(1);
                      }}
                      className={`min-h-[44px] py-2.5 px-3 text-xs uppercase tracking-wider font-medium border transition-all active:scale-95 relative rounded-xs ${
                        isSelected
                          ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white shadow-sm ring-1 ring-black'
                          : outOfStock
                          ? 'border-neutral-200 text-neutral-300 line-through bg-neutral-50 cursor-not-allowed'
                          : 'border-neutral-200 text-neutral-700 hover:border-neutral-400 bg-white'
                      }`}
                    >
                      {variant.size}
                    </button>
                  );
                })}
              </div>

              {/* Stock Status Indicator */}
              <div className="mt-3 text-xs flex items-center gap-2">
                {isOutOfStock ? (
                  <span className="text-red-500 font-medium">
                    Selected size is currently out of stock. Contact us for custom orders.
                  </span>
                ) : isLimitedStock ? (
                  <span className="text-[#FF55D2] font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#FF55D2] animate-ping" />
                    Only {currentStock} left in stock for immediate order
                  </span>
                ) : (
                  <span className="text-emerald-700 font-medium flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    In Stock & Ready for WhatsApp Order
                  </span>
                )}
              </div>

              {/* Quantity Selector */}
              {!isOutOfStock && (
                <div className="mt-6 flex items-center gap-4">
                  <span className="text-xs uppercase tracking-widest font-semibold text-neutral-900">
                    Quantity:
                  </span>
                  <div className="flex items-center border border-neutral-300">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1.5 text-sm hover:bg-neutral-100 transition-colors"
                    >
                      -
                    </button>
                    <span className="px-4 py-1.5 text-xs font-semibold">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                      className="px-3 py-1.5 text-sm hover:bg-neutral-100 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Add to Bag & Buy Now Action Buttons */}
              <div className="mt-8 space-y-3">
                {sizePrompt && (
                  <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xs flex items-center gap-2 animate-in fade-in duration-200">
                    <span className="font-semibold">Notice:</span>
                    <span>Please select an available size above before proceeding.</span>
                  </div>
                )}

                {/* Primary Dual Action: Add to Bag + Buy Now */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Add to Bag */}
                  <button
                    type="button"
                    disabled={isOutOfStock || !selectedSize}
                    onClick={handleAddToCart}
                    className={`w-full py-4 px-5 text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-xs cursor-pointer rounded-xs border ${
                      isOutOfStock || !selectedSize
                        ? 'bg-neutral-100 border-neutral-200 text-neutral-400 cursor-not-allowed'
                        : 'bg-[#1A1A1A] hover:bg-neutral-800 border-[#1A1A1A] text-white active:scale-[0.98]'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>
                      {isOutOfStock
                        ? 'Sold Out'
                        : addedNotice
                        ? 'Added to Bag!'
                        : 'Add to Bag'}
                    </span>
                  </button>

                  {/* Buy Now */}
                  <button
                    type="button"
                    disabled={isOutOfStock || !selectedSize}
                    onClick={handleBuyNow}
                    className={`w-full py-4 px-5 text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-sm cursor-pointer rounded-xs ${
                      isOutOfStock || !selectedSize
                        ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                        : 'bg-[#FF55D2] hover:bg-[#FD00B9] active:bg-[#D5009C] text-white active:scale-[0.98]'
                    }`}
                  >
                    <Zap className="w-4 h-4 fill-white" />
                    <span>Buy Now</span>
                  </button>
                </div>

                {/* Added to Bag Inline Notification with Direct Link to /cart */}
                {addedNotice && (
                  <div className="p-3.5 bg-neutral-900 text-white text-xs flex items-center justify-between rounded-xs shadow-md animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#FF55D2]" />
                      <span>Added to your shopping bag ({selectedSize}, qty: {quantity})</span>
                    </div>
                    <Link
                      href="/cart"
                      className="text-[#FF55D2] hover:text-white uppercase tracking-wider font-semibold text-[11px] underline underline-offset-4 flex items-center gap-1 transition-colors"
                    >
                      <span>View Bag</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                )}

                {/* Direct WhatsApp Consultation */}
                <button
                  type="button"
                  onClick={directWhatsAppInquiry}
                  className="w-full py-3.5 px-6 border border-neutral-300 hover:border-[#1A1A1A] text-[#1A1A1A] text-xs uppercase tracking-widest font-medium flex items-center justify-center gap-2 transition-colors bg-white cursor-pointer rounded-xs"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Chat with Us on WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Accordions: Fabric & Care */}
            <div className="mt-8 border-t border-neutral-200 divide-y divide-neutral-200">
              {product.fabric && (
                <div className="py-4">
                  <button
                    onClick={() => setFabricOpen(!fabricOpen)}
                    className="w-full flex justify-between items-center text-xs uppercase tracking-widest font-semibold text-neutral-900"
                  >
                    <span>Fabric & Material Details</span>
                    {fabricOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {fabricOpen && (
                    <p className="mt-2 text-xs text-neutral-600 leading-relaxed font-light">
                      {product.fabric}
                    </p>
                  )}
                </div>
              )}

              {product.care_instructions && (
                <div className="py-4">
                  <button
                    onClick={() => setCareOpen(!careOpen)}
                    className="w-full flex justify-between items-center text-xs uppercase tracking-widest font-semibold text-neutral-900"
                  >
                    <span>Care Instructions</span>
                    {careOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {careOpen && (
                    <p className="mt-2 text-xs text-neutral-600 leading-relaxed font-light">
                      {product.care_instructions}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products - Horizontally scrollable on mobile */}
      {relatedProducts.length > 0 && (
        <div className="mt-20 sm:mt-24 pt-10 sm:pt-12 border-t border-neutral-200 gsap-fade-up">
          <div className="flex items-end justify-between mb-8 sm:mb-10">
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-[#FF55D2] font-semibold mb-1">
                YOU MIGHT ALSO LIKE
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#1A1A1A] font-light">
                Similar Styles
              </h2>
            </div>
            <span className="sm:hidden text-[11px] uppercase tracking-wider text-neutral-400 font-medium">
              Swipe →
            </span>
          </div>
          <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 overflow-x-auto sm:overflow-visible pb-4 sm:pb-0 snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar gsap-stagger">
            {relatedProducts.slice(0, 8).map((relProduct) => (
              <div key={relProduct.id} className="w-[240px] sm:w-auto shrink-0 snap-start">
                <ProductCard product={relProduct} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Sticky Bottom Purchase Bar with Dual Actions: Add to Cart & Buy Now */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200/90 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] px-3 pt-2 pb-[max(0.65rem,env(safe-area-inset-bottom))] animate-in slide-in-from-bottom duration-500">
        {/* Compact Product info line */}
        <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-neutral-100 text-xs">
          <div className="min-w-0 flex-1 pr-2 flex items-center gap-2">
            <span className="font-serif text-[#1A1A1A] font-medium truncate text-xs">
              {product.name}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="font-semibold text-[#FF55D2] text-xs">
              Rs. {product.price.toLocaleString()}
            </span>
            <button
              type="button"
              onClick={() => sizeSelectorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
              className={`text-[10px] px-2 py-0.5 rounded-xs border font-medium transition-colors duration-500 ${
                selectedSize
                  ? 'border-neutral-900 bg-neutral-900 text-white'
                  : 'border-[#FF55D2] bg-pink-50 text-[#FF55D2] animate-pulse'
              }`}
            >
              {selectedSize ? `Size: ${selectedSize}` : 'Select Size'}
            </button>
          </div>
        </div>

        {/* Dual Button Grid: Add to Cart + Buy Now */}
        <div className="grid grid-cols-2 gap-2">
          {/* Button 1: Add to Cart */}
          <button
            type="button"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
            className={`min-h-[44px] px-3 py-2.5 text-[11px] uppercase tracking-wider font-semibold flex items-center justify-center gap-1.5 transition-all duration-500 shadow-xs shrink-0 active:scale-95 rounded-xs border ${
              isOutOfStock
                ? 'bg-neutral-100 border-neutral-200 text-neutral-400 cursor-not-allowed'
                : addedNotice
                ? 'bg-emerald-700 border-emerald-700 text-white'
                : 'bg-white hover:bg-neutral-50 border-[#1A1A1A] text-[#1A1A1A]'
            }`}
          >
            {addedNotice ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Added!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 text-[#1A1A1A]" />
                <span>Add to Bag</span>
              </>
            )}
          </button>

          {/* Button 2: Buy Now */}
          <button
            type="button"
            disabled={isOutOfStock}
            onClick={handleBuyNow}
            className={`min-h-[44px] px-3 py-2.5 text-[11px] uppercase tracking-wider font-semibold flex items-center justify-center gap-1.5 transition-all duration-500 shadow-sm shrink-0 active:scale-95 rounded-xs ${
              isOutOfStock
                ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                : 'bg-[#FF55D2] hover:bg-[#FD00B9] active:bg-[#D5009C] text-white shadow-[#FF55D2]/25'
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span>Buy Now</span>
          </button>
        </div>
      </div>

      {/* Size Guide Modal Dialog with 0.5s Transition */}
      <AnimatePresence>
        {sizeChartOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-hidden">
            {/* Backdrop with 0.5s fade */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              onClick={() => setSizeChartOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
              aria-hidden="true"
            />

            {/* Modal Window with 0.5s transition */}
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="size-guide-modal-title"
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative bg-white border border-neutral-200 shadow-2xl rounded-xs w-full max-w-2xl max-h-[85vh] sm:max-h-[90vh] flex flex-col z-10 overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-neutral-200 flex items-center justify-between bg-white shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-pink-50 border border-pink-100 flex items-center justify-center text-[#FF55D2] shrink-0">
                    <Ruler className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 id="size-guide-modal-title" className="font-serif text-lg sm:text-xl text-[#1A1A1A] font-medium">
                      Size & Measurement Guide
                    </h3>
                    <p className="text-xs text-neutral-500">
                      {sizeChart?.name || 'Standard Boutique Sizing'} • Fairy Finds
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSizeChartOpen(false)}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xs text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors duration-500 cursor-pointer"
                  aria-label="Close size guide"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="overflow-y-auto p-4 sm:p-6 space-y-6 text-neutral-700">
                {/* Unit Switcher & Active Size Helper */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-100">
                  <div className="flex items-center gap-2 text-xs text-neutral-600">
                    <span className="font-medium">Selected Size:</span>
                    <span className="px-2.5 py-0.5 bg-neutral-900 text-white font-semibold rounded-xs text-[11px]">
                      {selectedSize || 'None Selected'}
                    </span>
                  </div>

                  <div className="flex items-center bg-neutral-100 p-0.5 rounded-xs border border-neutral-200 text-xs">
                    <button
                      type="button"
                      onClick={() => setSizeUnit('inches')}
                      className={`px-3 py-1 font-medium rounded-xs transition-all duration-500 cursor-pointer ${
                        sizeUnit === 'inches'
                          ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                          : 'text-neutral-500 hover:text-neutral-900'
                      }`}
                    >
                      Inches (in)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSizeUnit('cm')}
                      className={`px-3 py-1 font-medium rounded-xs transition-all duration-500 cursor-pointer ${
                        sizeUnit === 'cm'
                          ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                          : 'text-neutral-500 hover:text-neutral-900'
                      }`}
                    >
                      Centimeters (cm)
                    </button>
                  </div>
                </div>

                {/* Horizontally Scrollable Table Section on Mobile with Sticky Left Column */}
                <div className="space-y-2">
                  <div className="sm:hidden flex items-center justify-between text-[11px] text-neutral-600 bg-pink-50/70 border border-pink-100 px-3 py-1.5 rounded-xs">
                    <span className="flex items-center gap-1.5 font-medium text-pink-950">
                      <Ruler className="w-3 h-3 text-[#FF55D2]" />
                      <span>Scroll table horizontally for all measurements</span>
                    </span>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-[#FF55D2]">↔ Swipe</span>
                  </div>

                  <div className="overflow-x-auto -webkit-overflow-scrolling-touch border border-neutral-200 rounded-xs shadow-2xs">
                    <table className="w-full text-left border-collapse min-w-[340px] text-xs">
                      <thead>
                        <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 uppercase tracking-wider text-[11px]">
                          {(sizeChart?.columns && sizeChart.columns.length > 0 ? sizeChart.columns : ['Size', 'Bust', 'Waist', 'Hips']).map((col, idx) => (
                            <th
                              key={idx}
                              className={`py-3 px-3.5 font-semibold capitalize ${
                                idx === 0
                                  ? 'sticky left-0 bg-neutral-50 z-10 border-r border-neutral-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]'
                                  : ''
                              }`}
                            >
                              {col}
                            </th>
                          ))}
                          <th className="py-3 px-3.5 font-semibold text-right">Select</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200 text-neutral-700">
                        {(sizeChart?.rows && sizeChart.rows.length > 0
                          ? sizeChart.rows
                          : [
                              { size: 'S', bust: '34"', waist: '26"', hips: '36"' },
                              { size: 'M', bust: '36"', waist: '28"', hips: '38"' },
                              { size: 'L', bust: '38"', waist: '30"', hips: '40"' },
                              { size: 'XL', bust: '40"', waist: '32"', hips: '42"' },
                            ]
                        ).map((row, rIdx) => {
                          const cols = sizeChart?.columns && sizeChart.columns.length > 0 ? sizeChart.columns : ['Size', 'Bust', 'Waist', 'Hips'];
                          const isCurrent = row.size === selectedSize;
                          return (
                            <tr
                              key={rIdx}
                              className={`transition-colors duration-500 ${
                                isCurrent ? 'bg-pink-50/80 font-medium' : 'hover:bg-neutral-50/60'
                              }`}
                            >
                              {cols.map((col, cIdx) => (
                                <td
                                  key={cIdx}
                                  className={`py-3 px-3.5 whitespace-nowrap ${
                                    cIdx === 0
                                      ? `sticky left-0 z-10 font-bold border-r border-neutral-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] ${
                                          isCurrent ? 'bg-pink-100 text-[#FF55D2]' : 'bg-white text-neutral-900'
                                        }`
                                      : ''
                                  }`}
                                >
                                  {cIdx === 0
                                    ? row[col] || row.size
                                    : formatMeasurement(row[col] || row[col.toLowerCase()] || '-', sizeUnit)}
                                </td>
                              ))}
                              <td className="py-3 px-3.5 text-right whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedSize(row.size);
                                    setSizeChartOpen(false);
                                  }}
                                  className={`px-2.5 py-1 text-[11px] uppercase tracking-wider font-semibold rounded-xs transition-all duration-500 cursor-pointer ${
                                    isCurrent
                                      ? 'bg-[#FF55D2] text-white shadow-xs'
                                      : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
                                  }`}
                                >
                                  {isCurrent ? 'Selected' : 'Choose'}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Notes & Description */}
                {(sizeChart?.notes || sizeChart?.description) && (
                  <div className="p-3 bg-neutral-50 border-l-2 border-[#FF55D2] text-xs text-neutral-600 rounded-r-xs space-y-1">
                    <p className="font-semibold text-neutral-900">Garment Note:</p>
                    <p>{sizeChart.notes || sizeChart.description}</p>
                  </div>
                )}

                {/* How to Measure Section */}
                <div className="pt-2 border-t border-neutral-100">
                  <h4 className="text-xs uppercase tracking-widest font-semibold text-neutral-900 mb-3">
                    How to Measure
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-neutral-600">
                    <div className="p-3 bg-neutral-50 border border-neutral-200/80 rounded-xs">
                      <span className="font-semibold text-neutral-900 block mb-1">1. Bust</span>
                      <span>Measure around the fullest part of your chest, keeping the tape comfortably level.</span>
                    </div>
                    <div className="p-3 bg-neutral-50 border border-neutral-200/80 rounded-xs">
                      <span className="font-semibold text-neutral-900 block mb-1">2. Waist</span>
                      <span>Measure around your natural waistline, typically the narrowest point of your torso.</span>
                    </div>
                    <div className="p-3 bg-neutral-50 border border-neutral-200/80 rounded-xs">
                      <span className="font-semibold text-neutral-900 block mb-1">3. Hips</span>
                      <span>Measure around the fullest part of your hips with your feet together.</span>
                    </div>
                  </div>
                </div>

                {/* Custom Sizing Callout */}
                <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-semibold text-emerald-950 block">Need a Custom Size?</span>
                    <span className="text-emerald-800">
                      Our boutique tailors custom fits to your exact body measurements with zero stress.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSizeChartOpen(false);
                      directWhatsAppInquiry();
                    }}
                    className="min-h-[44px] px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded-xs flex items-center justify-center gap-1.5 shrink-0 transition-colors duration-500 cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp Stylist</span>
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between shrink-0">
                <span className="text-xs text-neutral-500">
                  Tip: If between sizes, sizing up is recommended.
                </span>
                <button
                  type="button"
                  onClick={() => setSizeChartOpen(false)}
                  className="min-h-[44px] px-5 py-2 bg-[#1A1A1A] hover:bg-neutral-800 text-white text-xs uppercase tracking-widest font-semibold rounded-xs transition-colors duration-500 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
