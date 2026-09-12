'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Product, StoreSettings } from '@/lib/types';
import { useCart } from '@/context/CartContext';
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
} from 'lucide-react';
import ProductCard from '@/components/ui/ProductCard';

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
  settings: StoreSettings;
}

export default function ProductDetailClient({
  product,
  relatedProducts,
  settings,
}: ProductDetailClientProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>(
    product.variants?.[0]?.size || ''
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [fabricOpen, setFabricOpen] = useState(true);
  const [careOpen, setCareOpen] = useState(false);
  const [addedNotice, setAddedNotice] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [sizePrompt, setSizePrompt] = useState(false);

  // Selected variant stock info
  const selectedVariant = product.variants?.find((v) => v.size === selectedSize);
  const currentStock = selectedVariant ? selectedVariant.stock_quantity : 0;
  const isOutOfStock = currentStock <= 0;
  const isLimitedStock = currentStock > 0 && currentStock <= 2;

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizePrompt(true);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-xs text-neutral-400 uppercase tracking-widest mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-black transition-colors">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-black transition-colors">Shop</Link>
        {product.category_name && (
          <>
            <span>/</span>
            <Link href={`/shop?category=${product.category_id}`} className="hover:text-black transition-colors">
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
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
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
                  <Image src={img} alt={`${product.name} preview ${idx + 1}`} fill className="object-cover" />
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
                alt={`${product.name} view ${idx + 1}`}
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
        <div className="lg:col-span-5 flex flex-col justify-between">
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
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-2xl font-semibold text-[#1A1A1A]">
                Rs. {product.price.toLocaleString()}
              </span>
              <span className="text-xs text-neutral-400">All local taxes included</span>
            </div>

            {/* Description */}
            <p className="mt-6 text-sm text-neutral-600 leading-relaxed font-light">
              {product.description}
            </p>

            {/* Size Selector */}
            <div className="mt-8 pt-6 border-t border-neutral-200">
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
                    Selected size is currently out of stock. Contact us for custom making.
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
                  <span>Ask Stylist via WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Size Chart Modal / Drawer */}
            {sizeChartOpen && (
              <div className="mt-6 p-4 bg-neutral-50 border border-neutral-200 text-xs">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold uppercase tracking-wider text-neutral-800">
                    Boutique Standard Sizing (Inches)
                  </span>
                  <button
                    onClick={() => setSizeChartOpen(false)}
                    className="text-neutral-400 hover:text-black text-xs"
                  >
                    Close
                  </button>
                </div>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-300 text-neutral-500">
                      <th className="py-1.5">Size</th>
                      <th className="py-1.5">Bust</th>
                      <th className="py-1.5">Waist</th>
                      <th className="py-1.5">Hip</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 text-neutral-700">
                    <tr><td className="py-1.5 font-medium">S</td><td>34"</td><td>26"</td><td>36"</td></tr>
                    <tr><td className="py-1.5 font-medium">M</td><td>36"</td><td>28"</td><td>38"</td></tr>
                    <tr><td className="py-1.5 font-medium">L</td><td>38"</td><td>30"</td><td>40"</td></tr>
                    <tr><td className="py-1.5 font-medium">XL</td><td>40"</td><td>32"</td><td>42"</td></tr>
                  </tbody>
                </table>
                <p className="mt-3 text-[11px] text-neutral-500">
                  Need a bespoke size? Reach out on WhatsApp or visit our <Link href="/custom" className="text-[#FF55D2] underline">Custom Made</Link> page.
                </p>
              </div>
            )}

            {/* Accordions: Fabric & Care */}
            <div className="mt-8 border-t border-neutral-200 divide-y divide-neutral-200">
              {product.fabric && (
                <div className="py-4">
                  <button
                    onClick={() => setFabricOpen(!fabricOpen)}
                    className="w-full flex justify-between items-center text-xs uppercase tracking-widest font-semibold text-neutral-900"
                  >
                    <span>Fabric & Artisanal Details</span>
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

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-24 pt-12 border-t border-neutral-200">
          <div className="text-center mb-10">
            <p className="text-xs uppercase tracking-[0.25em] text-[#FF55D2] font-semibold mb-1">
              COMPLEMENTARY PIECES
            </p>
            <h2 className="font-serif text-3xl text-[#1A1A1A] font-light">
              You May Also Admire
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
            {relatedProducts.slice(0, 4).map((relProduct) => (
              <ProductCard key={relProduct.id} product={relProduct} />
            ))}
          </div>
        </div>
      )}

      {/* Mobile Sticky Bottom Purchase Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-neutral-200 p-3 z-30 shadow-lg flex items-center justify-between gap-3 animate-in slide-in-from-bottom duration-300">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-sans text-[#1A1A1A] font-medium truncate">{product.name}</p>
          <p className="text-xs font-semibold text-[#FF55D2]">
            Rs. {product.price.toLocaleString()}{' '}
            <span className="text-[10px] text-neutral-400 font-normal">({selectedSize || 'Select Size'})</span>
          </p>
        </div>
        <button
          type="button"
          disabled={isOutOfStock || !selectedSize}
          onClick={handleAddToCart}
          className={`px-5 py-3 text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5 transition-all shadow-sm shrink-0 active:scale-95 rounded-xs ${
            isOutOfStock || !selectedSize
              ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
              : addedNotice
              ? 'bg-emerald-700 text-white'
              : 'bg-[#1A1A1A] hover:bg-[#FF55D2] text-white'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>{addedNotice ? 'Added!' : 'Add to Bag'}</span>
        </button>
      </div>
    </div>
  );
}
