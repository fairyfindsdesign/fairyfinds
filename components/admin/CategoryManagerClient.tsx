'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Category, Product } from '@/lib/types';
import {
  Plus,
  Tag,
  ExternalLink,
  Edit2,
  Trash2,
  CheckCircle2,
  Sparkles,
  Image as ImageIcon,
  Save,
  X,
  ArrowRight,
  Package,
  Layers,
  Search,
  AlertTriangle,
} from 'lucide-react';
import { saveCategoryAction, deleteCategoryAction } from '@/app/actions/store';
import ImageUpload from './ImageUpload';

interface CategoryManagerClientProps {
  initialCategories: Category[];
  products: Product[];
}

const PRESET_CATEGORY_IMAGES = [
  {
    label: 'Crimson Heritage Silk',
    url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800',
  },
  {
    label: 'Emerald Velvet Zari',
    url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800',
  },
  {
    label: 'Blush Pastel Organza',
    url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800',
  },
  {
    label: 'Banarasi Brocade Weave',
    url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=800',
  },
  {
    label: 'Contemporary Drape',
    url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&q=80&w=800',
  },
  {
    label: 'Artisanal Gold Jewellery',
    url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800',
  },
];

export default function CategoryManagerClient({
  initialCategories,
  products,
}: CategoryManagerClientProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  // Form Fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [displayOrder, setDisplayOrder] = useState(1);

  const [isSaving, setIsSaving] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setSlugManuallyEdited(false);
    setDescription('');
    setImageUrl('https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800');
    setDisplayOrder(categories.length + 1);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setSlugManuallyEdited(true);
    setDescription(cat.description || '');
    setImageUrl(cat.image_url || '');
    setDisplayOrder(cat.display_order ?? 1);
    setIsFormOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!slugManuallyEdited) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(generated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);

    const cleanSlug =
      slug.trim() ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const payload: Partial<Category> = {
      id: editingCategory ? editingCategory.id : undefined,
      name: name.trim(),
      slug: cleanSlug,
      description: description.trim(),
      image_url: imageUrl.trim(),
      display_order: Number(displayOrder) || 1,
    };

    try {
      const res = await saveCategoryAction(payload);
      if (res.success && res.category) {
        if (editingCategory) {
          setCategories((prev) =>
            prev.map((c) => (c.id === res.category!.id ? res.category! : c))
          );
          showToast(`Updated category "${res.category.name}"`);
        } else {
          setCategories((prev) => [...prev, res.category!]);
          showToast(`Created category "${res.category.name}"`);
        }
        setIsFormOpen(false);
        router.refresh();
      } else {
        alert(res.error || 'Failed to save category');
      }
    } catch (err: any) {
      console.error(err);
      alert('Error saving category: ' + (err?.message || 'Network error'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;
    setIsDeleting(true);

    try {
      const res = await deleteCategoryAction(deletingCategory.id);
      if (res.success) {
        setCategories((prev) => prev.filter((c) => c.id !== deletingCategory.id));
        showToast(`Category "${deletingCategory.name}" removed`);
        setDeletingCategory(null);
        router.refresh();
      } else {
        alert(res.error || 'Failed to delete category');
      }
    } catch (err: any) {
      console.error(err);
      alert('Error deleting category: ' + (err?.message || 'Network error'));
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter categories by search
  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Map product counts
  const getProductCount = (categoryId: string, categorySlug: string) => {
    return products.filter(
      (p) =>
        p.category_id === categoryId ||
        p.category_name?.toLowerCase() === categorySlug.toLowerCase()
    ).length;
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1A1A1A] text-white px-5 py-3 rounded-xs shadow-xl border border-neutral-700 flex items-center gap-2.5 animate-fade-in-up text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-[#FF55D2]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-white border border-neutral-200 text-[10px] uppercase tracking-widest text-[#FF55D2] font-semibold mb-1.5 rounded-xs">
            <Tag className="w-3 h-3" />
            <span>Store Taxonomy</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#1A1A1A] font-light">
            Garment Categories
          </h1>
          <p className="text-xs text-neutral-500 font-light mt-0.5">
            Manage your boutique style categories for product tagging, filters, and homepage discovery.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#FF55D2] hover:bg-[#FD00B9] text-white text-xs uppercase tracking-wider font-semibold shadow-xs transition-colors rounded-xs active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Overview Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6">
        <div className="bg-white border border-neutral-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[10px] uppercase tracking-widest font-semibold">Total Categories</span>
            <Tag className="w-4 h-4 text-[#FF55D2]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#1A1A1A]">
            {categories.length}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Active garment styles</p>
        </div>

        <div className="bg-white border border-neutral-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[10px] uppercase tracking-widest font-semibold">Assigned Garments</span>
            <Package className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#1A1A1A]">
            {products.filter((p) => p.category_id).length}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Total catalog inventory</p>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white border border-neutral-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[10px] uppercase tracking-widest font-semibold">Shop Navigation</span>
            <ExternalLink className="w-4 h-4 text-[#1A1A1A]" />
          </div>
          <div className="text-xs text-neutral-700 mt-1">
            Categories power the filter tabs in the store and homepage cards.
          </div>
          <Link
            href="/shop"
            target="_blank"
            className="text-[11px] text-[#FF55D2] hover:underline mt-2 inline-flex items-center gap-1 font-medium"
          >
            <span>Preview live shop filters</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search categories by name or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-neutral-300 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF55D2] rounded-xs shadow-2xs"
          />
        </div>
      </div>

      {/* Categories Grid / Table */}
      <div className="bg-white border border-neutral-200 rounded-xs overflow-hidden shadow-xs">
        {filteredCategories.length === 0 ? (
          <div className="p-12 text-center text-neutral-500 space-y-3">
            <Tag className="w-8 h-8 mx-auto text-neutral-300" />
            <p className="text-sm font-light">No categories match your search criteria.</p>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1A1A1A] text-white text-xs uppercase tracking-wider font-semibold rounded-xs hover:bg-[#FF55D2] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Category</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4 sm:px-6">Category</th>
                  <th className="py-3.5 px-4 hidden md:table-cell">Slug</th>
                  <th className="py-3.5 px-4 hidden sm:table-cell">Description</th>
                  <th className="py-3.5 px-4 text-center">Garments</th>
                  <th className="py-3.5 px-4 text-center">Order</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredCategories.map((category) => {
                  const count = getProductCount(category.id, category.slug);
                  return (
                    <tr
                      key={category.id}
                      className="hover:bg-neutral-50/70 transition-colors group"
                    >
                      {/* Category Identity with Thumbnail */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-14 sm:w-14 sm:h-16 bg-neutral-100 border border-neutral-200 rounded-xs overflow-hidden shrink-0">
                            {category.image_url ? (
                              <Image
                                src={category.image_url}
                                alt={category.name}
                                fill
                                sizes="56px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-50 text-[#FF55D2]">
                                <Tag className="w-5 h-5 opacity-40" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-serif text-base sm:text-lg font-medium text-[#1A1A1A] group-hover:text-[#FF55D2] transition-colors truncate">
                              {category.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5 md:hidden">
                              <span className="text-[10px] font-mono text-neutral-400">
                                /{category.slug}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Slug */}
                      <td className="py-4 px-4 font-mono text-[11px] text-neutral-500 hidden md:table-cell">
                        <span className="bg-neutral-100 px-2 py-0.5 rounded-xs border border-neutral-200">
                          {category.slug}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="py-4 px-4 text-neutral-600 max-w-xs truncate hidden sm:table-cell">
                        {category.description || (
                          <span className="italic text-neutral-400">No description provided</span>
                        )}
                      </td>

                      {/* Product Count */}
                      <td className="py-4 px-4 text-center">
                        <Link
                          href={`/shop?category=${category.slug}`}
                          target="_blank"
                          title="View category in store"
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-100 hover:bg-[#FF55D2]/10 hover:text-[#FF55D2] text-neutral-700 text-xs font-semibold rounded-xs transition-colors"
                        >
                          <span>{count}</span>
                          <span className="hidden sm:inline font-light text-[10px]">
                            {count === 1 ? 'piece' : 'pieces'}
                          </span>
                        </Link>
                      </td>

                      {/* Display Order */}
                      <td className="py-4 px-4 text-center font-mono text-xs text-neutral-600">
                        {category.display_order ?? 1}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Link
                            href={`/shop?category=${category.slug}`}
                            target="_blank"
                            title="View in Store"
                            className="p-1.5 text-neutral-400 hover:text-[#FF55D2] transition-colors rounded-xs"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(category)}
                            title="Edit Category"
                            className="p-1.5 text-neutral-500 hover:text-[#1A1A1A] hover:bg-neutral-100 rounded-xs transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingCategory(category)}
                            title="Delete Category"
                            className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-xs transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Category Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-neutral-200 w-full max-w-lg rounded-xs shadow-2xl overflow-hidden animate-fade-in-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#FF55D2]" />
                <h3 className="font-serif text-lg font-medium text-[#1A1A1A]">
                  {editingCategory ? `Edit: ${editingCategory.name}` : 'Add New Category'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="text-neutral-400 hover:text-black p-1 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-800 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Abayas & Modest Wear"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 text-xs text-[#1A1A1A] focus:bg-white focus:outline-none focus:border-[#FF55D2] rounded-xs"
                />
              </div>

              {/* Slug */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-800">
                    URL Slug *
                  </label>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    /shop?category={slug || '...'}
                  </span>
                </div>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setSlugManuallyEdited(true);
                  }}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 text-xs font-mono text-[#1A1A1A] focus:bg-white focus:outline-none focus:border-[#FF55D2] rounded-xs"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-800 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Artisanal silhouettes crafted with bespoke embroidery and timeless cuts..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 text-xs text-[#1A1A1A] focus:bg-white focus:outline-none focus:border-[#FF55D2] rounded-xs"
                />
              </div>

              {/* Image URL / Selection */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-800 mb-1">
                  Category Image
                </label>

                {/* Preset Suggestions */}
                <div className="mb-2">
                  <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block mb-1">
                    Or select a curated atelier texture:
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {PRESET_CATEGORY_IMAGES.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setImageUrl(preset.url)}
                        className={`text-left p-1.5 border rounded-xs transition-all flex items-center gap-1.5 ${
                          imageUrl === preset.url
                            ? 'border-[#FF55D2] bg-[#FAF0F8] text-[#FF55D2]'
                            : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                        }`}
                      >
                        <div className="relative w-6 h-6 rounded-2xs overflow-hidden shrink-0">
                          <Image
                            src={preset.url}
                            alt={preset.label}
                            fill
                            sizes="24px"
                            className="object-cover"
                          />
                        </div>
                        <span className="text-[9px] font-medium truncate leading-tight">
                          {preset.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Direct Upload / URL */}
                <ImageUpload
                  value={imageUrl}
                  onChange={setImageUrl}
                  label="Upload Category Image"
                />
              </div>

              {/* Display Order */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-800 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  min={1}
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(Number(e.target.value))}
                  className="w-24 px-3.5 py-2 bg-neutral-50 border border-neutral-300 text-xs text-[#1A1A1A] focus:bg-white focus:outline-none focus:border-[#FF55D2] rounded-xs"
                />
                <span className="text-[10px] text-neutral-400 ml-2">
                  Lower numbers appear first in filter tabs.
                </span>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 rounded-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || !name.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-[#FF55D2] hover:bg-[#FD00B9] disabled:opacity-50 text-white text-xs uppercase tracking-wider font-semibold rounded-xs shadow-xs transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-neutral-200 w-full max-w-md rounded-xs shadow-2xl p-6 space-y-4 animate-fade-in-up">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2 bg-red-50 rounded-xs">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-medium text-neutral-900">
                Delete Category?
              </h3>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed">
              Are you sure you want to delete <strong>&ldquo;{deletingCategory.name}&rdquo;</strong>?
            </p>

            {getProductCount(deletingCategory.id, deletingCategory.slug) > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xs">
                <strong>Notice:</strong> {getProductCount(deletingCategory.id, deletingCategory.slug)} garments are currently assigned to this category. Deleting this category will unlink them (they will remain in your store unassigned).
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingCategory(null)}
                disabled={isDeleting}
                className="px-4 py-2 border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 rounded-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs uppercase tracking-wider font-semibold rounded-xs transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Category'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
