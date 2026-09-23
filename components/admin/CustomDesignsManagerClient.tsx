'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { CustomDesign } from '@/lib/types';
import { saveCustomDesignAction, deleteCustomDesignAction } from '@/app/actions/store';
import ImageUpload from './ImageUpload';
import InstagramEmbed from '@/components/ui/InstagramEmbed';
import { parseInstagramUrl } from '@/lib/utils/instagram';
import { InstagramIcon } from '@/components/ui/Icons';
import {
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  Save,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Video,
  Eye,
  EyeOff,
  ExternalLink,
  Film,
  Camera,
  Layers,
} from 'lucide-react';

interface CustomDesignsManagerClientProps {
  initialDesigns: CustomDesign[];
}

export default function CustomDesignsManagerClient({ initialDesigns }: CustomDesignsManagerClientProps) {
  const router = useRouter();
  const [designs, setDesigns] = useState<CustomDesign[]>(initialDesigns);
  const [editingDesign, setEditingDesign] = useState<CustomDesign | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [designToDelete, setDesignToDelete] = useState<{ id: string; title: string } | null>(null);

  const startNewDesign = () => {
    const newDesign: CustomDesign = {
      id: '',
      title: 'New Custom Outfit',
      description: 'Handcrafted custom garment tailored to client measurements.',
      images: [],
      video_url: '',
      instagram_url: '',
      category: 'Bridal',
      display_order: designs.length + 1,
      is_published: true,
    };
    setEditingDesign(newDesign);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDesign) return;
    if (!editingDesign.title.trim()) {
      alert('Please provide a title for this design.');
      return;
    }

    const cleanInstagramUrl = (editingDesign.video_url || editingDesign.instagram_url || '').trim();
    const hasImages = editingDesign.images && editingDesign.images.length > 0;
    const hasInstagram = cleanInstagramUrl.length > 0;

    if (!hasImages && !hasInstagram) {
      alert('Please either add an Instagram Reel/Post link or upload at least one outfit photo (or both).');
      return;
    }

    const toSave: CustomDesign = {
      ...editingDesign,
      video_url: cleanInstagramUrl,
      instagram_url: cleanInstagramUrl,
      media_type: cleanInstagramUrl
        ? cleanInstagramUrl.includes('/reel')
          ? 'instagram_reel'
          : 'instagram_post'
        : 'image_gallery',
    };

    setIsSaving(true);
    try {
      const res = await saveCustomDesignAction(toSave);
      if (!res.success || !res.design) {
        alert(`Could not save custom design: ${res.error}`);
        setIsSaving(false);
        return;
      }

      setDesigns((prev) => {
        const existingIdx = prev.findIndex((d) => d.id === res.design!.id);
        if (existingIdx >= 0) {
          return prev.map((d) => (d.id === res.design!.id ? res.design! : d));
        }
        return [...prev, res.design!].sort((a, b) => a.display_order - b.display_order);
      });

      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        setEditingDesign(null);
      }, 500);
      router.refresh();
    } catch (err: any) {
      console.error('Failed to save design:', err);
      alert('Error saving design: ' + (err?.message || 'Server error'));
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!designToDelete) return;
    const { id } = designToDelete;
    const previous = [...designs];
    setDesigns((prev) => prev.filter((d) => d.id !== id));
    setDesignToDelete(null);

    try {
      const res = await deleteCustomDesignAction(id);
      if (!res.success) {
        setDesigns(previous);
        alert('Could not delete design: ' + res.error);
        return;
      }
      if (editingDesign?.id === id) {
        setEditingDesign(null);
      }
      router.refresh();
    } catch (err: any) {
      setDesigns(previous);
      alert('Error deleting design: ' + err?.message);
    }
  };

  const togglePublish = async (design: CustomDesign) => {
    const updated = { ...design, is_published: !design.is_published };
    setDesigns((prev) => prev.map((d) => (d.id === design.id ? updated : d)));
    await saveCustomDesignAction(updated);
    router.refresh();
  };

  // Check Instagram parsing for the active form
  const activeInstagramInfo = editingDesign
    ? parseInstagramUrl(editingDesign.video_url || editingDesign.instagram_url)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-[#1A1A1A] font-light">
            Custom Designs &amp; Instagram Showcase
          </h1>
          <p className="text-xs text-neutral-500 font-light mt-1">
            Embed Instagram Reels and Posts directly from your boutique account, alongside custom client photos.
          </p>
        </div>
        {!editingDesign && (
          <button
            type="button"
            onClick={startNewDesign}
            className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#FF55D2] hover:bg-[#FD00B9] text-white text-xs uppercase tracking-wider font-semibold shadow-xs transition-colors rounded-xs active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Post</span>
          </button>
        )}
      </div>

      {/* Editor or List View */}
      {editingDesign ? (
        <form onSubmit={handleSave} className="bg-white border border-neutral-200 p-6 sm:p-8 space-y-6 shadow-xs rounded-xs">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditingDesign(null)}
                className="p-2 border border-neutral-200 hover:bg-neutral-100 rounded-xs text-neutral-600"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h2 className="text-base font-semibold text-neutral-900">
                {editingDesign.id ? `Edit: ${editingDesign.title}` : 'Add Completed Custom Design or Reel'}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditingDesign(null)}
                className="min-h-[40px] px-4 py-2 border border-neutral-200 text-xs text-neutral-600 hover:bg-neutral-50 rounded-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="min-h-[40px] px-5 py-2 bg-[#FF55D2] hover:bg-[#FD00B9] text-white text-xs uppercase tracking-wider font-semibold rounded-xs flex items-center gap-2 active:scale-95"
              >
                {savedSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Saving...' : 'Save Design'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-800 mb-1.5">
                Outfit Title *
              </label>
              <input
                type="text"
                required
                value={editingDesign.title}
                onChange={(e) => setEditingDesign({ ...editingDesign, title: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 text-xs text-[#1A1A1A] focus:bg-white focus:outline-none focus:border-[#FF55D2] rounded-xs"
                placeholder="e.g. Velvet Bridal Lehenga"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-800 mb-1.5">
                Category
              </label>
              <input
                type="text"
                value={editingDesign.category || ''}
                onChange={(e) => setEditingDesign({ ...editingDesign, category: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 text-xs text-[#1A1A1A] focus:bg-white focus:outline-none focus:border-[#FF55D2] rounded-xs"
                placeholder="e.g. Bridal, Festive, Gowns"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-800 mb-1.5">
                Display Order
              </label>
              <input
                type="number"
                min={1}
                value={editingDesign.display_order}
                onChange={(e) => setEditingDesign({ ...editingDesign, display_order: Number(e.target.value) || 1 })}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 text-xs text-[#1A1A1A] focus:bg-white focus:outline-none focus:border-[#FF55D2] rounded-xs"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-800 mb-1.5">
              Short Description
            </label>
            <textarea
              rows={2}
              value={editingDesign.description}
              onChange={(e) => setEditingDesign({ ...editingDesign, description: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 text-xs text-[#1A1A1A] focus:bg-white focus:outline-none focus:border-[#FF55D2] rounded-xs"
              placeholder="Brief details about the fabric, custom cut, handwork, and styling..."
            />
          </div>

          {/* Instagram Reel or Post Field */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-pink-50/50 via-purple-50/30 to-amber-50/30 border border-pink-200/80 rounded-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-neutral-900">
                <InstagramIcon className="w-4 h-4 text-[#FD00B9]" />
                <span>Instagram Reel or Post URL</span>
              </label>
              {activeInstagramInfo ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>
                    {activeInstagramInfo.isReel ? '🎬 Instagram Reel Detected' : '📸 Instagram Post Detected'}
                  </span>
                </span>
              ) : (editingDesign.video_url || editingDesign.instagram_url) ? (
                <span className="inline-flex items-center gap-1 text-[11px] text-amber-700">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Ensure link includes /reel/ or /p/</span>
                </span>
              ) : null}
            </div>

            <p className="text-[11px] text-neutral-600 font-light leading-relaxed">
              Paste the link to your Instagram Reel or Post (e.g. from <code className="text-[#FD00B9] font-medium">@fairyfinds.boutique</code>).
              The reel or post will be interactive and directly embedded for your customers to play and watch on the website.
            </p>

            <div className="relative">
              <input
                type="text"
                value={editingDesign.video_url || editingDesign.instagram_url || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setEditingDesign({
                    ...editingDesign,
                    video_url: val,
                    instagram_url: val,
                  });
                }}
                className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-neutral-300 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF55D2] rounded-xs shadow-xs"
                placeholder="https://www.instagram.com/reel/C_xyz123/ or https://www.instagram.com/p/..."
              />
              <InstagramIcon className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
            </div>

            {/* Live Admin Preview */}
            {activeInstagramInfo && (
              <div className="pt-2">
                <p className="text-[11px] uppercase tracking-wider font-semibold text-neutral-700 mb-2 flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5 text-[#FD00B9]" />
                  <span>Live Storefront Embed Preview</span>
                </p>
                <div className="max-w-xs mx-auto sm:mx-0 border border-neutral-200 rounded-xs overflow-hidden shadow-sm bg-black">
                  <InstagramEmbed
                    url={editingDesign.video_url || editingDesign.instagram_url || ''}
                    title={editingDesign.title}
                    aspectRatio={activeInstagramInfo.isReel ? 'reel' : 'post'}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-800">
                Design Photos (Optional if Reel is added)
              </label>
              {editingDesign.images && editingDesign.images.length > 0 && (
                <span className="text-[11px] text-neutral-500 font-medium">
                  {editingDesign.images.length} photo{editingDesign.images.length > 1 ? 's' : ''} uploaded
                </span>
              )}
            </div>
            <p className="text-[11px] text-neutral-500 font-light">
              Upload high-resolution client fitting photos, embroidery close-ups, or lookbook angles.
              If you provide both an Instagram Reel and photos, visitors can switch between the interactive Reel and photo gallery on your storefront!
            </p>
            <ImageUpload
              multiple={true}
              values={editingDesign.images}
              onMultiChange={(imgs) => setEditingDesign({ ...editingDesign, images: imgs })}
              label="Outfit Photos"
              helperText="Upload photos showing the finished outfit or client fit."
              aspectRatio="aspect-[3/4]"
            />
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-800 font-medium select-none">
              <input
                type="checkbox"
                checked={editingDesign.is_published}
                onChange={(e) => setEditingDesign({ ...editingDesign, is_published: e.target.checked })}
                className="w-4 h-4 text-[#FF55D2] focus:ring-[#FF55D2] rounded-xs"
              />
              <span>Publish on storefront showcase</span>
            </label>
          </div>
        </form>
      ) : (
        /* List View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {designs.length === 0 ? (
            <div className="col-span-full py-12 text-center bg-white border border-neutral-200 rounded-xs text-neutral-400 text-xs">
              No custom designs in showcase yet. Click "Add Custom Post" above.
            </div>
          ) : (
            designs.map((design) => {
              const igInfo = parseInstagramUrl(design.video_url || design.instagram_url);
              const hasImages = design.images && design.images.length > 0;

              return (
                <div
                  key={design.id}
                  className="bg-white border border-neutral-200 rounded-xs overflow-hidden shadow-xs hover:border-[#FF55D2]/50 transition-colors flex flex-col justify-between"
                >
                  <div>
                    {/* Media Display Area */}
                    <div className="relative aspect-[3/4] bg-neutral-900 overflow-hidden">
                      {hasImages ? (
                        <Image
                          src={design.images[0]}
                          alt={design.title}
                          fill
                          className="object-cover"
                        />
                      ) : igInfo ? (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-white bg-gradient-to-b from-neutral-900 via-neutral-950 to-black space-y-2">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#FD00B9] via-[#FF55D2] to-[#FF90E8] flex items-center justify-center text-white shadow-lg">
                            <InstagramIcon className="w-6 h-6" />
                          </div>
                          <span className="text-xs uppercase tracking-wider text-[#FF55D2] font-semibold">
                            {igInfo.isReel ? 'Embedded Reel' : 'Embedded Post'}
                          </span>
                          <span className="text-[11px] text-neutral-400 font-mono">
                            ID: {igInfo.shortcode}
                          </span>
                        </div>
                      ) : (
                        <Image
                          src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600"
                          alt={design.title}
                          fill
                          className="object-cover opacity-60"
                        />
                      )}

                      {/* Top Badges */}
                      <div className="absolute top-2 left-2 flex items-center gap-1.5 flex-wrap">
                        {design.category && (
                          <span className="px-2 py-0.5 bg-white/95 backdrop-blur-xs text-[10px] uppercase tracking-wider font-semibold text-neutral-900 rounded-xs shadow-xs">
                            {design.category}
                          </span>
                        )}
                      </div>

                      <div className="absolute top-2 right-2 flex items-center gap-1.5">
                        {igInfo && (
                          <span
                            className="px-2 py-0.5 bg-gradient-to-r from-[#FD00B9] to-[#FF55D2] text-white text-[10px] font-semibold uppercase tracking-wider rounded-xs shadow-xs flex items-center gap-1"
                            title={igInfo.isReel ? 'Has Instagram Reel' : 'Has Instagram Post'}
                          >
                            <InstagramIcon className="w-3 h-3" />
                            <span>{igInfo.isReel ? 'Reel' : 'Post'}</span>
                          </span>
                        )}
                        {hasImages && (
                          <span className="px-2 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-medium rounded-xs flex items-center gap-1">
                            <Camera className="w-3 h-3" />
                            <span>{design.images.length}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-serif text-base font-medium text-neutral-900 leading-snug">
                          {design.title}
                        </h3>
                        <button
                          type="button"
                          onClick={() => togglePublish(design)}
                          className={`px-2 py-0.5 rounded-xs text-[10px] font-semibold border flex items-center gap-1 ${
                            design.is_published
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-neutral-100 text-neutral-500 border-neutral-200'
                          }`}
                          title="Toggle visibility"
                        >
                          {design.is_published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          <span>{design.is_published ? 'Visible' : 'Hidden'}</span>
                        </button>
                      </div>

                      <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                        {design.description}
                      </p>

                      {igInfo && (
                        <div className="pt-1">
                          <a
                            href={igInfo.permalink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-[#FD00B9] hover:underline font-medium"
                          >
                            <InstagramIcon className="w-3 h-3" />
                            <span>View on Instagram →</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 p-3 border-t border-neutral-100 bg-neutral-50/50">
                    <button
                      type="button"
                      onClick={() => setEditingDesign(design)}
                      className="min-h-[38px] px-3 border border-neutral-200 hover:border-black text-neutral-700 text-xs font-semibold rounded-xs flex items-center gap-1 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDesignToDelete({ id: design.id, title: design.title })}
                      className="min-h-[38px] px-3 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold rounded-xs flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {designToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-neutral-200 rounded-xs max-w-sm w-full p-5 sm:p-6 shadow-xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-neutral-900">Delete Custom Design?</h3>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                  Are you sure you want to remove <strong className="text-neutral-800 font-semibold">"{designToDelete.title}"</strong> from your showcase?
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setDesignToDelete(null)}
                className="flex-1 min-h-[44px] px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors active:scale-95"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 min-h-[44px] px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors active:scale-95 shadow-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
