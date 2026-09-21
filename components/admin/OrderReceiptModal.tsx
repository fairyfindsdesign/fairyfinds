'use client';

import React, { useState } from 'react';
import { Order } from '@/lib/types';
import { Printer, X, Phone, Share2, Check, Copy, FileText } from 'lucide-react';

interface OrderReceiptModalProps {
  order: Order | null;
  currencySymbol?: string;
  onClose: () => void;
}

export default function OrderReceiptModal({
  order,
  currencySymbol = 'Rs.',
  onClose,
}: OrderReceiptModalProps) {
  const [copied, setCopied] = useState(false);

  if (!order) return null;

  // Format date in Indian Standard Time (IST)
  const formattedDate = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(order.created_at));

  const cleanPhone = order.customer_phone.replace(/[^0-9]/g, '');

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const lines = [
      `*FAIRY FINDS BOUTIQUE — OFFICIAL RECEIPT*`,
      `Order Reference: #${order.order_number}`,
      `Date: ${formattedDate}`,
      `Status: ${order.status.toUpperCase()}`,
      `----------------------------------------`,
      `Customer: ${order.customer_name}`,
      `Phone: ${order.customer_phone}`,
      `Delivery Address: ${order.delivery_address}`,
      order.notes ? `Notes: ${order.notes}` : null,
      `----------------------------------------`,
      `*ITEMS ORDERED:*`,
      ...order.items.map(
        (it) =>
          `• ${it.product_name} (${it.product_code}) | Size: ${it.size} | Qty: ${it.quantity} | Total: ${currencySymbol} ${Number(it.line_total).toLocaleString('en-IN')}`
      ),
      `----------------------------------------`,
      `Subtotal: ${currencySymbol} ${Number(order.subtotal).toLocaleString('en-IN')}`,
      `Delivery Fee: ${Number(order.delivery_fee) > 0 ? `${currencySymbol} ${Number(order.delivery_fee).toLocaleString('en-IN')}` : 'Free'}`,
      `*GRAND TOTAL: ${currencySymbol} ${Number(order.total).toLocaleString('en-IN')}*`,
      `----------------------------------------`,
      `Fairy Finds Boutique, Neendoor, Kottayam, Kerala`,
      `Hotline: +91 6282629144 | fairyfindsdesign@gmail.com`,
    ]
      .filter(Boolean)
      .join('\n');

    navigator.clipboard.writeText(lines).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const getWhatsAppShareUrl = () => {
    const text = encodeURIComponent(
      `Hello ${order.customer_name}! 🌸\n\nHere is your official order receipt from *Fairy Finds Boutique*:\n\n` +
      `*Order Number:* #${order.order_number}\n` +
      `*Date:* ${formattedDate}\n` +
      `*Status:* ${order.status.toUpperCase()}\n\n` +
      `*Items:*\n` +
      order.items
        .map(
          (it) =>
            `• ${it.product_name} (Size: ${it.size}) × ${it.quantity} = ${currencySymbol} ${Number(it.line_total).toLocaleString('en-IN')}`
        )
        .join('\n') +
      `\n\n*Subtotal:* ${currencySymbol} ${Number(order.subtotal).toLocaleString('en-IN')}\n` +
      `*Delivery Fee:* ${Number(order.delivery_fee) > 0 ? `${currencySymbol} ${Number(order.delivery_fee).toLocaleString('en-IN')}` : 'Free'}\n` +
      `*Grand Total:* ${currencySymbol} ${Number(order.total).toLocaleString('en-IN')}\n\n` +
      `*Delivery To:*\n${order.delivery_address}\n\n` +
      `Thank you for shopping with Fairy Finds Boutique! ✨\n` +
      `Contact us anytime at +91 6282629144.`
    );
    return `https://wa.me/${cleanPhone}?text=${text}`;
  };

  return (
    <>
      {/* Print-specific style block */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #fairy-finds-receipt-printable,
          #fairy-finds-receipt-printable * {
            visibility: visible;
          }
          #fairy-finds-receipt-printable {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 24px !important;
            background: #ffffff !important;
            border: none !important;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Modal Backdrop */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
        <div
          className="bg-white w-full max-w-2xl max-h-[92vh] flex flex-col rounded-sm shadow-2xl overflow-hidden border border-neutral-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Top Control Bar (Hidden in Print) */}
          <div className="no-print flex items-center justify-between px-5 py-3.5 bg-neutral-900 text-white border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#FF55D2]" />
              <h3 className="text-sm font-semibold tracking-wide">
                Boutique Receipt &bull; Order #{order.order_number}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-neutral-900 text-xs font-semibold rounded-xs hover:bg-neutral-100 transition-colors cursor-pointer"
                title="Print or Save PDF"
              >
                <Printer className="w-3.5 h-3.5 text-[#FF55D2]" />
                Print / Save PDF
              </button>
              <a
                href={getWhatsAppShareUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#25D366] text-white text-xs font-semibold rounded-xs hover:bg-[#128C7E] transition-colors cursor-pointer"
                title="Send receipt breakdown directly via WhatsApp"
              >
                <Share2 className="w-3.5 h-3.5" />
                WhatsApp
              </a>
              <button
                onClick={handleCopyText}
                className="p-1.5 text-neutral-400 hover:text-white rounded-xs hover:bg-neutral-800 transition-colors cursor-pointer"
                title="Copy receipt text"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-neutral-400 hover:text-white rounded-xs hover:bg-neutral-800 transition-colors cursor-pointer ml-1"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Scrollable Receipt Body */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-[#FAF9F6]">
            {/* Printable Receipt Paper */}
            <div
              id="fairy-finds-receipt-printable"
              className="bg-white border border-neutral-200 p-6 sm:p-8 shadow-xs rounded-xs text-[#1A1A1A]"
            >
              {/* Top Accent Stripe */}
              <div className="h-1 bg-[#FF55D2] -mx-6 sm:-mx-8 -mt-6 sm:-mt-8 mb-6 rounded-t-xs" />

              {/* Boutique Header */}
              <div className="border-b border-neutral-200 pb-5 mb-6 text-center">
                <span className="text-[11px] uppercase tracking-[0.25em] font-bold text-[#FF55D2] block mb-1">
                  Artisanal Fashion &bull; Kottayam, Kerala
                </span>
                <h1 className="font-serif text-2xl sm:text-3xl font-normal text-neutral-900 tracking-wide">
                  Fairy Finds Boutique
                </h1>
                <p className="text-xs text-neutral-500 mt-1">
                  Neendoor PO, Kottayam, Kerala &bull; WhatsApp: +91 6282629144
                </p>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Email: fairyfindsdesign@gmail.com &bull; fairyfindsboutique.store
                </p>
              </div>

              {/* Receipt Title & Meta Row */}
              <div className="flex flex-wrap items-start justify-between gap-4 pb-5 mb-5 border-b border-neutral-100 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block mb-0.5">
                    Official Receipt
                  </span>
                  <p className="font-serif text-lg font-semibold text-neutral-900">
                    Order #{order.order_number}
                  </p>
                  <p className="text-neutral-500 text-[11px] mt-0.5">Placed on: {formattedDate}</p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block mb-0.5">
                    Order Status
                  </span>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-neutral-100 text-neutral-800 border border-neutral-200">
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Customer "Bill To / Ship To" Box */}
              <div className="bg-[#FAF9F6] border border-neutral-200 rounded-xs p-4 mb-6 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block mb-1">
                      Customer Details
                    </span>
                    <p className="font-semibold text-neutral-900 text-sm">{order.customer_name}</p>
                    <p className="text-neutral-600 mt-0.5 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-[#FF55D2]" />
                      {order.customer_phone}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block mb-1">
                      Delivery Address
                    </span>
                    <p className="text-neutral-700 whitespace-pre-line leading-relaxed">
                      {order.delivery_address}
                    </p>
                  </div>
                </div>

                {order.notes && (
                  <div className="mt-3 pt-3 border-t border-neutral-200 text-neutral-600">
                    <span className="font-semibold text-neutral-700">Special Notes: </span>
                    <span className="italic">{order.notes}</span>
                  </div>
                )}
              </div>

              {/* Items Table */}
              <div className="mb-6">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b-2 border-neutral-900 text-[10px] uppercase tracking-wider text-neutral-600">
                      <th className="py-2 text-left">Item Description</th>
                      <th className="py-2 text-center">Size</th>
                      <th className="py-2 text-center">Qty</th>
                      <th className="py-2 text-right">Price</th>
                      <th className="py-2 text-right">Delivery</th>
                      <th className="py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {order.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-3 pr-2">
                          <p className="font-medium text-neutral-900">{item.product_name}</p>
                          <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
                            {item.product_code}
                          </p>
                        </td>
                        <td className="py-3 px-2 text-center text-neutral-700 font-medium">{item.size}</td>
                        <td className="py-3 px-2 text-center text-neutral-700">{item.quantity}</td>
                        <td className="py-3 px-2 text-right text-neutral-700">
                          {currencySymbol}&nbsp;{Number(item.unit_price).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-2 text-right text-neutral-500">
                          {Number(item.delivery_fee) > 0
                            ? `${currencySymbol} ${Number(item.delivery_fee).toLocaleString('en-IN')}`
                            : 'Free'}
                        </td>
                        <td className="py-3 pl-2 text-right font-semibold text-neutral-900">
                          {currencySymbol}&nbsp;{Number(item.line_total).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Breakdown Table */}
              <div className="border-t border-neutral-200 pt-4 mb-6">
                <div className="w-full sm:w-64 ml-auto space-y-1.5 text-xs">
                  <div className="flex justify-between text-neutral-600">
                    <span>Subtotal</span>
                    <span>{currencySymbol}&nbsp;{Number(order.subtotal).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Delivery Charges</span>
                    <span>
                      {Number(order.delivery_fee) > 0
                        ? `${currencySymbol} ${Number(order.delivery_fee).toLocaleString('en-IN')}`
                        : 'Free'}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-base text-neutral-900 pt-2 border-t-2 border-neutral-900">
                    <span>Total Amount</span>
                    <span className="text-[#FF55D2]">
                      {currencySymbol}&nbsp;{Number(order.total).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Receipt Footer Note */}
              <div className="border-t border-dashed border-neutral-200 pt-5 text-center text-[11px] text-neutral-500 space-y-1">
                <p className="font-serif italic text-neutral-700 text-sm">
                  Thank you for your valued patronage.
                </p>
                <p>
                  For any alteration, custom fitting, or styling inquiries, please reach out via WhatsApp at{' '}
                  <span className="font-semibold text-neutral-700">+91 6282629144</span>.
                </p>
                <p className="text-[10px] text-neutral-400">
                  Fairy Finds Boutique &bull; Neendoor, Kottayam, Kerala &bull; Computer Generated Receipt
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Modal Actions (Hidden in Print) */}
          <div className="no-print flex items-center justify-between px-6 py-3 bg-white border-t border-neutral-200 text-xs">
            <span className="text-neutral-500">
              Order #{order.order_number} &bull; {order.customer_name}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 text-white font-medium rounded-xs hover:bg-black transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                Print / Save PDF
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-neutral-100 text-neutral-700 font-medium rounded-xs hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
