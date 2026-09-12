'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Product, Category, Collection, ProductVariant } from '@/lib/types';
import { saveProductAction } from '@/app/actions/store';
import { ArrowLeft, Save, Plus, Trash2, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';
import ImageUpload from './ImageUpload';

interface ProductFormClientProps {
  initialProduct?: Product | null;
  existingProducts?: Product[];
  categories: Category[];
  collections: Collection[];
}

function generateUniqueBoutiqueCode(
  existingList: Product[],
  currentCatId?: string,
  categoriesList: Category[] = []
): string {
  const usedCodes = new Set(
    (existingList || [])
      .map((p) => (p.product_code || '').trim().toUpperCase())
      .filter(Boolean)
  );

  let prefix = 'FF-PRD';
  const cat = categoriesList.find((c) => c.id === currentCatId);
  if (cat) {
    const slug = (cat.slug || cat.name || '').toLowerCase();
    if (slug.includes('saree')) prefix = 'FF-SR';
    else if (slug.includes('dress')) prefix = 'FF-DR';
    else if (slug.includes('blouse') || slug.includes('top')) prefix = 'FF-BL';
    else if (slug.includes('lehenga')) prefix = 'FF-LH';
    else prefix = 'FF-AT';
  }

  for (let i = 1; i <= 999; i++) {
    const candidate = `${prefix}-${String(i).padStart(3, '0')}`;
    if (!usedCodes.has(candidate)) {
      return candidate;
    }
  }
  return `${prefix}-${Math.floor(100 + Math.random() * 900)}`;
}

export default function ProductFormClient({
  initialProduct,
  existingProducts = [],
  categories,
  collections,
}: ProductFormClientProps) {
  const router = useRouter();
  const isEditing = !!initialProduct;

  const [name, setName] = useState(initialProduct?.name || '');
  const [categoryId, setCategoryId] = useState(
    initialProduct?.category_id || categories[0]?.id || ''
  );
  const [productCode, setProductCode] = useState(() => {
    if (initialProduct?.product_code) return initialProduct.product_code;
    return generateUniqueBoutiqueCode(
      existingProducts || [],
      initialProduct?.category_id || categories[0]?.id,
      categories
    );
  });
  const [price, setPrice] = useState(initialProduct?.price || 15000);
  const [collectionId, setCollectionId] = useState(initialProduct?.collection_id || '');
  const [description, setDescription] = useState(initialProduct?.description || '');
  const [fabric, setFabric] = useState(initialProduct?.fabric || '');
  const [careInstructions, setCareInstructions] = useState(initialProduct?.care_instructions || '');
  const [isPublished, setIsPublished] = useState(initialProduct?.is_published ?? true);
  const [images, setImages] = useState<string[]>(() => {
    if (initialProduct?.images && Array.isArray(initialProduct.images) && initialProduct.images.length > 0) {
      return initialProduct.images;
    }
    return [];
  });

  // Variants management
  const [variants, setVariants] = useState<ProductVariant[]>(
    initialProduct?.variants || [
      { id: 'v-s', product_id: '', size: 'S', stock_quantity: 2 },
      { id: 'v-m', product_id: '', size: 'M', stock_quantity: 3 },
      { id: 'v-l', product_id: '', size: 'L', stock_quantity: 1 },
      { id: 'v-xl', product_id: '', size: 'XL', stock_quantity: 1 },
    ]
  );

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Duplicate product code check across catalog
  const duplicateProduct = existingProducts.find(
    (p) =>
      p.id !== initialProduct?.id &&
      p.product_code &&
      p.product_code.trim().toUpperCase() === productCode.trim().toUpperCase()
  );
  const hasDuplicateCode = !!duplicateProduct && productCode.trim().length > 0;

  const updateVariantStock = (index: number, stock: number) => {
    setVariants((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], stock_quantity: Math.max(0, stock) };
      return next;
    });
  };

  const addCustomSize = () => {
    const sizeName = prompt('Enter size name (e.g. Free Size, XXL, 38):');
    if (sizeName) {
      setVariants((prev) => [
        ...prev,
        { id: `v-${Date.now()}`, product_id: '', size: sizeName, stock_quantity: 1 },
      ]);
    }
  };

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hasDuplicateCode || !productCode.trim()) {
      alert('Please resolve duplicate or missing Product ID before saving.');
      return;
    }
    setIsSaving(true);

    const category = categories.find((c) => c.id === categoryId);
    const collection = collections.find((c) => c.id === collectionId);

    const sanitizedVariants = variants.map((v) => ({
      ...v,
      sku: v.sku || (productCode ? `${productCode}-${v.size.replace(/\s+/g, '')}` : undefined),
    }));

    const payload: Partial<Product> = {
      id: initialProduct?.id,
      name,
      product_code: productCode.trim(),
      price: Number(price),
      category_id: categoryId || undefined,
      category_name: category?.name,
      collection_id: collectionId || undefined,
      collection_name: collection?.name,
      description,
      fabric,
      care_instructions: careInstructions,
      is_published: isPublished,
      images: images.length > 0 ? images : [
        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800'
      ],
      variants: sanitizedVariants,
    };

    try {
      await saveProductAction(payload);
      setSavedSuccess(true);
      setTimeout(() => {
        router.push('/admin/products');
        router.refresh();
      }, 600);
    } catch (err: any) {
      console.error('Save product error:', err);
      alert(`Could not save product: ${err?.message || 'Database error'}. If you are using Supabase, ensure the latest schema.sql has been executed.`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl pb-24 sm:pb-0">
      {/* Form Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 text-neutral-500 hover:text-black border border-neutral-200 bg-white shrink-0 active:scale-90 rounded-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0">
            <h1 className="font-serif text-2xl sm:text-3xl text-[#1A1A1A] font-light truncate">
              {isEditing ? `Edit: ${initialProduct.name}` : 'Add Ready-to-Wear Piece'}
            </h1>
            <p className="text-xs text-neutral-500 font-light mt-0.5">
              Fill in product information and configure stock per size.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving || hasDuplicateCode || !productCode.trim()}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#FF55D2] hover:bg-[#FD00B9] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs uppercase tracking-wider font-semibold shadow-xs transition-colors rounded-xs active:scale-95"
        >
          {savedSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Garment'}</span>
            </>
          )}
        </button>
      </div>

      {/* Main Form Fields */}
      <div className="bg-white border border-neutral-200 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-800 mb-1.5">
              Garment Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Crimson Heritage Kanjivaram Saree"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 text-xs text-[#1A1A1A] focus:bg-white focus:outline-none focus:border-[#FF55D2] rounded-xs"
            />
          </div>

          {/* Product Code / Unique ID */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-800">
                Product ID / SKU *
              </label>
              <button
                type="button"
                onClick={() => {
                  const newCode = generateUniqueBoutiqueCode(
                    existingProducts || [],
                    categoryId,
                    categories
                  );
                  setProductCode(newCode);
                }}
                className="text-[11px] text-[#FF55D2] hover:text-[#FD00B9] font-medium flex items-center gap-1 transition-colors active:scale-95"
                title="Generate another collision-free unique ID"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Unique ID</span>
              </button>
            </div>
            <input
              type="text"
              required
              placeholder="e.g. FF-SR-001"
              value={productCode}
              onChange={(e) => setProductCode(e.target.value.toUpperCase().replace(/\s+/g, ''))}
              className={`w-full px-3.5 py-2.5 bg-neutral-50 border text-xs text-[#1A1A1A] focus:bg-white focus:outline-none rounded-xs font-mono font-semibold tracking-wider ${
                hasDuplicateCode
                  ? 'border-red-500 focus:border-red-500 ring-1 ring-red-500/20'
                  : 'border-neutral-300 focus:border-[#FF55D2]'
              }`}
            />
            {hasDuplicateCode ? (
              <div className="mt-1.5 p-2 bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-1.5 rounded-xs animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Duplicate ID:</strong> &quot;{productCode}&quot; is already in use by{' '}
                  <em>{duplicateProduct?.name}</em>. Product IDs must be unique for WhatsApp order tracking.
                </span>
              </div>
            ) : (
              <p className="text-[11px] text-neutral-400 mt-1">
                Unique identifier automatically delivered to your WhatsApp when customers place an order.
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Price */}
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-800 mb-1.5">
              Price (LKR / Rs.) *
            </label>
            <input
              type="number"
              required
              min={0}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 text-xs text-[#1A1A1A] focus:bg-white focus:outline-none focus:border-[#FF55D2] rounded-xs"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-800 mb-1.5">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 text-xs text-[#1A1A1A] focus:bg-white focus:outline-none focus:border-[#FF55D2] rounded-xs"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Collection */}
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-800 mb-1.5">
              Collection (Optional)
            </label>
            <select
              value={collectionId}
              onChange={(e) => setCollectionId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 text-xs text-[#1A1A1A] focus:bg-white focus:outline-none focus:border-[#FF55D2] rounded-xs"
            >
              <option value="">No Collection</option>
              {collections.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Photography & Lookbook Gallery */}
        <ImageUpload
          multiple={true}
          values={images}
          onMultiChange={setImages}
          label="Piece Photography & Lookbook Gallery"
          helperText="Upload photos directly from your phone camera or device. Photos are automatically compressed to WebP (up to 95% smaller) before uploading. The first photo acts as the primary catalog cover."
          aspectRatio="aspect-[3/4]"
          maxWidth={1600}
          maxHeight={2000}
        />

        {/* Description */}
        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-800 mb-1.5">
            Description
          </label>
          <textarea
            rows={3}
            placeholder="Artisanal details, weave specifications, silhouette characteristics..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 text-xs text-[#1A1A1A] focus:bg-white focus:outline-none focus:border-[#FF55D2] rounded-xs"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Fabric */}
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-800 mb-1.5">
              Fabric Composition
            </label>
            <input
              type="text"
              placeholder="e.g. 100% Pure Mulberry Silk with Gold Zari"
              value={fabric}
              onChange={(e) => setFabric(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 text-xs text-[#1A1A1A] focus:bg-white focus:outline-none focus:border-[#FF55D2] rounded-xs"
            />
          </div>

          {/* Care */}
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-800 mb-1.5">
              Care Instructions
            </label>
            <input
              type="text"
              placeholder="e.g. Dry clean only. Store in muslin wrap."
              value={careInstructions}
              onChange={(e) => setCareInstructions(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 text-xs text-[#1A1A1A] focus:bg-white focus:outline-none focus:border-[#FF55D2] rounded-xs"
            />
          </div>
        </div>

        {/* Size & Inventory Matrix */}
        <div className="pt-6 border-t border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs uppercase tracking-wider font-semibold text-neutral-900">
                Size & Stock Matrix
              </h3>
              <p className="text-[11px] text-neutral-500 font-light">
                Out of stock variants (0) are automatically disabled on the storefront.
              </p>
            </div>
            <button
              type="button"
              onClick={addCustomSize}
              className="min-h-[36px] text-xs text-[#FF55D2] font-semibold hover:underline flex items-center gap-1.5 active:scale-95 px-2 py-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Another Size</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {variants.map((v, idx) => (
              <div key={idx} className="p-3 bg-neutral-50 border border-neutral-200 flex flex-col justify-between rounded-xs">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-neutral-800">{v.size}</span>
                  <button
                    type="button"
                    onClick={() => removeVariant(idx)}
                    className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-red-500 active:scale-90 transition-transform"
                    title="Remove size"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-neutral-400 mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={v.stock_quantity}
                    onChange={(e) => updateVariantStock(idx, Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-neutral-300 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF55D2] rounded-xs"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Publish Status */}
        <div className="pt-4 border-t border-neutral-200 flex items-center gap-3">
          <input
            type="checkbox"
            id="published"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="w-4 h-4 rounded-xs border-neutral-300 text-[#FF55D2] focus:ring-[#FF55D2]"
          />
          <label htmlFor="published" className="text-xs font-medium text-neutral-800 cursor-pointer select-none">
            Publish this piece on the live storefront
          </label>
        </div>
      </div>

      {/* Sticky Bottom Action Bar for Mobile Viewports */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-neutral-200 z-30 shadow-lg flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span className="text-[11px] uppercase tracking-wider text-neutral-400 block font-semibold">
            {isEditing ? 'Editing' : 'New Piece'}
          </span>
          <span className="text-xs font-sans font-medium text-[#1A1A1A] truncate block">
            {name || 'Untitled Garment'}
          </span>
        </div>
        <button
          type="submit"
          disabled={isSaving || hasDuplicateCode || !productCode.trim()}
          className="min-h-[44px] px-5 bg-[#FF55D2] hover:bg-[#FD00B9] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs uppercase tracking-wider font-semibold shadow-xs transition-colors rounded-xs active:scale-95 flex items-center gap-2 shrink-0"
        >
          {savedSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Garment'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
