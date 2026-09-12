'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { CustomerPhoto, Product } from '@/lib/types';
import { saveCustomerPhotosAction } from '@/app/actions/store';
import ImageUpload from './ImageUpload';
import { InstagramIcon } from '@/components/ui/Icons';
import {
  Camera,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Eye,
  EyeOff,
  Sparkles,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  MapPin,
  Heart,
  Star,
  Search,
  SlidersHorizontal,
  X,
  UploadCloud,
  Check,
  Tag,
  Grid,
  List,
} from 'lucide-react';

interface CustomerGalleryCMSClientProps {
  initialPhotos: CustomerPhoto[];
  products: Product[];
}

const COMMON_OCCASIONS = [
  'Sangeet Soirée',
  'Reception Gala',
  'Royal Wedding',
  'Cocktail Evening',
  'Diwali Soirée',
  'Mehendi Sundowner',
  'Atelier Bespoke',
  'Intimate Engagement',
  'Festive Soirée',
  'Haldi Ceremony',
];

export default function CustomerGalleryCMSClient({
  initialPhotos,
  products,
}: CustomerGalleryCMSClientProps) {
  const router = useRouter();
  const [photos, setPhotos] = useState<CustomerPhoto[]>(initialPhotos);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOccasion, setSelectedOccasion] = useState('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showBatchDropzone, setShowBatchDropzone] = useState(false);

  // Edit/Add modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null); // null means adding new
  const [formName, setFormName] = useState('');
  const [formInstagram, setFormInstagram] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formCaption, setFormCaption] = useState('');
  const [formOccasion, setFormOccasion] = useState('Sangeet Soirée');
  const [formCity, setFormCity] = useState('');
  const [formProductId, setFormProductId] = useState('');
  const [formRating, setFormRating] = useState<number>(5);
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formIsVisible, setFormIsVisible] = useState(true);

  useEffect(() => {
    setPhotos(initialPhotos);
  }, [initialPhotos]);

  // Save changes to database
  const handleSave = async (updatedPhotos: CustomerPhoto[]) => {
    setIsSaving(true);
    setPhotos(updatedPhotos);
    try {
      const res = await saveCustomerPhotosAction(updatedPhotos);
      if (!res.success) {
        alert(`Could not save customer photos: ${res.error}`);
        return;
      }
      router.refresh();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err: any) {
      console.error('Save customer photos error:', err);
      alert(`Could not save customer photos: ${err?.message || 'Database error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Batch upload handler
  const handleBatchAddPhotos = (urls: string[]) => {
    if (!urls || urls.length === 0) return;
    const newMuses: CustomerPhoto[] = urls.map((url, idx) => ({
      id: `muse-${Date.now()}-${idx}`,
      customer_name: 'Boutique Muse',
      instagram_handle: '',
      image_url: url,
      caption: 'Adorned in bespoke Fairy Finds couture.',
      occasion: 'Celebratory Soirée',
      city: 'Colombo, Sri Lanka',
      rating: 5,
      likes_count: 50 + Math.floor(Math.random() * 80),
      is_featured: false,
      is_visible: true,
      display_order: photos.length + idx + 1,
      created_at: new Date().toISOString(),
    }));

    const updated = [...newMuses, ...photos];
    handleSave(updated);
    setShowBatchDropzone(false);
  };

  // Open Add Modal
  const openAddModal = () => {
    setEditingId(null);
    setFormName('');
    setFormInstagram('');
    setFormImageUrl('');
    setFormCaption('');
    setFormOccasion('Sangeet Soirée');
    setFormCity('');
    setFormProductId('');
    setFormRating(5);
    setFormIsFeatured(false);
    setFormIsVisible(true);
    setModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (photo: CustomerPhoto) => {
    setEditingId(photo.id);
    setFormName(photo.customer_name);
    setFormInstagram(photo.instagram_handle || '');
    setFormImageUrl(photo.image_url);
    setFormCaption(photo.caption || '');
    setFormOccasion(photo.occasion || 'Sangeet Soirée');
    setFormCity(photo.city || '');
    setFormProductId(photo.product_id || '');
    setFormRating(photo.rating || 5);
    setFormIsFeatured(photo.is_featured);
    setFormIsVisible(photo.is_visible);
    setModalOpen(true);
  };

  // Submit Modal Form
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formImageUrl.trim()) {
      alert('Please upload or provide an image for the muse.');
      return;
    }
    if (!formName.trim()) {
      alert('Please enter a customer or muse name.');
      return;
    }

    // Resolve tagged product
    const taggedProduct = products.find((p) => p.id === formProductId);

    if (editingId) {
      // Edit existing
      const updated = photos.map((p) => {
        if (p.id === editingId) {
          return {
            ...p,
            customer_name: formName.trim(),
            instagram_handle: formInstagram.trim() || undefined,
            image_url: formImageUrl.trim(),
            caption: formCaption.trim() || undefined,
            occasion: formOccasion.trim() || undefined,
            city: formCity.trim() || undefined,
            product_id: taggedProduct ? taggedProduct.id : undefined,
            product_name: taggedProduct ? taggedProduct.name : undefined,
            product_slug: taggedProduct ? taggedProduct.slug : undefined,
            product_price: taggedProduct ? taggedProduct.price : undefined,
            product_image: taggedProduct?.images?.[0] || undefined,
            rating: formRating,
            is_featured: formIsFeatured,
            is_visible: formIsVisible,
          };
        }
        return p;
      });
      handleSave(updated);
    } else {
      // Add new
      const newPhoto: CustomerPhoto = {
        id: `muse-${Date.now()}`,
        customer_name: formName.trim(),
        instagram_handle: formInstagram.trim() || undefined,
        image_url: formImageUrl.trim(),
        caption: formCaption.trim() || undefined,
        occasion: formOccasion.trim() || undefined,
        city: formCity.trim() || undefined,
        product_id: taggedProduct ? taggedProduct.id : undefined,
        product_name: taggedProduct ? taggedProduct.name : undefined,
        product_slug: taggedProduct ? taggedProduct.slug : undefined,
        product_price: taggedProduct ? taggedProduct.price : undefined,
        product_image: taggedProduct?.images?.[0] || undefined,
        rating: formRating,
        likes_count: 85,
        is_featured: formIsFeatured,
        is_visible: formIsVisible,
        display_order: photos.length + 1,
        created_at: new Date().toISOString(),
      };
      const updated = [newPhoto, ...photos];
      handleSave(updated);
    }

    setModalOpen(false);
  };

  // Reordering
  const handleMove = (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= photos.length) return;
    const nextList = [...photos];
    const [moved] = nextList.splice(index, 1);
    nextList.splice(targetIdx, 0, moved);

    // Update display_order
    const updated = nextList.map((p, idx) => ({ ...p, display_order: idx + 1 }));
    handleSave(updated);
  };

  // Toggle Visibility
  const toggleVisibility = (id: string) => {
    const updated = photos.map((p) => (p.id === id ? { ...p, is_visible: !p.is_visible } : p));
    handleSave(updated);
  };

  // Toggle Featured
  const toggleFeatured = (id: string) => {
    const updated = photos.map((p) => (p.id === id ? { ...p, is_featured: !p.is_featured } : p));
    handleSave(updated);
  };

  // Delete photo
  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from the customer gallery?`)) return;
    const updated = photos.filter((p) => p.id !== id);
    handleSave(updated);
  };

  // Filtering
  const occasionsList = Array.from(new Set(photos.map((p) => p.occasion).filter(Boolean))) as string[];
  const filteredPhotos = photos.filter((p) => {
    const matchesOccasion = selectedOccasion === 'ALL' || p.occasion === selectedOccasion;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      p.customer_name.toLowerCase().includes(query) ||
      (p.instagram_handle && p.instagram_handle.toLowerCase().includes(query)) ||
      (p.city && p.city.toLowerCase().includes(query)) ||
      (p.caption && p.caption.toLowerCase().includes(query)) ||
      (p.product_name && p.product_name.toLowerCase().includes(query));
    return matchesOccasion && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xs bg-[#FF55D2]/10 border border-[#FF55D2]/20 flex items-center justify-center text-[#FF55D2]">
              <Camera className="w-4 h-4" />
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl text-[#1A1A1A] font-light">
              Client Diaries & Muses Studio
            </h1>
          </div>
          <p className="text-xs text-neutral-500 font-light mt-1">
            Showcase real customer photography, celebratory stories, Instagram tags, and tagged garments on the dedicated{' '}
            <Link href="/muses" target="_blank" className="text-[#FF55D2] underline font-medium">
              /muses storefront page
            </Link>
            .
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {saveSuccess && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>Saved to Live Storefront</span>
            </div>
          )}

          <Link
            href="/muses"
            target="_blank"
            className="px-3.5 py-2 border border-neutral-300 hover:border-neutral-800 text-neutral-700 hover:text-black text-xs uppercase tracking-wider font-semibold rounded-xs flex items-center gap-1.5 transition-colors bg-white shadow-xs"
          >
            <span>View Live Gallery</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            type="button"
            onClick={() => setShowBatchDropzone(!showBatchDropzone)}
            className="px-3.5 py-2 bg-pink-50 hover:bg-pink-100 text-[#FF55D2] border border-pink-200 text-xs uppercase tracking-wider font-semibold rounded-xs flex items-center gap-1.5 transition-colors shadow-xs active:scale-95"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>{showBatchDropzone ? 'Hide Batch Uploader' : 'Batch Upload Photos'}</span>
          </button>

          <button
            type="button"
            onClick={openAddModal}
            className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#FF55D2] text-white text-xs uppercase tracking-wider font-semibold rounded-xs flex items-center gap-1.5 transition-colors shadow-xs active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Single Muse</span>
          </button>
        </div>
      </div>

      {/* Batch Upload Dropzone Drawer */}
      {showBatchDropzone && (
        <div className="p-5 bg-white border-2 border-dashed border-[#FF55D2]/40 rounded-xs space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#FF55D2]" />
              <h3 className="text-xs uppercase tracking-wider font-semibold text-[#1A1A1A]">
                Batch Upload Client Photos from Device
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowBatchDropzone(false)}
              className="text-neutral-400 hover:text-neutral-700 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[11px] text-neutral-500 font-light">
            Select or drag multiple event photos directly from your phone or laptop. Every image is automatically compressed to WebP on the client side before uploading, preserving crystal-clear luxury detail while saving over 90% in file size.
          </p>
          <ImageUpload
            multiple={true}
            values={[]}
            onMultiChange={handleBatchAddPhotos}
            label="Drop multiple customer photos to auto-create muse stories"
            aspectRatio="aspect-[3/4]"
          />
        </div>
      )}

      {/* Controls & Metrics Bar */}
      <div className="bg-white p-4 border border-neutral-200 rounded-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, city, Instagram, garment..."
            className="w-full pl-8 pr-3 py-2 bg-neutral-50 border border-neutral-200 text-xs rounded-xs focus:outline-none focus:border-[#FF55D2] focus:bg-white"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Occasion Filter & Layout Toggle */}
        <div className="flex items-center gap-2.5 self-end md:self-auto flex-wrap">
          <div className="flex items-center gap-1.5 bg-neutral-50 border border-neutral-200 px-2.5 py-1.5 rounded-xs text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-[10px] uppercase font-semibold text-neutral-500">Occasion:</span>
            <select
              value={selectedOccasion}
              onChange={(e) => setSelectedOccasion(e.target.value)}
              className="bg-transparent text-xs font-medium text-neutral-800 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Occasions ({photos.length})</option>
              {occasionsList.map((occ) => (
                <option key={occ} value={occ}>
                  {occ}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center border border-neutral-200 rounded-xs overflow-hidden bg-neutral-50">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${
                viewMode === 'grid' ? 'bg-[#1A1A1A] text-white' : 'text-neutral-500 hover:text-black'
              }`}
              title="Grid View"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-2 transition-colors ${
                viewMode === 'list' ? 'bg-[#1A1A1A] text-white' : 'text-neutral-500 hover:text-black'
              }`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Gallery Cards Grid / List */}
      {filteredPhotos.length === 0 ? (
        <div className="p-12 bg-white border border-neutral-200 rounded-xs text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
            <Camera className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-lg text-neutral-800">No client photos found</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto font-light">
            {searchQuery || selectedOccasion !== 'ALL'
              ? 'Try changing your search keywords or occasion filter.'
              : 'Upload your first celebratory client photo to launch the luxury customer diaries.'}
          </p>
          <button
            type="button"
            onClick={openAddModal}
            className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#FF55D2] text-white text-xs uppercase tracking-wider font-semibold rounded-xs inline-flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add First Muse</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredPhotos.map((photo, index) => {
            const originalIndex = photos.findIndex((p) => p.id === photo.id);
            return (
              <div
                key={photo.id}
                className={`bg-white border rounded-xs overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group ${
                  photo.is_visible ? 'border-neutral-200' : 'border-neutral-200 opacity-60 bg-neutral-50/60'
                }`}
              >
                {/* Photo Top Preview */}
                <div className="relative aspect-[3/4] bg-neutral-100 overflow-hidden">
                  <Image
                    src={photo.image_url}
                    alt={photo.customer_name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1 z-10">
                    <span className="px-2 py-0.5 bg-black/70 backdrop-blur-xs text-white text-[10px] font-mono font-semibold rounded-xs">
                      #{photo.display_order || originalIndex + 1}
                    </span>

                    <div className="flex items-center gap-1">
                      {photo.is_featured && (
                        <span className="px-2 py-0.5 bg-[#FF55D2] text-white text-[9px] uppercase tracking-wider font-bold rounded-xs flex items-center gap-1 shadow-xs">
                          <Star className="w-2.5 h-2.5 fill-white" />
                          <span>Spotlight</span>
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => toggleVisibility(photo.id)}
                        className={`p-1.5 rounded-xs backdrop-blur-xs transition-colors ${
                          photo.is_visible
                            ? 'bg-black/60 text-white hover:bg-black/80'
                            : 'bg-red-500/80 text-white hover:bg-red-600'
                        }`}
                        title={photo.is_visible ? 'Visible on storefront' : 'Hidden from storefront'}
                      >
                        {photo.is_visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Bottom details over image */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 text-white space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 bg-white/20 backdrop-blur-md text-[10px] uppercase font-semibold tracking-wider rounded-xs">
                        {photo.occasion || 'Celebration'}
                      </span>
                      {photo.city && (
                        <span className="flex items-center gap-0.5 text-[10px] text-white/90">
                          <MapPin className="w-2.5 h-2.5 text-[#FF55D2]" />
                          {photo.city}
                        </span>
                      )}
                    </div>
                    <h3 className="font-serif text-base font-medium leading-snug">{photo.customer_name}</h3>
                    {photo.instagram_handle && (
                      <p className="text-[11px] text-pink-200 font-mono flex items-center gap-1">
                        <InstagramIcon className="w-3 h-3" />
                        {photo.instagram_handle}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Body & Story Quote */}
                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    {photo.caption ? (
                      <p className="text-xs text-neutral-600 font-light italic line-clamp-3 leading-relaxed">
                        “{photo.caption}”
                      </p>
                    ) : (
                      <p className="text-xs text-neutral-400 italic">No story quote added yet.</p>
                    )}

                    {/* Tagged Product */}
                    {photo.product_name && (
                      <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xs bg-neutral-100 relative overflow-hidden shrink-0 border border-neutral-200">
                          {photo.product_image ? (
                            <Image
                              src={photo.product_image}
                              alt={photo.product_name}
                              fill
                              className="object-cover"
                              sizes="28px"
                            />
                          ) : (
                            <Tag className="w-3.5 h-3.5 text-neutral-400 m-auto" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[9px] uppercase font-semibold text-[#FF55D2] block tracking-wider">
                            Tagged Garment
                          </span>
                          <p className="text-[11px] font-medium text-neutral-800 truncate">
                            {photo.product_name}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Controls */}
                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-1">
                    {/* Reorder buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={originalIndex === 0}
                        onClick={() => handleMove(originalIndex, -1)}
                        className="w-7 h-7 flex items-center justify-center border border-neutral-200 rounded-xs hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed text-neutral-700"
                        title="Move photo earlier"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        disabled={originalIndex === photos.length - 1}
                        onClick={() => handleMove(originalIndex, 1)}
                        className="w-7 h-7 flex items-center justify-center border border-neutral-200 rounded-xs hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed text-neutral-700"
                        title="Move photo later"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleFeatured(photo.id)}
                        className={`w-7 h-7 flex items-center justify-center border rounded-xs transition-colors ${
                          photo.is_featured
                            ? 'border-[#FF55D2] text-[#FF55D2] bg-pink-50'
                            : 'border-neutral-200 text-neutral-400 hover:text-black'
                        }`}
                        title="Toggle Spotlight Feature"
                      >
                        <Star className={`w-3 h-3 ${photo.is_featured ? 'fill-[#FF55D2]' : ''}`} />
                      </button>
                    </div>

                    {/* Edit and Delete */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(photo)}
                        className="px-2.5 py-1.5 bg-neutral-100 hover:bg-[#1A1A1A] hover:text-white text-neutral-700 text-xs font-semibold rounded-xs transition-colors flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(photo.id, photo.customer_name)}
                        className="p-1.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-xs transition-colors"
                        title="Delete photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-white border border-neutral-200 rounded-xs overflow-x-auto shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-[10px] uppercase font-semibold text-neutral-500 tracking-wider">
              <tr>
                <th className="py-3 px-4 w-12">#</th>
                <th className="py-3 px-4 w-16">Photo</th>
                <th className="py-3 px-4">Customer & Occasion</th>
                <th className="py-3 px-4">Story Quote</th>
                <th className="py-3 px-4">Tagged Garment</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredPhotos.map((photo, index) => {
                const originalIndex = photos.findIndex((p) => p.id === photo.id);
                return (
                  <tr key={photo.id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono text-neutral-400">
                      {photo.display_order || originalIndex + 1}
                    </td>
                    <td className="py-3 px-4">
                      <div className="relative w-12 h-14 rounded-xs overflow-hidden bg-neutral-100 border border-neutral-200">
                        <Image
                          src={photo.image_url}
                          alt={photo.customer_name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-serif text-sm font-medium text-neutral-900">
                        {photo.customer_name}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-neutral-500">
                        <span className="font-semibold text-[#FF55D2]">{photo.occasion || 'Celebration'}</span>
                        {photo.city && <span>• {photo.city}</span>}
                        {photo.instagram_handle && (
                          <span className="text-neutral-400 font-mono">{photo.instagram_handle}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <p className="text-neutral-600 truncate italic">
                        {photo.caption ? `“${photo.caption}”` : '—'}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      {photo.product_name ? (
                        <span className="px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded-xs text-[11px] truncate max-w-[150px] inline-block">
                          {photo.product_name}
                        </span>
                      ) : (
                        <span className="text-neutral-400 text-[11px]">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => toggleVisibility(photo.id)}
                          className={`p-1 rounded-xs ${
                            photo.is_visible ? 'text-emerald-600 hover:bg-emerald-50' : 'text-neutral-400 hover:bg-neutral-100'
                          }`}
                        >
                          {photo.is_visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleFeatured(photo.id)}
                          className={`p-1 rounded-xs ${
                            photo.is_featured ? 'text-[#FF55D2]' : 'text-neutral-300 hover:text-black'
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${photo.is_featured ? 'fill-[#FF55D2]' : ''}`} />
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(photo)}
                          className="px-2.5 py-1 bg-neutral-100 hover:bg-black hover:text-white rounded-xs text-[11px] font-semibold transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(photo.id, photo.customer_name)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded-xs transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* ADD / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xs border border-neutral-200 w-full max-w-2xl my-8 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/60">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#FF55D2]" />
                <h3 className="font-serif text-lg font-medium text-[#1A1A1A]">
                  {editingId ? 'Edit Muse Story' : 'Add New Client Muse'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-neutral-400 hover:text-black p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Photo Upload with WebP compression */}
              <div className="space-y-2">
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-neutral-700">
                  Client Photography *
                </label>
                <ImageUpload
                  multiple={false}
                  value={formImageUrl}
                  onChange={(url) => setFormImageUrl(url)}
                  aspectRatio="aspect-[3/4]"
                  label="Upload client photo from device"
                  helperText="Select a celebratory photo from your device. Automatically compressed to WebP and framed to luxury 3:4 portrait."
                />
              </div>

              {/* Name & Instagram Handle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-neutral-700 mb-1">
                    Customer / Muse Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Pooja Hegde-Kapoor"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 text-xs rounded-xs focus:outline-none focus:border-[#FF55D2] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-neutral-700 mb-1">
                    Instagram Handle (optional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs font-mono">@</span>
                    <input
                      type="text"
                      value={formInstagram.replace(/^@/, '')}
                      onChange={(e) => setFormInstagram(e.target.value ? `@${e.target.value.replace(/^@/, '')}` : '')}
                      placeholder="username"
                      className="w-full pl-7 pr-3 py-2 bg-neutral-50 border border-neutral-300 text-xs rounded-xs focus:outline-none focus:border-[#FF55D2] focus:bg-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Occasion & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-neutral-700 mb-1">
                    Celebratory Occasion
                  </label>
                  <input
                    type="text"
                    value={formOccasion}
                    onChange={(e) => setFormOccasion(e.target.value)}
                    list="occasions-presets"
                    placeholder="e.g. Sangeet Soirée, Royal Wedding"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 text-xs rounded-xs focus:outline-none focus:border-[#FF55D2] focus:bg-white"
                  />
                  <datalist id="occasions-presets">
                    {COMMON_OCCASIONS.map((occ) => (
                      <option key={occ} value={occ} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-neutral-700 mb-1">
                    City / Country
                  </label>
                  <input
                    type="text"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    placeholder="e.g. Colombo, Sri Lanka or Mumbai, India"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 text-xs rounded-xs focus:outline-none focus:border-[#FF55D2] focus:bg-white"
                  />
                </div>
              </div>

              {/* Tagged Product for "Shop The Look" */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-neutral-700 mb-1">
                  Tag Boutique Garment (For "Shop The Look")
                </label>
                <select
                  value={formProductId}
                  onChange={(e) => setFormProductId(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 text-xs rounded-xs focus:outline-none focus:border-[#FF55D2] focus:bg-white cursor-pointer"
                >
                  <option value="">-- No Specific Product (General Couture) --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.product_code || 'FF'}) - Rs. {p.price.toLocaleString()}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-neutral-500 mt-1">
                  Selecting a product automatically displays a "Shop The Look" card in the storefront modal with direct link & pricing.
                </p>
              </div>

              {/* Story Narrative / Quote */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-neutral-700 mb-1">
                  Client Story / Testimonial Quote
                </label>
                <textarea
                  rows={3}
                  value={formCaption}
                  onChange={(e) => setFormCaption(e.target.value)}
                  placeholder="Describe the occasion, how the outfit felt, or quotes from the client..."
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 text-xs rounded-xs focus:outline-none focus:border-[#FF55D2] focus:bg-white resize-none"
                />
              </div>

              {/* Toggles: Featured & Visible */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 bg-neutral-50 border border-neutral-200 rounded-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsFeatured}
                    onChange={(e) => setFormIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded-xs text-[#FF55D2] focus:ring-[#FF55D2]"
                  />
                  <div>
                    <span className="text-xs font-semibold text-neutral-800">Pin as Spotlight Muse</span>
                    <p className="text-[10px] text-neutral-500 font-light">
                      Highlights this story with a gold/pink editorial badge on the storefront.
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsVisible}
                    onChange={(e) => setFormIsVisible(e.target.checked)}
                    className="w-4 h-4 rounded-xs text-[#FF55D2] focus:ring-[#FF55D2]"
                  />
                  <div>
                    <span className="text-xs font-semibold text-neutral-800">Visible on Storefront</span>
                    <p className="text-[10px] text-neutral-500 font-light">
                      Uncheck to save as draft without publishing.
                    </p>
                  </div>
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-neutral-300 hover:bg-neutral-100 text-neutral-700 text-xs font-semibold rounded-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-[#1A1A1A] hover:bg-[#FF55D2] text-white text-xs uppercase tracking-wider font-semibold rounded-xs transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving to Database...' : editingId ? 'Save Changes' : 'Publish Muse Story'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
