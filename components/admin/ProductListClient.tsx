'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/types';
import { Plus, Edit2, Trash2, Search, ExternalLink, AlertTriangle } from 'lucide-react';
import { deleteProductAction } from '@/app/actions/store';

interface ProductListClientProps {
  initialProducts: Product[];
}

export default function ProductListClient({ initialProducts }: ProductListClientProps) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.product_code && p.product_code.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (p.category_name && p.category_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}" from your catalog?`)) {
      setDeletingId(id);
      try {
        await deleteProductAction(id);
        setProducts((prev) => prev.filter((p) => p.id !== id));
        router.refresh();
      } catch (err: any) {
        console.error('Failed to delete product:', err);
        alert('Could not delete product: ' + (err?.message || 'Server action failed'));
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-[#1A1A1A] font-light">
            Products & Stock Inventory
          </h1>
          <p className="text-xs text-neutral-500 font-light mt-1">
            Manage your ready-to-wear pieces, image galleries, and size-specific quantities.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#FF55D2] hover:bg-[#FD00B9] text-white text-xs uppercase tracking-wider font-semibold shadow-xs transition-colors rounded-xs active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Piece</span>
        </Link>
      </div>

      {/* Search Input */}
      <div className="flex items-center bg-white border border-neutral-200 px-3.5 py-2.5 shadow-xs w-full sm:max-w-md rounded-xs">
        <Search className="w-4 h-4 text-neutral-400 mr-2 shrink-0" />
        <input
          type="text"
          placeholder="Search by piece title, code, or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs text-[#1A1A1A] placeholder-neutral-400 focus:outline-none"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="text-xs text-neutral-400 hover:text-neutral-700 px-1"
          >
            Clear
          </button>
        )}
      </div>

      {/* Products Display (Mobile Cards + Desktop Table) */}
      <div className="bg-white border border-neutral-200 shadow-xs overflow-hidden">
        {/* Mobile Product Card List */}
        <div className="md:hidden divide-y divide-neutral-100">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-neutral-400 text-xs">
              No products match your search query.
            </div>
          ) : (
            filtered.map((prod) => (
              <div key={prod.id} className="p-4 space-y-3 hover:bg-neutral-50/50">
                <div className="flex gap-3">
                  <div className="w-14 h-18 relative bg-neutral-100 border border-neutral-200 overflow-hidden shrink-0 rounded-xs">
                    <Image
                      src={prod.images?.[0] || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=200'}
                      alt={prod.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-serif text-base font-medium text-[#1A1A1A] leading-snug">
                        {prod.name}
                      </h3>
                      <span className="text-xs font-bold text-[#1A1A1A] shrink-0">
                        Rs. {prod.price.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-1">
                      <span className="inline-flex items-center px-1.5 py-0.5 bg-neutral-100 border border-neutral-200 font-mono text-neutral-800 font-semibold text-[10px] rounded-xs">
                        ID: {prod.product_code || 'No Code'}
                      </span>
                      <span>•</span>
                      <span>{prod.category_name || 'General'}</span>
                    </div>

                    {/* Published / Draft Pill */}
                    <div className="mt-1.5">
                      {prod.is_published ? (
                        <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] uppercase tracking-wider font-semibold rounded-xs">
                          Published
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 bg-neutral-100 text-neutral-600 border border-neutral-200 text-[9px] uppercase tracking-wider font-semibold rounded-xs">
                          Draft
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stock per Size */}
                <div className="flex gap-1.5 flex-wrap pt-1">
                  {prod.variants?.map((v) => (
                    <span
                      key={v.id}
                      className={`px-2 py-1 rounded-xs border text-[10px] ${
                        v.stock_quantity === 0
                          ? 'bg-red-50 text-red-600 border-red-200 font-bold'
                          : 'bg-neutral-50 text-neutral-700 border-neutral-200'
                      }`}
                    >
                      {v.size}: {v.stock_quantity}
                    </span>
                  ))}
                </div>

                {/* Mobile Action Buttons */}
                <div className="flex items-center gap-2 pt-2.5 border-t border-neutral-100">
                  <Link
                    href={`/admin/products/${prod.id}`}
                    className="flex-1 min-h-[42px] px-3 bg-[#1A1A1A] hover:bg-[#FF55D2] text-white text-xs font-semibold flex items-center justify-center uppercase tracking-wider rounded-xs transition-colors active:scale-95 shadow-xs"
                  >
                    Edit Garment
                  </Link>

                  <Link
                    href={`/product/${prod.slug}`}
                    target="_blank"
                    className="w-10 h-10 min-w-[40px] flex items-center justify-center border border-neutral-200 rounded-xs text-neutral-600 hover:bg-neutral-100 active:scale-90 transition-transform"
                    title="View live product"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleDelete(prod.id, prod.name)}
                    disabled={deletingId === prod.id}
                    className="w-10 h-10 min-w-[40px] flex items-center justify-center border border-neutral-200 rounded-xs text-neutral-400 hover:text-red-600 hover:bg-red-50 active:scale-90 transition-transform disabled:opacity-40"
                    title="Delete piece"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-500 uppercase tracking-wider">
                <th className="py-3 px-5">Garment</th>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Category / Collection</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Size & Stock Breakdown</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400 text-xs">
                    No products match your search query.
                  </td>
                </tr>
              ) : (
                filtered.map((prod) => {
                  return (
                    <tr key={prod.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-12 relative bg-neutral-100 border border-neutral-200 overflow-hidden flex-shrink-0">
                            <Image
                              src={prod.images?.[0] || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=200'}
                              alt={prod.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <span className="font-medium text-[#1A1A1A] block">{prod.name}</span>
                            <span className="text-[11px] text-neutral-400">{prod.slug}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px]">
                        {prod.product_code ? (
                          <span className="inline-flex items-center px-2 py-0.5 bg-neutral-100 border border-neutral-200 text-[10px] font-mono font-semibold text-neutral-800 rounded-xs">
                            {prod.product_code}
                          </span>
                        ) : (
                          <span className="text-neutral-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-neutral-800">{prod.category_name || '—'}</div>
                        {prod.collection_name && (
                          <span className="text-[10px] text-[#FF55D2] font-semibold block uppercase tracking-wider">
                            {prod.collection_name}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#1A1A1A]">
                        Rs. {prod.price.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1.5 flex-wrap">
                          {prod.variants?.map((v) => (
                            <span
                              key={v.id}
                              className={`px-1.5 py-0.5 rounded-xs border text-[10px] ${
                                v.stock_quantity === 0
                                  ? 'bg-red-50 text-red-600 border-red-200 font-bold'
                                  : 'bg-neutral-50 text-neutral-700 border-neutral-200'
                              }`}
                            >
                              {v.size}: {v.stock_quantity}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {prod.is_published ? (
                          <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] uppercase tracking-wider font-semibold">
                            Published
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 bg-neutral-100 text-neutral-600 border border-neutral-200 text-[10px] uppercase tracking-wider font-semibold">
                            Draft
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-5 text-right space-x-2">
                        <Link
                          href={`/product/${prod.slug}`}
                          target="_blank"
                          className="text-neutral-400 hover:text-black p-1 inline-block"
                          title="View live product"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          href={`/admin/products/${prod.id}`}
                          className="text-[#FF55D2] hover:text-[#FD00B9] p-1 inline-block font-semibold"
                          title="Edit product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(prod.id, prod.name)}
                          disabled={deletingId === prod.id}
                          className="text-neutral-400 hover:text-red-600 p-1 inline-block"
                          title="Delete piece"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
