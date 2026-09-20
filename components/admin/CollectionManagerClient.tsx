'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Collection } from '@/lib/types';
import {
  Plus,
  Eye,
  EyeOff,
  Layers,
  ExternalLink,
  Edit2,
  Trash2,
  CheckCircle2,
  Sparkles,
  Image as ImageIcon,
  Globe,
  Save,
  X,
  ArrowRight,
} from 'lucide-react';
import { saveCollectionAction, deleteCollectionAction } from '@/app/actions/store';
import ImageUpload from './ImageUpload';

interface CollectionManagerClientProps {
  initialCollections: Collection[];
}

const PRESET_BANNER_IMAGES = [
  {
    label: 'Crimson Silk Zari',
    url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=1200',
  },
  {
    label: 'Festive Emerald Velvet',
    url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=1200',
  },
  {
    label: 'Bridal Kanjivaram',
    url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1200',
  },
  {
    label: 'Pastel Organza',
    url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=1200',
  },
];

export default function CollectionManagerClient({
  initialCollections,
}: CollectionManagerClientProps) {
  const router = useRouter();
  const [collections, setCollections] = useState<Collection[]>(initialCollections);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);

  useEffect(() => {
    setCollections(initialCollections);
  }, [initialCollections]);

  // Form Fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showOnHome, setShowOnHome] = useState(true);
  const [hasDedicatedPage, setHasDedicatedPage] = useState(true);
  const [isPublished, setIsPublished] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(1);

  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Open form for creating new collection
  const handleOpenCreate = () => {
    setEditingCollection(null);
    setName('');
    setSlug('');
    setSlugManuallyEdited(false);
    setDescription('');
    setImageUrl('https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=1200');
    setShowOnHome(true);
    setHasDedicatedPage(true);
    setIsPublished(true);
    setDisplayOrder(collections.length + 1);
    setIsFormOpen(true);
  };

  // Open form for editing existing collection
  const handleOpenEdit = (col: Collection) => {
    setEditingCollection(col);
    setName(col.name);
    setSlug(col.slug);
    setSlugManuallyEdited(true);
    setDescription(col.description || '');
    setImageUrl(col.image_url || '');
    setShowOnHome(col.show_on_home ?? true);
    setHasDedicatedPage(col.has_dedicated_page ?? true);
    setIsPublished(col.is_published ?? true);
    setDisplayOrder(col.display_order ?? 1);
    setIsFormOpen(true);

    // Smooth scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Close form
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCollection(null);
  };

  // Auto-generate slug when typing name (if slug hasn't been manually typed)
  const handleNameChange = (val: string) => {
    setName(val);
    if (!slugManuallyEdited) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  const handleSlugChange = (val: string) => {
    setSlugManuallyEdited(true);
    setSlug(val.toLowerCase().replace(/[^a-z0-9-]+/g, ''));
  };

  // Toggle Featured on Home directly from card
  const handleToggleHome = async (id: string) => {
    const target = collections.find((c) => c.id === id);
    if (target) {
      const updated = { ...target, show_on_home: !target.show_on_home };
      setCollections((prev) => prev.map((c) => (c.id === id ? updated : c)));
      try {
        const res = await saveCollectionAction(updated);
        if (!res.success) {
          setCollections((prev) => prev.map((c) => (c.id === id ? target : c)));
          alert(`Failed to update collection: ${res.error}`);
          return;
        }
        router.refresh();
        showToast(`Collection "${target.name}" ${!target.show_on_home ? 'featured on' : 'hidden from'} homepage.`);
      } catch (err: any) {
        setCollections((prev) => prev.map((c) => (c.id === id ? target : c)));
        alert(`Failed to update collection: ${err?.message || 'Database error'}`);
      }
    }
  };

  // Toggle Published status directly from card
  const handleTogglePublished = async (id: string) => {
    const target = collections.find((c) => c.id === id);
    if (target) {
      const updated = { ...target, is_published: !target.is_published };
      setCollections((prev) => prev.map((c) => (c.id === id ? updated : c)));
      try {
        const res = await saveCollectionAction(updated);
        if (!res.success) {
          setCollections((prev) => prev.map((c) => (c.id === id ? target : c)));
          alert(`Failed to update collection: ${res.error}`);
          return;
        }
        router.refresh();
        showToast(`Collection "${target.name}" set to ${!target.is_published ? 'Published' : 'Draft'}.`);
      } catch (err: any) {
        setCollections((prev) => prev.map((c) => (c.id === id ? target : c)));
        alert(`Failed to update collection: ${err?.message || 'Database error'}`);
      }
    }
  };

  // Delete collection
  const handleDelete = async (col: Collection) => {
    if (!confirm(`Are you sure you want to delete "${col.name}"? Products in this collection will remain safe in your catalog.`)) {
      return;
    }

    setDeletingId(col.id);
    try {
      const res = await deleteCollectionAction(col.id);
      if (!res.success) {
        alert(`Could not delete collection: ${res.error}`);
        return;
      }
      setCollections((prev) => prev.filter((c) => c.id !== col.id));
      router.refresh();
      if (editingCollection?.id === col.id) {
        handleCloseForm();
      }
      showToast(`Collection "${col.name}" deleted.`);
    } catch (err: any) {
      console.error('Delete collection error:', err);
      alert(`Could not delete collection: ${err?.message || 'Database error'}. Ensure the latest schema.sql has been executed in Supabase.`);
    } finally {
      setDeletingId(null);
    }
  };

  // Submit create or edit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    const finalSlug = (slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-')).replace(/(^-|-$)/g, '');

    const isNew = !editingCollection;
    const payload: Partial<Collection> = {
      id: editingCollection?.id,
      name: name.trim(),
      slug: finalSlug,
      description: description.trim(),
      image_url: imageUrl.trim() || 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=1200',
      show_on_home: showOnHome,
      has_dedicated_page: hasDedicatedPage,
      display_order: Number(displayOrder) || 1,
      is_published: isPublished,
    };

    try {
      const res = await saveCollectionAction(payload);
      if (!res.success) {
        alert(`Could not save collection: ${res.error}`);
        setIsSaving(false);
        return;
      }

      const saved = res.collection!;
      if (isNew) {
        setCollections((prev) => [...prev, saved]);
        showToast(`New collection "${saved.name}" created successfully!`);
      } else {
        setCollections((prev) => prev.map((c) => (c.id === saved.id ? saved : c)));
        showToast(`Collection "${saved.name}" updated successfully!`);
      }

      router.refresh();
      handleCloseForm();
    } catch (err: any) {
      console.error('Save collection error:', err);
      alert(`Could not save collection: ${err?.message || 'Database error'}. Ensure the latest schema.sql has been executed in Supabase.`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 bg-[#1A1A1A] text-white px-4 py-3 shadow-xl rounded-xs flex items-center gap-2.5 border-l-4 border-[#FF55D2] animate-in fade-in slide-in-from-top-3 duration-200 text-xs">
          <CheckCircle2 className="w-4 h-4 text-[#FF55D2]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-neutral-200 pb-5">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#1A1A1A] font-light">
            Collections Management
          </h1>
          <p className="text-xs text-neutral-500 font-light mt-0.5 sm:mt-1">
            Curate and edit signature capsule collections, banner imagery, narrative storytelling, and landing pages.
          </p>
        </div>

        <button
          type="button"
          onClick={() => (isFormOpen && !editingCollection ? handleCloseForm() : handleOpenCreate())}
          className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#FF55D2] hover:bg-[#FD00B9] text-white text-xs uppercase tracking-wider font-semibold shadow-xs transition-colors rounded-xs active:scale-95 shrink-0"
        >
          {isFormOpen && !editingCollection ? (
            <>
              <X className="w-4 h-4" />
              <span>Close Form</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>Create New Collection</span>
            </>
          )}
        </button>
      </div>

      {/* Comprehensive Collection Form (Creation & Full Editing) */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          className="p-5 sm:p-8 bg-white border border-neutral-200 shadow-sm space-y-6 animate-in fade-in slide-in-from-top-2 duration-200 rounded-xs"
        >
          <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-[#FF55D2]" />
              <h2 className="font-serif text-lg sm:text-xl font-medium text-[#1A1A1A]">
                {editingCollection ? `Edit Collection: ${editingCollection.name}` : 'Create Signature Collection'}
              </h2>
            </div>
            <button
              type="button"
              onClick={handleCloseForm}
              className="p-1.5 text-neutral-400 hover:text-black rounded-xs active:scale-90"
              title="Close editor"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-5">
            {/* Section 1: Title & URL Slug */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-700 font-semibold mb-1.5">
                  Collection Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. The Red Saree Collection"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 text-xs rounded-xs focus:bg-white focus:outline-none focus:border-[#FF55D2]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-700 font-semibold mb-1.5">
                  URL Slug / Handle *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. red-saree"
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    className="w-full pl-8 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-300 text-xs rounded-xs font-mono focus:bg-white focus:outline-none focus:border-[#FF55D2]"
                  />
                  <Globe className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3" />
                </div>
                <p className="text-[11px] text-neutral-400 font-mono mt-1">
                  Preview URL: <span className="text-[#FF55D2]">/collections/{slug || 'collection-slug'}</span>
                </p>
              </div>
            </div>

            {/* Section 2: Banner Image with Device Upload & Presets */}
            <div className="space-y-2">
              <ImageUpload
                multiple={false}
                value={imageUrl}
                onChange={setImageUrl}
                label="Editorial Banner Image *"
                helperText="Upload a signature banner directly from your device or camera roll. Images over 1MB are automatically compressed to 80% size (WebP)."
                aspectRatio="aspect-[16/9]"
                maxWidth={1920}
                maxHeight={1080}
              />

              {/* Preset Image Suggestions */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold mr-1">
                  Quick Presets:
                </span>
                {PRESET_BANNER_IMAGES.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setImageUrl(preset.url)}
                    className="px-2 py-0.5 border border-neutral-200 hover:border-[#FF55D2] bg-neutral-50 hover:bg-[#FF55D2]/10 text-[10px] text-neutral-600 hover:text-[#FF55D2] rounded-xs transition-colors cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Section 3: Editorial Description */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-700 font-semibold mb-1.5">
                Editorial Narrative / Description *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Details about the fabric, style, colors, and occasion for this collection..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 bg-neutral-50 border border-neutral-300 text-xs rounded-xs focus:bg-white focus:outline-none focus:border-[#FF55D2] resize-y"
              />
              <p className="text-[11px] text-neutral-400 mt-1">
                Displayed prominently in the collection hero header and in search engine previews.
              </p>
            </div>

            {/* Section 4: Display Order & Visibility Flags */}
            <div className="pt-2 border-t border-neutral-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Display Order */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-700 font-semibold mb-1.5">
                  Display Order
                </label>
                <input
                  type="number"
                  min={1}
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 text-xs rounded-xs focus:bg-white focus:outline-none focus:border-[#FF55D2]"
                />
              </div>

              {/* Show on Home */}
              <div className="flex items-center gap-2 pt-2 sm:pt-6">
                <input
                  type="checkbox"
                  id="show_on_home_check"
                  checked={showOnHome}
                  onChange={(e) => setShowOnHome(e.target.checked)}
                  className="w-4 h-4 rounded-xs border-neutral-300 text-[#FF55D2] focus:ring-[#FF55D2]"
                />
                <label
                  htmlFor="show_on_home_check"
                  className="text-xs font-medium text-neutral-700 cursor-pointer select-none"
                >
                  Featured on Homepage
                </label>
              </div>

              {/* Has Dedicated Page */}
              <div className="flex items-center gap-2 pt-2 sm:pt-6">
                <input
                  type="checkbox"
                  id="has_dedicated_page_check"
                  checked={hasDedicatedPage}
                  onChange={(e) => setHasDedicatedPage(e.target.checked)}
                  className="w-4 h-4 rounded-xs border-neutral-300 text-[#FF55D2] focus:ring-[#FF55D2]"
                />
                <label
                  htmlFor="has_dedicated_page_check"
                  className="text-xs font-medium text-neutral-700 cursor-pointer select-none"
                >
                  Dedicated Landing Page
                </label>
              </div>

              {/* Published Status */}
              <div className="flex items-center gap-2 pt-2 sm:pt-6">
                <input
                  type="checkbox"
                  id="is_published_check"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="w-4 h-4 rounded-xs border-neutral-300 text-[#FF55D2] focus:ring-[#FF55D2]"
                />
                <label
                  htmlFor="is_published_check"
                  className="text-xs font-medium text-neutral-700 cursor-pointer select-none"
                >
                  Published on Storefront
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-2.5 pt-4 border-t border-neutral-100">
            <button
              type="button"
              onClick={handleCloseForm}
              className="w-full sm:w-auto min-h-[42px] px-5 py-2.5 border border-neutral-300 text-xs uppercase tracking-wider text-neutral-700 hover:bg-neutral-100 rounded-xs flex items-center justify-center active:scale-95 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto min-h-[42px] px-6 py-2.5 bg-[#FF55D2] hover:bg-[#FD00B9] text-white text-xs uppercase tracking-wider font-semibold rounded-xs active:scale-95 flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : editingCollection ? 'Apply Changes' : 'Save Collection'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Collections Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <span className="uppercase tracking-widest font-semibold text-neutral-700">
            Active Collections ({collections.length})
          </span>
          <span>Order is reflected across catalog and filters</span>
        </div>

        {collections.length === 0 ? (
          <div className="p-12 text-center bg-white border border-neutral-200 rounded-xs">
            <Layers className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
            <h3 className="font-serif text-lg text-neutral-800">No Collections Configured</h3>
            <p className="text-xs text-neutral-500 mt-1">
              Click "Create New Collection" to add your first collection.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {collections.map((col) => {
              const isEditingThis = editingCollection?.id === col.id && isFormOpen;

              return (
                <div
                  key={col.id}
                  className={`bg-white border transition-all shadow-xs flex flex-col justify-between rounded-xs overflow-hidden ${
                    isEditingThis
                      ? 'border-[#FF55D2] ring-2 ring-[#FF55D2]/20'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div>
                    {/* Banner Image */}
                    <div className="relative aspect-[16/9] w-full bg-neutral-100">
                      {col.image_url ? (
                        <Image
                          src={col.image_url}
                          alt={col.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-400">
                          <Layers className="w-8 h-8" />
                        </div>
                      )}

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                        {col.is_published ? (
                          <span className="px-2 py-0.5 bg-emerald-600/90 text-white text-[9px] uppercase tracking-wider font-semibold rounded-xs backdrop-blur-xs">
                            Published
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-neutral-800/90 text-white text-[9px] uppercase tracking-wider font-semibold rounded-xs backdrop-blur-xs">
                            Draft
                          </span>
                        )}

                        {col.show_on_home && (
                          <span className="px-2 py-0.5 bg-[#FF55D2]/90 text-white text-[9px] uppercase tracking-wider font-semibold rounded-xs backdrop-blur-xs">
                            Featured on Home
                          </span>
                        )}

                        <span className="px-2 py-0.5 bg-black/60 text-neutral-200 text-[9px] font-mono rounded-xs backdrop-blur-xs">
                          #{col.display_order ?? 1}
                        </span>
                      </div>

                      {/* Top Right Live Preview Shortcut */}
                      <div className="absolute top-3 right-3">
                        <Link
                          href={`/collections/${col.slug}`}
                          target="_blank"
                          className="p-2 bg-white/90 hover:bg-white text-neutral-700 hover:text-black rounded-xs shadow-xs inline-block transition-colors"
                          title="Open dedicated collection page in new tab"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="p-5 space-y-2">
                      <div className="flex items-baseline justify-between gap-2">
                        <h3 className="font-serif text-xl font-medium text-[#1A1A1A]">
                          {col.name}
                        </h3>
                        <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-mono shrink-0">
                          /{col.slug}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-600 font-light line-clamp-3 leading-relaxed">
                        {col.description || 'No editorial description added yet.'}
                      </p>
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="p-4 sm:p-5 pt-0 space-y-3">
                    <div className="pt-3 border-t border-neutral-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 text-xs">
                      {/* Left: Home Featured Toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggleHome(col.id)}
                        className={`min-h-[38px] flex items-center justify-center gap-1.5 px-3 py-1.5 border rounded-xs transition-colors active:scale-95 ${
                          col.show_on_home
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-neutral-200 bg-neutral-50 text-neutral-500'
                        }`}
                        title="Toggle visibility on homepage"
                      >
                        {col.show_on_home ? (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>Featured on Home</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>Hidden from Home</span>
                          </>
                        )}
                      </button>

                      {/* Right: View Pieces in Catalog */}
                      <Link
                        href={`/shop?collection=${col.slug}`}
                        className="min-h-[38px] flex items-center justify-center text-neutral-600 hover:text-[#FF55D2] font-semibold transition-colors px-2 gap-1 text-xs"
                      >
                        <span>View Pieces</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>

                    {/* Secondary Action Toolbar: Full Edit & Delete Buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(col)}
                        className="flex-1 min-h-[40px] px-3 bg-[#1A1A1A] hover:bg-[#FF55D2] text-white text-xs font-semibold flex items-center justify-center gap-1.5 uppercase tracking-wider rounded-xs transition-colors active:scale-95 shadow-xs"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit Collection</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTogglePublished(col.id)}
                        className="min-h-[40px] px-3 border border-neutral-200 hover:bg-neutral-100 text-xs font-medium text-neutral-700 rounded-xs transition-colors active:scale-95 shrink-0"
                        title="Toggle draft / published status"
                      >
                        {col.is_published ? 'Unpublish' : 'Publish'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(col)}
                        disabled={deletingId === col.id}
                        className="w-10 h-10 min-w-[40px] flex items-center justify-center border border-neutral-200 rounded-xs text-neutral-400 hover:text-red-600 hover:bg-red-50 active:scale-90 transition-transform disabled:opacity-40 shrink-0"
                        title="Delete this collection"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
