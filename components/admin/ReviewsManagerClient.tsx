'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { CustomerReview } from '@/lib/types';
import { saveReviewsAction } from '@/app/actions/store';
import {
  Star,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Eye,
  EyeOff,
  Sparkles,
  MessageSquare,
  Image as ImageIcon,
  User,
  MapPin,
  Tag,
} from 'lucide-react';

interface ReviewsManagerClientProps {
  initialReviews: CustomerReview[];
}

export default function ReviewsManagerClient({ initialReviews }: ReviewsManagerClientProps) {
  const router = useRouter();
  const [reviews, setReviews] = useState<CustomerReview[]>(initialReviews);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setReviews(initialReviews);
  }, [initialReviews]);

  // Add review form state
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [location, setLocation] = useState('');
  const [tag, setTag] = useState('');
  const [isVisible, setIsVisible] = useState(true);

  // Edit review state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [editRating, setEditRating] = useState<number>(5);
  const [editComment, setEditComment] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editTag, setEditTag] = useState('');

  const handleSave = async (updatedReviews: CustomerReview[]) => {
    setIsSaving(true);
    setReviews(updatedReviews);
    await saveReviewsAction(updatedReviews);
    router.refresh();
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Add new review
  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;

    const newReview: CustomerReview = {
      id: `rev-${Date.now()}`,
      customer_name: name.trim(),
      avatar_url: avatarUrl.trim() || undefined,
      rating,
      comment: comment.trim(),
      location: location.trim() || undefined,
      tag: tag.trim() || undefined,
      is_visible: isVisible,
      display_order: reviews.length + 1,
      created_at: new Date().toISOString(),
    };

    const updated = [newReview, ...reviews];
    handleSave(updated);

    // Reset form
    setName('');
    setAvatarUrl('');
    setRating(5);
    setComment('');
    setLocation('');
    setTag('');
    setIsVisible(true);
    setIsAdding(false);
  };

  // Delete review
  const handleDeleteReview = (id: string) => {
    if (!confirm('Are you sure you want to delete this customer review?')) return;
    const updated = reviews.filter((r) => r.id !== id);
    handleSave(updated);
  };

  // Toggle visibility
  const handleToggleVisibility = (id: string) => {
    const updated = reviews.map((r) =>
      r.id === id ? { ...r, is_visible: !r.is_visible } : r
    );
    handleSave(updated);
  };

  // Start editing
  const startEdit = (r: CustomerReview) => {
    setEditingId(r.id);
    setEditName(r.customer_name);
    setEditAvatarUrl(r.avatar_url || '');
    setEditRating(r.rating);
    setEditComment(r.comment);
    setEditLocation(r.location || '');
    setEditTag(r.tag || '');
  };

  // Save edit
  const handleSaveEdit = (id: string) => {
    if (!editName.trim() || !editComment.trim()) return;

    const updated = reviews.map((r) =>
      r.id === id
        ? {
            ...r,
            customer_name: editName.trim(),
            avatar_url: editAvatarUrl.trim() || undefined,
            rating: editRating,
            comment: editComment.trim(),
            location: editLocation.trim() || undefined,
            tag: editTag.trim() || undefined,
          }
        : r
    );

    handleSave(updated);
    setEditingId(null);
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-neutral-200 pb-5">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#1A1A1A] font-light">
            Customer Reviews & Marquee CMS
          </h1>
          <p className="text-xs text-neutral-500 font-light mt-0.5 sm:mt-1">
            Manage customer testimonials displayed in the luxury slow marquee on your storefront.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
          {saveSuccess && (
            <div className="flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold animate-in fade-in rounded-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>Reviews Saved Live</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#FF55D2] hover:bg-[#FD00B9] text-white text-xs uppercase tracking-wider font-semibold shadow-xs transition-colors rounded-xs active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{isAdding ? 'Close Form' : 'Add New Review'}</span>
          </button>
        </div>
      </div>

      {/* Add New Review Form */}
      {isAdding && (
        <form
          onSubmit={handleAddReview}
          className="bg-white border border-neutral-200 p-5 sm:p-8 shadow-sm space-y-5 sm:space-y-6 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3 sm:pb-4">
            <h2 className="font-serif text-lg font-medium text-[#1A1A1A] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FF55D2]" />
              <span>Add Customer Testimonial</span>
            </h2>
            <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-semibold">
              Live Storefront Marquee
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {/* Customer Name */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-700 font-semibold mb-1.5">
                Customer Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Amara Senanayake"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-50/50 border border-neutral-300 text-xs rounded-xs focus:outline-none focus:border-[#FF55D2] focus:bg-white"
                />
                <User className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* Star Rating Picker */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-700 font-semibold mb-1.5">
                Star Rating ({rating} of 5 Stars) *
              </label>
              <div className="flex items-center gap-1 py-1">
                {[1, 2, 3, 4, 5].map((starVal) => (
                  <button
                    key={starVal}
                    type="button"
                    onClick={() => setRating(starVal)}
                    className="w-9 h-9 flex items-center justify-center text-neutral-300 active:scale-125 transition-transform cursor-pointer"
                    title={`Rate ${starVal} Star${starVal > 1 ? 's' : ''}`}
                  >
                    <Star
                      className={`w-6 h-6 ${
                        starVal <= rating
                          ? 'text-[#FF55D2] fill-[#FF55D2]'
                          : 'text-neutral-300 fill-neutral-100'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-xs font-semibold text-neutral-700">
                  {rating}.0 / 5.0
                </span>
              </div>
            </div>

            {/* Profile Picture URL */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-700 font-semibold mb-1.5">
                Profile Picture URL (Optional)
              </label>
              <div className="relative">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... or image link"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-neutral-50/50 border border-neutral-300 text-xs rounded-xs focus:outline-none focus:border-[#FF55D2] focus:bg-white"
                />
                <ImageIcon className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Location & City */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-700 font-semibold mb-1.5">
                Location / City (Optional)
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Colombo, Sri Lanka or Kandy"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-neutral-50/50 border border-neutral-300 text-xs rounded-xs focus:outline-none focus:border-[#FF55D2] focus:bg-white"
                />
                <MapPin className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Garment Tag / Subtitle */}
            <div className="sm:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-neutral-700 font-semibold mb-1.5">
                Garment Reference / Tag (Optional)
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Bridal Silk Edit, Custom Bespoke Client, Verified Purchase"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-neutral-50/50 border border-neutral-300 text-xs rounded-xs focus:outline-none focus:border-[#FF55D2] focus:bg-white"
                />
                <Tag className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              </div>
            </div>
          </div>

          {/* Testimonial Content */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-700 font-semibold mb-1.5">
              Review Testimonial Text *
            </label>
            <textarea
              required
              rows={3}
              placeholder="What did the customer say about the saree drape, fabric quality, custom sizing, or WhatsApp ordering experience?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-3 bg-neutral-50/50 border border-neutral-300 text-xs rounded-xs focus:outline-none focus:border-[#FF55D2] focus:bg-white"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-neutral-100">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-neutral-700 select-none">
              <input
                type="checkbox"
                checked={isVisible}
                onChange={(e) => setIsVisible(e.target.checked)}
                className="w-4 h-4 rounded-xs text-[#FF55D2] focus:ring-[#FF55D2]"
              />
              <span>Display on live storefront immediately</span>
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="w-full sm:w-auto min-h-[42px] px-4 py-2 border border-neutral-300 text-xs uppercase tracking-wider text-neutral-600 hover:bg-neutral-100 transition-colors rounded-xs active:scale-95 flex items-center justify-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto min-h-[42px] px-6 py-2 bg-[#1A1A1A] hover:bg-[#FF55D2] text-white text-xs uppercase tracking-wider font-semibold transition-colors disabled:opacity-50 rounded-xs active:scale-95 flex items-center justify-center shadow-xs"
              >
                {isSaving ? 'Publishing...' : 'Publish Review'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Reviews List */}
      <div className="bg-white border border-neutral-200 shadow-xs">
        <div className="p-5 border-b border-neutral-200 bg-neutral-50/60 flex items-center justify-between">
          <div>
            <h2 className="text-xs uppercase tracking-wider font-semibold text-neutral-800">
              Customer Reviews ({reviews.length})
            </h2>
            <p className="text-[11px] text-neutral-400 font-light mt-0.5">
              All active reviews are scrolled in the infinite slow marquee across the homepage.
            </p>
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="py-16 text-center text-xs text-neutral-400">
            No customer reviews added yet. Click "Add New Review" to publish one.
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {reviews.map((r, index) => {
              const isEditing = editingId === r.id;

              return (
                <div
                  key={r.id}
                  className={`p-5 transition-colors ${
                    r.is_visible ? 'bg-white hover:bg-neutral-50/50' : 'bg-neutral-50/80 opacity-60'
                  }`}
                >
                  {isEditing ? (
                    /* Inline Edit Form */
                    <div className="space-y-4 bg-[#FAF9F6] p-5 border border-neutral-300 rounded-xs">
                      <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-800">
                          Edit Review
                        </span>
                        {/* Rating in edit mode */}
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setEditRating(star)}
                              className="p-0.5"
                            >
                              <Star
                                className={`w-4 h-4 ${
                                  star <= editRating
                                    ? 'text-[#FF55D2] fill-[#FF55D2]'
                                    : 'text-neutral-300 fill-neutral-100'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                            Customer Name
                          </label>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-neutral-300 text-xs rounded-xs focus:outline-none focus:border-[#FF55D2]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                            Avatar URL
                          </label>
                          <input
                            type="url"
                            value={editAvatarUrl}
                            onChange={(e) => setEditAvatarUrl(e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-neutral-300 text-xs rounded-xs focus:outline-none focus:border-[#FF55D2]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                            Location / City
                          </label>
                          <input
                            type="text"
                            value={editLocation}
                            onChange={(e) => setEditLocation(e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-neutral-300 text-xs rounded-xs focus:outline-none focus:border-[#FF55D2]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                            Garment Tag
                          </label>
                          <input
                            type="text"
                            value={editTag}
                            onChange={(e) => setEditTag(e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-neutral-300 text-xs rounded-xs focus:outline-none focus:border-[#FF55D2]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-neutral-600 font-semibold mb-1">
                          Testimonial Text
                        </label>
                        <textarea
                          rows={2}
                          value={editComment}
                          onChange={(e) => setEditComment(e.target.value)}
                          className="w-full p-2.5 bg-white border border-neutral-300 text-xs rounded-xs focus:outline-none focus:border-[#FF55D2]"
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="w-full sm:w-auto min-h-[38px] px-4 py-1.5 text-xs border border-neutral-300 hover:bg-neutral-100 rounded-xs flex items-center justify-center active:scale-95"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(r.id)}
                          className="w-full sm:w-auto min-h-[38px] px-5 py-1.5 bg-[#FF55D2] hover:bg-[#FD00B9] text-white text-xs font-semibold rounded-xs active:scale-95 flex items-center justify-center shadow-xs"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Review Card Row */
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border border-neutral-200 bg-neutral-100 ring-2 ring-[#FF55D2]/20">
                          {r.avatar_url ? (
                            <Image
                              src={r.avatar_url}
                              alt={r.customer_name}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#FAF0F8] text-[#FF55D2] font-semibold text-xs">
                              {r.customer_name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-sans text-base font-medium text-[#1A1A1A]">
                              {r.customer_name}
                            </span>
                            {/* Stars */}
                            <div className="flex items-center gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < r.rating
                                      ? 'text-[#FF55D2] fill-[#FF55D2]'
                                      : 'text-neutral-300 fill-transparent'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                            {r.tag && <span className="text-neutral-600 font-medium">{r.tag}</span>}
                            {r.tag && r.location && <span>•</span>}
                            {r.location && <span>{r.location}</span>}
                          </div>

                          <p className="text-xs text-neutral-700 italic font-light max-w-2xl mt-1 line-clamp-2">
                            "{r.comment}"
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0 pt-1 sm:pt-0">
                        {/* Visibility Toggle */}
                        <button
                          type="button"
                          onClick={() => handleToggleVisibility(r.id)}
                          className={`w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center border rounded-xs transition-colors active:scale-90 ${
                            r.is_visible
                              ? 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                              : 'border-neutral-300 text-neutral-400 hover:bg-neutral-200'
                          }`}
                          title={r.is_visible ? 'Visible on Marquee' : 'Hidden from Marquee'}
                        >
                          {r.is_visible ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </button>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => startEdit(r)}
                          className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center border border-neutral-200 rounded-xs hover:bg-neutral-100 text-neutral-600 active:scale-90 transition-transform"
                          title="Edit review"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteReview(r.id)}
                          className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center border border-neutral-200 rounded-xs hover:bg-red-50 text-neutral-400 hover:text-red-600 active:scale-90 transition-transform"
                          title="Delete review"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
