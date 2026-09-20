'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Plus, Minus, ArrowLeft, MessageCircle, ShieldCheck, ShoppingBag, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { StoreSettings, CustomerOrderDetails } from '@/lib/types';
import { saveOrderAction } from '@/app/actions/orders';

interface CheckoutClientProps {
  settings: StoreSettings;
}

export default function CheckoutClient({ settings }: CheckoutClientProps) {
  const { items, removeItem, updateQuantity, clearCart, subtotal, deliveryFee, total, totalCount } = useCart();

  const [customer, setCustomer] = useState<CustomerOrderDetails>({ name: '', phone: '', address: '', notes: '' });
  const [validationAttempted, setValidationAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<{ orderNumber: string; whatsappUrl?: string } | null>(null);
  const [whatsappFailed, setWhatsappFailed] = useState(false);
  const submittingRef = useRef(false);

  const isFormValid = customer.name.trim().length > 0 && customer.phone.trim().length > 0 && customer.address.trim().length > 0;

  const handleWhatsAppOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationAttempted(true);
    setOrderError(null);
    if (!isFormValid || items.length === 0) return;
    if (submittingRef.current) return;

    const idempotencyKey = `ff_order_${items.map(i => `${i.id}x${i.quantity}`).join('_')}`;
    const lastSubmit = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(idempotencyKey) : null;
    if (lastSubmit && Date.now() - Number(lastSubmit) < 30000) {
      setOrderError('Order already submitted. Please wait a moment before trying again.');
      return;
    }

    submittingRef.current = true;
    setIsSubmitting(true);
    if (typeof sessionStorage !== 'undefined') sessionStorage.setItem(idempotencyKey, String(Date.now()));

    try {
      const result = await saveOrderAction(items, customer, {
        whatsapp_number: settings.whatsapp_number,
        currency_symbol: settings.currency_symbol || 'Rs.',
      });

      if (!result.success || !result.orderNumber || !result.whatsappUrl) {
        setOrderError(result.error || "We couldn't place your order. Please try again.");
        if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem(idempotencyKey);
        return;
      }

      clearCart();
      setOrderSuccess({ orderNumber: result.orderNumber, whatsappUrl: result.whatsappUrl });

      try {
        const w = window.open(result.whatsappUrl, '_blank');
        if (!w) throw new Error('blocked');
      } catch {
        setWhatsappFailed(true);
      }
    } catch (err: any) {
      setOrderError(err?.message || "We couldn't place your order. Please try again.");
      if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem(idempotencyKey);
    } finally {
      setIsSubmitting(false);
      submittingRef.current = false;
    }
  };

  if (items.length === 0 && !orderSuccess) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="max-w-md mx-auto py-16 bg-neutral-50 border border-neutral-200 p-8 shadow-xs">
          <ShoppingBag className="w-16 h-16 text-neutral-300 mx-auto mb-4 stroke-1" />
          <h1 className="font-serif text-3xl text-[#1A1A1A] mb-2 font-light">Your Bag is Empty</h1>
          <p className="text-xs text-neutral-500 mb-8 font-light">You currently have no garments in your shopping bag.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/shop" className="px-6 py-3 bg-[#1A1A1A] hover:bg-[#FF55D2] text-white text-xs uppercase tracking-widest font-medium transition-colors">Explore Collection</Link>
            <Link href="/custom" className="px-6 py-3 border border-neutral-300 hover:border-black text-[#1A1A1A] text-xs uppercase tracking-widest font-medium transition-colors">Custom Tailoring</Link>
          </div>
        </div>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="max-w-lg mx-auto py-12 bg-white border border-neutral-200 p-8 shadow-xs space-y-5">
          <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7 text-emerald-600" />
          </div>
          <div>
            <h1 className="font-serif text-2xl text-[#1A1A1A] font-light mb-1">Order Received!</h1>
            <p className="text-sm font-semibold text-[#FF55D2] tracking-wider">Order #{orderSuccess.orderNumber}</p>
          </div>
          {whatsappFailed ? (
            <div className="p-4 bg-amber-50 border border-amber-200 text-xs text-amber-900 rounded-xs space-y-2 text-left">
              <p className="font-semibold">WhatsApp didn't open automatically.</p>
              <p>Don't worry — your order <strong>#{orderSuccess.orderNumber}</strong> was successfully received. Please contact us on WhatsApp to confirm.</p>
              {orderSuccess.whatsappUrl && (
                <a href={orderSuccess.whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 mt-2 px-4 py-2 bg-[#25D366] text-white text-xs font-semibold rounded-xs">
                  <MessageCircle className="w-3.5 h-3.5" /> Open WhatsApp
                </a>
              )}
            </div>
          ) : (
            <p className="text-xs text-neutral-500">Your order has been saved and WhatsApp is open with your order details pre-filled. Our team will confirm shortly.</p>
          )}
          <Link href="/shop" className="inline-block px-6 py-2.5 bg-[#1A1A1A] hover:bg-[#FF55D2] text-white text-xs uppercase tracking-widest font-medium transition-colors">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-14">
      <nav aria-label="Breadcrumb" className="text-xs text-neutral-400 uppercase tracking-widest mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-black transition-colors">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-black transition-colors">Shop</Link>
        <span>/</span>
        <span className="text-neutral-800 font-medium">Shopping Bag</span>
      </nav>

      <div className="border-b border-neutral-200 pb-6 mb-10 gsap-fade-up">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#FF55D2] font-semibold mb-1">FRICTIONLESS CHECKOUT</p>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#1A1A1A] font-light">Review Bag & WhatsApp Order</h1>
          </div>
          <Link href="/shop" className="hidden sm:flex items-center gap-1.5 text-xs uppercase tracking-widest text-neutral-500 hover:text-black transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Continue Shopping
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 space-y-6 gsap-fade-up">
          <div className="bg-white border border-neutral-200 divide-y divide-neutral-100 shadow-xs">
            <div className="p-4 sm:p-5 bg-neutral-50 flex justify-between items-center text-xs uppercase tracking-wider text-neutral-500 font-medium">
              <span>Selected Garments ({totalCount})</span>
              <button onClick={clearCart} className="text-neutral-400 hover:text-red-500 transition-colors">Clear Bag</button>
            </div>
            {items.map((item) => (
              <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-5">
                <div className="w-24 h-32 relative bg-neutral-100 flex-shrink-0 border border-neutral-200 overflow-hidden">
                  <Image src={item.product.images[0] || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=300'} alt={item.product.name} fill className="object-cover" sizes="96px" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-serif text-lg text-[#1A1A1A] font-medium leading-snug">
                        <Link href={`/product/${item.product.slug}`} className="hover:text-[#FF55D2] transition-colors">{item.product.name}</Link>
                      </h3>
                      <button onClick={() => removeItem(item.id)} className="text-neutral-400 hover:text-red-500 transition-colors p-1"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-neutral-500">
                      <span>Size: <strong className="text-neutral-800">{item.size}</strong></span>
                      <span className="inline-flex items-center px-2 py-0.5 bg-neutral-100 border border-neutral-200 text-[10px] font-mono text-neutral-700 rounded-xs">ID: {item.product.product_code || item.product.id}</span>
                    </div>
                    <div className="mt-2 text-sm font-semibold text-[#1A1A1A]">{settings.currency_symbol || 'Rs.'} {item.price.toLocaleString()}</div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                    <div className="flex items-center border border-neutral-300">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2.5 py-1 text-xs hover:bg-neutral-100 transition-colors"><Minus className="w-3 h-3" /></button>
                      <span className="px-3 py-1 text-xs font-semibold text-neutral-800">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2.5 py-1 text-xs hover:bg-neutral-100 transition-colors"><Plus className="w-3 h-3" /></button>
                    </div>
                    <div className="text-sm font-semibold text-[#1A1A1A]">Subtotal: {settings.currency_symbol || 'Rs.'} {(item.price * item.quantity).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 bg-neutral-50 border border-neutral-200 text-xs text-neutral-600 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>All pieces are checked and steamed by our boutique team prior to courier dispatch.</span>
          </div>
        </div>

        <div className="lg:col-span-5 gsap-fade-up">
          <div className="bg-white border border-neutral-200 p-6 sm:p-8 shadow-xs sticky top-28">
            <h2 className="font-serif text-2xl text-[#1A1A1A] font-light mb-1">Customer & Delivery Details</h2>
            <p className="text-xs text-neutral-500 mb-6 font-light">Enter your details — your order is saved instantly and WhatsApp opens pre-filled.</p>

            {orderError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2 rounded-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /><span>{orderError}</span>
              </div>
            )}

            <form onSubmit={handleWhatsAppOrder} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-800 mb-1">Full Name *</label>
                <input type="text" required placeholder="e.g. Sashi Perera" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 text-xs text-[#1A1A1A] focus:bg-white focus:outline-none focus:border-[#FF55D2] rounded-xs" />
                {validationAttempted && !customer.name.trim() && <span className="text-[11px] text-red-500 mt-0.5 block">Full name is required</span>}
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-800 mb-1">WhatsApp Phone Number *</label>
                <input type="tel" required placeholder="e.g. +91 98765 43210" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 text-xs text-[#1A1A1A] focus:bg-white focus:outline-none focus:border-[#FF55D2] rounded-xs" />
                {validationAttempted && !customer.phone.trim() && <span className="text-[11px] text-red-500 mt-0.5 block">Phone number is required</span>}
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-800 mb-1">Delivery Address *</label>
                <textarea required rows={2} placeholder="Street, City, Postal Code" value={customer.address} onChange={(e) => setCustomer({ ...customer, address: e.target.value })} className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 text-xs text-[#1A1A1A] focus:bg-white focus:outline-none focus:border-[#FF55D2] rounded-xs resize-none" />
                {validationAttempted && !customer.address.trim() && <span className="text-[11px] text-red-500 mt-0.5 block">Delivery address is required</span>}
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-800 mb-1">Special Instructions (Optional)</label>
                <input type="text" placeholder="e.g. Gift packaging, preferred delivery time" value={customer.notes} onChange={(e) => setCustomer({ ...customer, notes: e.target.value })} className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 text-xs text-[#1A1A1A] focus:bg-white focus:outline-none focus:border-[#FF55D2] rounded-xs" />
              </div>

              <div className="pt-4 mt-6 border-t border-neutral-200 space-y-2">
                <div className="flex justify-between text-xs text-neutral-600">
                  <span>Subtotal ({totalCount} items)</span>
                  <span className="font-semibold text-neutral-900">{settings.currency_symbol || 'Rs.'} {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-neutral-600">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-neutral-900">{deliveryFee > 0 ? `${settings.currency_symbol || 'Rs.'} ${deliveryFee.toLocaleString()}` : 'Free Delivery'}</span>
                </div>
                <div className="flex justify-between text-base font-sans font-bold text-[#1A1A1A] pt-2 border-t border-neutral-200">
                  <span>Total</span>
                  <span>{settings.currency_symbol || 'Rs.'} {total.toLocaleString()}</span>
                </div>
              </div>

              <div className="p-3 bg-neutral-50 text-[11px] text-neutral-500 leading-relaxed border border-neutral-200 rounded-xs">
                <strong>No online payment required now.</strong> Your order is saved first, then WhatsApp opens pre-filled. Our boutique team confirms payment and dispatch.
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full py-4 px-6 bg-[#FF55D2] hover:bg-[#FD00B9] active:bg-[#D5009C] disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer">
                {isSubmitting ? (<><Loader2 className="w-4 h-4 animate-spin" /><span>Saving Order...</span></>) : (<><MessageCircle className="w-4 h-4" /><span>Complete Order on WhatsApp</span></>)}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
