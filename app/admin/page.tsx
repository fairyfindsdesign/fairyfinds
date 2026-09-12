import React from 'react';
import Link from 'next/link';
import { getProducts, getCollections, getSettings, getHomepageSections } from '@/lib/data/store';
import { Package, Layers, LayoutTemplate, Phone, AlertCircle, ArrowRight, Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminDashboardPage() {
  const [products, collections, settings, sections] = await Promise.all([
    getProducts(),
    getCollections(),
    getSettings(),
    getHomepageSections(),
  ]);

  // Inventory stats
  let totalStockCount = 0;
  let outOfStockCount = 0;

  products.forEach((p) => {
    p.variants?.forEach((v) => {
      totalStockCount += v.stock_quantity;
      if (v.stock_quantity === 0) {
        outOfStockCount++;
      }
    });
  });

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Title & Quick Add */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#1A1A1A] font-light">
            Boutique Overview
          </h1>
          <p className="text-xs text-neutral-500 font-light mt-0.5 sm:mt-1">
            Welcome to the Fairy Finds Boutique management portal.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#FF55D2] hover:bg-[#FD00B9] text-white text-xs uppercase tracking-wider font-semibold shadow-xs transition-colors rounded-xs active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Metrics Cards - 2 columns on mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6">
        {/* Total Products */}
        <div className="bg-white border border-neutral-200 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-3">
            <span className="text-[11px] uppercase tracking-widest font-semibold">Total Garments</span>
            <Package className="w-4 h-4 text-[#FF55D2]" />
          </div>
          <div className="font-sans text-3xl font-bold text-[#1A1A1A]">
            {products.length}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Ready-to-wear designs</p>
        </div>

        {/* Total Stock */}
        <div className="bg-white border border-neutral-200 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-3">
            <span className="text-[11px] uppercase tracking-widest font-semibold">Units In Stock</span>
            <Layers className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-sans text-3xl font-bold text-[#1A1A1A]">
            {totalStockCount}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Across all standard sizes</p>
        </div>

        {/* Stock Alerts */}
        <div className="bg-white border border-neutral-200 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-3">
            <span className="text-[11px] uppercase tracking-widest font-semibold">Stock Alerts</span>
            <AlertCircle className={`w-4 h-4 ${outOfStockCount > 0 ? 'text-amber-500' : 'text-neutral-400'}`} />
          </div>
          <div className="font-sans text-3xl font-bold text-[#1A1A1A]">
            {outOfStockCount}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Variants currently at 0</p>
        </div>

        {/* WhatsApp Business Phone */}
        <div className="bg-white border border-neutral-200 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-3">
            <span className="text-[11px] uppercase tracking-widest font-semibold">Order WhatsApp</span>
            <Phone className="w-4 h-4 text-[#FF55D2]" />
          </div>
          <div className="text-sm font-semibold text-[#1A1A1A] truncate">
            {settings.whatsapp_number}
          </div>
          <Link
            href="/admin/settings"
            className="text-[11px] text-[#FF55D2] hover:underline mt-1 inline-block"
          >
            Change in Settings →
          </Link>
        </div>
      </div>

      {/* Quick Access Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Link
          href="/admin/products"
          className="p-6 bg-white border border-neutral-200 hover:border-[#FF55D2] transition-colors group shadow-xs"
        >
          <Package className="w-6 h-6 text-[#1A1A1A] group-hover:text-[#FF55D2] transition-colors mb-3" />
          <h3 className="font-serif text-lg font-medium text-[#1A1A1A] mb-1">
            Manage Catalog & Stock
          </h3>
          <p className="text-xs text-neutral-500 font-light mb-4">
            Update pricing, descriptions, images, and standard size quantities (S, M, L, XL).
          </p>
          <span className="text-xs font-semibold text-[#FF55D2] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            View Products <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>

        <Link
          href="/admin/homepage"
          className="p-6 bg-white border border-neutral-200 hover:border-[#FF55D2] transition-colors group shadow-xs"
        >
          <LayoutTemplate className="w-6 h-6 text-[#1A1A1A] group-hover:text-[#FF55D2] transition-colors mb-3" />
          <h3 className="font-serif text-lg font-medium text-[#1A1A1A] mb-1">
            Homepage CMS Sections
          </h3>
          <p className="text-xs text-neutral-500 font-light mb-4">
            Reorder homepage sections with Move Up / Move Down buttons, edit text, and toggle visibility.
          </p>
          <span className="text-xs font-semibold text-[#FF55D2] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            Customize Homepage <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>

        <Link
          href="/admin/settings"
          className="p-6 bg-white border border-neutral-200 hover:border-[#FF55D2] transition-colors group shadow-xs"
        >
          <Phone className="w-6 h-6 text-[#1A1A1A] group-hover:text-[#FF55D2] transition-colors mb-3" />
          <h3 className="font-serif text-lg font-medium text-[#1A1A1A] mb-1">
            Store & WhatsApp Settings
          </h3>
          <p className="text-xs text-neutral-500 font-light mb-4">
            Configure boutique WhatsApp order hotline, store address, Instagram profile, and announcements.
          </p>
          <span className="text-xs font-semibold text-[#FF55D2] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            Edit Settings <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>
      </div>

      {/* Recent Products Snapshot */}
      <div className="bg-white border border-neutral-200 shadow-xs">
        <div className="p-5 border-b border-neutral-200 flex justify-between items-center">
          <h2 className="font-serif text-lg text-[#1A1A1A] font-medium">
            Recent Catalog Pieces
          </h2>
          <Link
            href="/admin/products"
            className="text-xs uppercase tracking-wider text-[#FF55D2] font-semibold hover:underline"
          >
            View All ({products.length})
          </Link>
        </div>

        {/* Mobile Recent Products Card List */}
        <div className="md:hidden divide-y divide-neutral-100">
          {products.slice(0, 5).map((prod) => (
            <div key={prod.id} className="p-4 flex items-center justify-between gap-3 hover:bg-neutral-50">
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-sans text-sm font-semibold text-[#1A1A1A] truncate">{prod.name}</h4>
                  <span className="text-xs font-semibold text-[#1A1A1A] shrink-0">Rs. {prod.price.toLocaleString()}</span>
                </div>
                <div className="text-[11px] text-neutral-400 mt-0.5">
                  {prod.product_code || 'No SKU'} • {prod.category_name || 'General'}
                </div>
                <div className="flex gap-1 flex-wrap mt-2">
                  {prod.variants?.map((v) => (
                    <span
                      key={v.id}
                      className={`px-1.5 py-0.5 rounded-xs border text-[10px] ${
                        v.stock_quantity === 0
                          ? 'bg-red-50 text-red-600 border-red-200 font-bold'
                          : 'bg-neutral-50 text-neutral-600 border-neutral-200'
                      }`}
                    >
                      {v.size}: {v.stock_quantity}
                    </span>
                  ))}
                </div>
              </div>
              <Link
                href={`/admin/products/${prod.id}`}
                className="min-h-[38px] px-3.5 py-2 bg-neutral-100 hover:bg-[#FF55D2] hover:text-white text-xs font-semibold rounded-xs transition-colors shrink-0 flex items-center justify-center active:scale-95"
              >
                Edit
              </Link>
            </div>
          ))}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-500 uppercase tracking-wider">
                <th className="py-3 px-5">Piece</th>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock Breakdown</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-700">
              {products.slice(0, 5).map((prod) => (
                <tr key={prod.id} className="hover:bg-neutral-50/70 transition-colors">
                  <td className="py-3.5 px-5 font-medium text-[#1A1A1A]">
                    {prod.name}
                  </td>
                  <td className="py-3.5 px-4 text-neutral-500 font-mono text-[11px]">
                    {prod.product_code || '—'}
                  </td>
                  <td className="py-3.5 px-4">
                    {prod.category_name || 'General'}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-[#1A1A1A]">
                    Rs. {prod.price.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex gap-1.5 flex-wrap">
                      {prod.variants?.map((v) => (
                        <span
                          key={v.id}
                          className={`px-1.5 py-0.5 rounded-xs border text-[10px] ${
                            v.stock_quantity === 0
                              ? 'bg-red-50 text-red-600 border-red-200 font-bold'
                              : 'bg-neutral-50 text-neutral-600 border-neutral-200'
                          }`}
                        >
                          {v.size}: {v.stock_quantity}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/admin/products/${prod.id}`}
                      className="text-xs text-[#FF55D2] font-semibold hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
