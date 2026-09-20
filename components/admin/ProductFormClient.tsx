'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Product, Category, Collection, ProductVariant, SizeChart } from '@/lib/types';
import { saveProductAction, saveCategoryAction } from '@/app/actions/store';
import { ArrowLeft, Save, Plus, Trash2, CheckCircle2, Sparkles, AlertCircle, Tag, X } from 'lucide-react';
import ImageUpload from './ImageUpload';

interface ProductFormClientProps {
  initialProduct?: Product | null;
  existingProducts?: Product[];
  categories: Category[];
  collections: Collection[];
  sizeCharts?: SizeChart[];
}

import { generateUniqueProductCode } from '@/lib/utils/product-code';

export default function ProductFormClient({
  initialProduct,
  existingProducts = [],
  categories,
  collections,
  sizeCharts = [],
}: ProductFormClientProps) {
  const router = useRouter();
  const isEditing = !!initialProduct;

  const [categoriesList, setCategoriesList] = useState<Category[]>(categories);
  const [name, setName] = useState(initialProduct?.name || '');
  const [categoryId, setCategoryId] = useState(
    initialProduct?.category_id || categories[0]?.id || ''
  );

  useEffect(() => {
    setCategoriesList(categories);
  }, [categories]);

  // Quick Add Category Modal State
  const [isQuickAddCatOpen, setIsQuickAddCatOpen] = useState(false);
  const [quickCatName, setQuickCatName] = useState('');
  const [quickCatSlug, setQuickCatSlug] = useState('');
  const [quickCatDesc, setQuickCatDesc] = useState('');
  const [isSavingQuickCat, setIsSavingQuickCat] = useState(false);
  const [quickCatError, setQuickCatError] = useState('');

  // Track if admin manually edited the product code
  const [isCustomCodeEdited, setIsCustomCodeEdited] = useState(
    () => isEditing && !!initialProduct?.product_code
  );

  const [productCode, setProductCode] = useState(() => {
    if (initialProduct?.product_code) return initialProduct.product_code;
    return generateUniqueProductCode({
      productName: initialProduct?.name || '',
      categoryId: initialProduct?.category_id || categories[0]?.id,
      categories,
      existingProducts,
      currentProductId: initialProduct?.id,
    });
  });

  const handleNameChange = (newName: string) => {
    setName(newName);
    if (!isCustomCodeEdited) {
      const autoCode = generateUniqueProductCode({
        productName: newName,
        categoryId,
        categories: categoriesList,
        existingProducts,
        currentProductId: initialProduct?.id,
      });
      setProductCode(autoCode);
    }
  };

  const handleCategoryChange = (newCatId: string) => {
    setCategoryId(newCatId);
    if (!isCustomCodeEdited) {
      const autoCode = generateUniqueProductCode({
        productName: name,
        categoryId: newCatId,
        categories: categoriesList,
        existingProducts,
        currentProductId: initialProduct?.id,
      });
      setProductCode(autoCode);
    }
  };

  const handleRegenerateCode = () => {
    setIsCustomCodeEdited(false);
    const newCode = generateUniqueProductCode({
      productName: name,
      categoryId,
      categories: categoriesList,
      existingProducts,
      currentProductId: initialProduct?.id,
    });
    setProductCode(newCode);
  };

  const handleQuickAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCatName.trim()) return;

    setIsSavingQuickCat(true);
    setQuickCatError('');

    const cleanSlug =
      quickCatSlug.trim() ||
      quickCatName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    try {
      const res = await saveCategoryAction({
        name: quickCatName.trim(),
        slug: cleanSlug,
        description: quickCatDesc.trim(),
        display_order: categoriesList.length + 1,
      });

      if (res.success && res.category) {
        const newCat = res.category;
        const updatedCats = [...categoriesList, newCat];
        setCategoriesList(updatedCats);
        setCategoryId(newCat.id);

        // Update product code with newly created category
        if (!isCustomCodeEdited) {
          const autoCode = generateUniqueProductCode({
            productName: name,
            categoryId: newCat.id,
            categories: updatedCats,
            existingProducts,
            currentProductId: initialProduct?.id,
          });
          setProductCode(autoCode);
        }

        setIsQuickAddCatOpen(false);
        setQuickCatName('');
        setQuickCatSlug('');
        setQuickCatDesc('');
      } else {
        setQuickCatError(res.error || 'Failed to create category');
      }
    } catch (err: any) {
      setQuickCatError(err?.message || 'Error creating category');
    } finally {
      setIsSavingQuickCat(false);
    }
  };
  const [price, setPrice] = useState<string | number>(
    initialProduct?.price !== undefined ? initialProduct.price : 15000
  );
  const [deliveryFee, setDeliveryFee] = useState<string | number>(
    initialProduct?.delivery_fee !== undefined ? initialProduct.delivery_fee : 0
  );
  const [sizeChartId, setSizeChartId] = useState(initialProduct?.size_chart_id || '');
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

  // Keep state synchronized whenever initialProduct prop changes
  useEffect(() => {
    if (initialProduct) {
      setName(initialProduct.name || '');
      setProductCode(initialProduct.product_code || '');
      setPrice(initialProduct.price !== undefined ? initialProduct.price : 15000);
      setDeliveryFee(initialProduct.delivery_fee !== undefined ? initialProduct.delivery_fee : 0);
      setSizeChartId(initialProduct.size_chart_id || '');
      setCategoryId(initialProduct.category_id || categories[0]?.id || '');
      setCollectionId(initialProduct.collection_id || '');
      setDescription(initialProduct.description || '');
      setFabric(initialProduct.fabric || '');
      setCareInstructions(initialProduct.care_instructions || '');
      setIsPublished(initialProduct.is_published ?? true);
      if (initialProduct.images && Array.isArray(initialProduct.images) && initialProduct.images.length > 0) {
        setImages(initialProduct.images);
      }
      if (initialProduct.variants && initialProduct.variants.length > 0) {
        setVariants(initialProduct.variants);
      }
    }
  }, [initialProduct, categories]);

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

    const parsedPrice = typeof price === 'string' ? parseFloat(price) || 0 : (price ?? 0);
    const parsedDeliveryFee = typeof deliveryFee === 'string' ? parseFloat(deliveryFee) || 0 : (deliveryFee ?? 0);

    const payload: Partial<Product> = {
      id: initialProduct?.id,
      name,
      product_code: productCode.trim(),
      price: parsedPrice,
      delivery_fee: parsedDeliveryFee,
      size_chart_id: sizeChartId || undefined,
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
      const res = await saveProductAction(payload);
      if (!res.success) {
        alert(`Could not save product: ${res.error}\n\nIf you are using Supabase, please ensure you ran the updated supabase/schema.sql in your Supabase SQL Editor.`);
        setIsSaving(false);
        return;
      }
      setSavedSuccess(true);
      setTimeout(() => {
        router.push('/admin/products');
        router.refresh();
      }, 600);
    } catch (err: any) {
      console.error('Save product error:', err);
      alert(`Could not save product: ${err?.message || 'Network error'}`);
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
              {isEditing ? `Edit: ${initialProduct.name}` : 'Add New Product'}
            </h1>
            <p className="text-xs text-neutral-500 font-light mt-0.5">
              Fill in product details, price, delivery, and size stock.
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
              <span>{isSaving ? 'Saving...' : 'Save Product'}</span>
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
              Product Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Crimson Silk Saree"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
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
                onClick={handleRegenerateCode}
                className="text-[11px] text-[#FF55D2] hover:text-[#FD00B9] font-medium flex items-center gap-1 transition-colors active:scale-95 cursor-pointer"
                title="Auto-generate collision-free unique ID from Name + Category + Number"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Auto-Generate ID</span>
              </button>
            </div>
            <input
              type="text"
              required
              placeholder="e.g. FF-SAR-CHKS-001"
              value={productCode}
              onChange={(e) => {
                setIsCustomCodeEdited(true);
                setProductCode(e.target.value.toUpperCase().replace(/\s+/g, ''));
              }}
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
                  <em>{duplicateProduct?.name}</em>. Product IDs must be unique for catalog and order tracking.
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between text-[11px] mt-1.5">
                {!isCustomCodeEdited ? (
                  <span className="text-emerald-700 font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#FF55D2]" />
                    <span>Auto-syncing: [FF]-[Category]-[Name]-[#]</span>
                  </span>
                ) : (
                  <span className="text-neutral-500 flex items-center gap-1">
                    Custom ID •{' '}
                    <button
                      type="button"
                      onClick={handleRegenerateCode}
                      className="text-[#FF55D2] hover:underline font-semibold cursor-pointer"
                    >
                      Re-sync with Name
                    </button>
                  </span>
                )}
                <span className="text-neutral-400 font-mono text-[10px]">Zero replication</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Price */}
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-800 mb-1.5">
              Product Price (Rs.) *
            </label>
            <input
              type="number"
              required
              min={0}
              step="any"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 text-xs text-[#1A1A1A] focus:bg-white focus:outline-none focus:border-[#FF55D2] rounded-xs font-medium"
              placeholder="e.g. 15000"
            />
          </div>

          {/* Delivery Fee */}
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-800 mb-1.5">
              Delivery Fee (Rs.)
            </label>
            <input
              type="number"
              min={0}
              step="any"
              value={deliveryFee}
              onChange={(e) => setDeliveryFee(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 text-xs text-[#1A1A1A] focus:bg-white focus:outline-none focus:border-[#FF55D2] rounded-xs font-medium"
              placeholder="0 for free delivery"
            />
          </div>

          {/* Category */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-800">
                Category *
              </label>
              <button
                type="button"
                onClick={() => setIsQuickAddCatOpen(true)}
                className="text-[11px] text-[#FF55D2] hover:text-[#FD00B9] font-semibold inline-flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>New Category</span>
              </button>
            </div>
            <select
              value={categoryId}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 text-xs text-[#1A1A1A] focus:bg-white focus:outline-none focus:border-[#FF55D2] rounded-xs"
            >
              {categoriesList.map((cat) => (
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

        {/* Size Chart Selector */}
        <div className="pt-2 border-t border-neutral-100">
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-800">
              Size Chart Guide
            </label>
            <Link
              href="/admin/size-charts"
              target="_blank"
              className="text-[11px] text-[#FF55D2] hover:underline font-semibold"
            >
              Manage Size Charts →
            </Link>
          </div>
          <select
            value={sizeChartId}
            onChange={(e) => setSizeChartId(e.target.value)}
            className="w-full sm:max-w-md px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 text-xs text-[#1A1A1A] focus:bg-white focus:outline-none focus:border-[#FF55D2] rounded-xs"
          >
            <option value="">Standard Boutique Size Chart (Default)</option>
            {sizeCharts.map((chart) => (
              <option key={chart.id} value={chart.id}>
                {chart.name} ({chart.unit})
              </option>
            ))}
          </select>
          <p className="text-[11px] text-neutral-400 mt-1">
            Customers viewing this product will see this measurement table when they click "Size Guide".
          </p>
        </div>

        {/* Product Photos */}
        <ImageUpload
          multiple={true}
          values={images}
          onMultiChange={setImages}
          label="Product Photos"
          helperText="Upload photos from your phone or computer. The first photo will be used as the main cover."
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
            placeholder="Describe the fabric, fit, design, and styling tips..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 text-xs text-[#1A1A1A] focus:bg-white focus:outline-none focus:border-[#FF55D2] rounded-xs"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Fabric */}
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-800 mb-1.5">
              Fabric
            </label>
            <input
              type="text"
              placeholder="e.g. Pure Silk, Georgette, Cotton"
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

      {/* Quick Add Category Modal */}
      {isQuickAddCatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-neutral-200 w-full max-w-md rounded-xs shadow-2xl p-6 space-y-4 animate-fade-in-up">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#FF55D2]" />
                <h3 className="font-serif text-lg font-medium text-neutral-900">
                  Quick Add Category
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickAddCatOpen(false)}
                className="text-neutral-400 hover:text-neutral-800 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {quickCatError && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xs">
                {quickCatError}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-800 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Abayas & Kaftans"
                  value={quickCatName}
                  onChange={(e) => {
                    setQuickCatName(e.target.value);
                    setQuickCatSlug(
                      e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/(^-|-$)/g, '')
                    );
                  }}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 text-xs text-[#1A1A1A] focus:bg-white focus:outline-none focus:border-[#FF55D2] rounded-xs"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-800 mb-1">
                  URL Slug
                </label>
                <input
                  type="text"
                  value={quickCatSlug}
                  onChange={(e) => setQuickCatSlug(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 text-xs font-mono text-[#1A1A1A] focus:bg-white focus:outline-none focus:border-[#FF55D2] rounded-xs"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-800 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief description of this style..."
                  value={quickCatDesc}
                  onChange={(e) => setQuickCatDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 text-xs text-[#1A1A1A] focus:bg-white focus:outline-none focus:border-[#FF55D2] rounded-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-200">
              <button
                type="button"
                onClick={() => setIsQuickAddCatOpen(false)}
                disabled={isSavingQuickCat}
                className="px-3.5 py-1.5 border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 rounded-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleQuickAddCategory}
                disabled={isSavingQuickCat || !quickCatName.trim()}
                className="px-4 py-1.5 bg-[#FF55D2] hover:bg-[#FD00B9] text-white text-xs uppercase tracking-wider font-semibold rounded-xs shadow-xs disabled:opacity-50"
              >
                {isSavingQuickCat ? 'Saving...' : 'Add & Select'}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
