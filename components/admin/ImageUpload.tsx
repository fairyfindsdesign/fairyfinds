'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import {
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Trash2,
  RefreshCw,
  Link as LinkIcon,
  Sparkles,
  Camera,
  Star,
  ArrowLeft,
  ArrowRight,
  X,
  AlertCircle,
} from 'lucide-react';
import { compressImage, formatBytes, CompressionResult } from '@/lib/utils/image-compression';

interface SingleImageUploadProps {
  multiple?: false;
  value?: string;
  onChange: (url: string) => void;
  values?: never;
  onMultiChange?: never;
  label?: string;
  helperText?: string;
  aspectRatio?: string; // e.g. 'aspect-[3/4]', 'aspect-[16/9]', 'aspect-square'
  isAvatar?: boolean;
  maxWidth?: number;
  maxHeight?: number;
}

interface MultiImageUploadProps {
  multiple: true;
  values: string[];
  onMultiChange: (urls: string[]) => void;
  value?: never;
  onChange?: never;
  label?: string;
  helperText?: string;
  aspectRatio?: string;
  isAvatar?: boolean;
  maxWidth?: number;
  maxHeight?: number;
}

export type ImageUploadProps = SingleImageUploadProps | MultiImageUploadProps;

export default function ImageUpload(props: ImageUploadProps) {
  const {
    multiple = false,
    value = '',
    onChange,
    values = [],
    onMultiChange,
    label = 'Upload Photo',
    helperText = 'Select or drag photos from your device. Images over 1MB are automatically compressed to 70% size (WebP) before uploading.',
    aspectRatio = 'aspect-[3/4]',
    isAvatar = false,
    maxWidth = 1600,
    maxHeight = 1600,
  } = props;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [compressionStats, setCompressionStats] = useState<CompressionResult | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    if (files.length === 0) {
      setErrorMessage('Please select a valid image file (JPEG, PNG, WebP, etc.).');
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);

    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const isOver1MB = file.size > 1024 * 1024;
        setProcessingStatus(
          isOver1MB
            ? files.length > 1
              ? `Compressing image ${i + 1} of ${files.length} (${formatBytes(file.size)} > 1MB)...`
              : `Compressing image (${formatBytes(file.size)} > 1MB)...`
            : files.length > 1
              ? `Uploading image ${i + 1} of ${files.length} (${formatBytes(file.size)} <= 1MB)...`
              : `Uploading image (${formatBytes(file.size)} <= 1MB)...`
        );

        // 1. Client-side compression (only for files > 1MB, compressed at 70% quality to max 70% size)
        const compression = await compressImage(file, {
          maxWidth,
          maxHeight,
          quality: 0.70,
          minSizeToCompress: 1024 * 1024,
          targetMaxRatio: 0.70,
          outputFormat: 'image/webp',
        });

        setCompressionStats(compression);
        if (compression.wasCompressed) {
          setProcessingStatus(
            `Uploading compressed image (${formatBytes(compression.compressedSize)} - ${compression.savingsPercent}% saved)...`
          );
        } else {
          setProcessingStatus(
            `Uploading original image (${formatBytes(file.size)} - under 1MB)...`
          );
        }

        // 2. Upload to server/Supabase
        const formData = new FormData();
        formData.append('file', compression.file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Upload failed with status ${res.status}`);
        }

        const data = await res.json();
        if (!data.success || !data.url) {
          throw new Error(data.error || 'Server did not return image URL.');
        }

        uploadedUrls.push(data.url);
      }

      // Update state
      if (multiple && onMultiChange) {
        onMultiChange([...values, ...uploadedUrls]);
      } else if (!multiple && onChange && uploadedUrls[0]) {
        onChange(uploadedUrls[0]);
      }

      setProcessingStatus('Upload complete!');
      setTimeout(() => {
        setIsProcessing(false);
        setProcessingStatus('');
      }, 1500);
    } catch (err: any) {
      console.error('Error during image compression/upload:', err);
      setErrorMessage(err.message || 'Failed to compress and upload photo.');
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleManualUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualUrl.trim()) return;

    if (multiple && onMultiChange) {
      onMultiChange([...values, manualUrl.trim()]);
    } else if (!multiple && onChange) {
      onChange(manualUrl.trim());
    }

    setManualUrl('');
    setShowUrlInput(false);
  };

  const handleRemoveSingle = () => {
    if (!multiple && onChange) {
      onChange('');
      setCompressionStats(null);
    }
  };

  const handleRemoveMulti = (index: number) => {
    if (multiple && onMultiChange) {
      const next = values.filter((_, i) => i !== index);
      onMultiChange(next);
    }
  };

  const handleSetPrimaryMulti = (index: number) => {
    if (multiple && onMultiChange && index > 0) {
      const target = values[index];
      const remaining = values.filter((_, i) => i !== index);
      onMultiChange([target, ...remaining]);
    }
  };

  const handleMoveMulti = (fromIndex: number, direction: -1 | 1) => {
    if (!multiple || !onMultiChange) return;
    const toIndex = fromIndex + direction;
    if (toIndex < 0 || toIndex >= values.length) return;
    const next = [...values];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    onMultiChange(next);
  };

  const currentSingle = !multiple ? value : '';
  const currentList = multiple ? values : currentSingle ? [currentSingle] : [];

  return (
    <div className="space-y-3">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-800">
            {label}
          </label>
          <p className="text-[11px] text-neutral-500 font-light mt-0.5">{helperText}</p>
        </div>

        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] text-neutral-600 hover:text-[#FF55D2] transition-colors self-start sm:self-auto flex items-center gap-1 font-medium underline underline-offset-2 cursor-pointer"
        >
          <LinkIcon className="w-3 h-3" />
          <span>{showUrlInput ? 'Hide URL field' : 'Or paste web image URL'}</span>
        </button>
      </div>

      {/* Manual URL Input Dropdown */}
      {showUrlInput && (
        <form onSubmit={handleManualUrlSubmit} className="flex gap-2 animate-in fade-in duration-200">
          <input
            type="url"
            placeholder="https://images.unsplash.com/... or direct image URL"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            className="flex-1 px-3 py-2 bg-white border border-neutral-300 text-xs rounded-xs focus:outline-none focus:border-[#FF55D2]"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#FF55D2] text-white text-xs font-semibold rounded-xs transition-colors shadow-xs shrink-0"
          >
            Apply URL
          </button>
        </form>
      )}

      {/* Hidden Device File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
          }
          // Reset input value so re-selecting same file triggers onChange
          if (fileInputRef.current) fileInputRef.current.value = '';
        }}
      />

      {/* Error Message */}
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-700 flex items-center justify-between rounded-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-red-400 hover:text-red-700 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Compression & Upload Progress Indicator */}
      {isProcessing && (
        <div className="p-3.5 bg-pink-50/80 border border-pink-200/80 rounded-xs space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-semibold text-[#FF55D2]">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-[#FF55D2]" />
              <span>{processingStatus || 'Processing image...'}</span>
            </div>
          </div>
          {compressionStats && (
            <div className="flex items-center gap-2 text-[11px] text-neutral-600 bg-white/80 px-2.5 py-1.5 rounded-xs border border-pink-100 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-[#FF55D2] shrink-0" />
              {compressionStats.wasCompressed ? (
                <span>
                  {formatBytes(compressionStats.originalSize)} ➔ {formatBytes(compressionStats.compressedSize)}{' '}
                  <strong className="text-emerald-700">({compressionStats.savingsPercent}% smaller)</strong> •{' '}
                  {compressionStats.width}×{compressionStats.height} WebP (70% quality)
                </span>
              ) : (
                <span>
                  {formatBytes(compressionStats.originalSize)} • Preserved original (under 1MB, compression bypassed)
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Upload Drop Zone & Previews */}
      {/* CASE 1: Single Mode with Existing Image */}
      {!multiple && currentSingle ? (
        <div className="p-4 bg-neutral-50/60 border border-neutral-200 rounded-xs space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div
              className={`relative ${aspectRatio} ${
                isAvatar ? 'w-20 h-20 rounded-full' : 'w-28 sm:w-36 rounded-xs'
              } bg-neutral-100 border border-neutral-300 overflow-hidden shrink-0 shadow-xs`}
            >
              <Image
                src={currentSingle}
                alt="Uploaded asset"
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold uppercase tracking-wider rounded-xs">
                  <CheckCircle2 className="w-3 h-3" />
                  Active Image
                </span>
                {compressionStats && (
                  <span className="text-[10px] font-mono text-neutral-500">
                    {formatBytes(compressionStats.compressedSize)} ({compressionStats.wasCompressed ? 'WebP 70%' : 'Original'})
                  </span>
                )}
              </div>
              <p className="text-[11px] font-mono text-neutral-500 truncate max-w-md">
                {currentSingle}
              </p>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  className="min-h-[34px] px-3 py-1 bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-300 text-xs font-medium rounded-xs transition-colors flex items-center gap-1.5 active:scale-95 shadow-xs"
                >
                  <Camera className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Replace Photo</span>
                </button>

                <button
                  type="button"
                  onClick={handleRemoveSingle}
                  disabled={isProcessing}
                  className="min-h-[34px] px-3 py-1 bg-white hover:bg-red-50 text-neutral-500 hover:text-red-600 border border-neutral-300 text-xs font-medium rounded-xs transition-colors flex items-center gap-1.5 active:scale-95 shadow-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* CASE 2: Multi Mode Existing Gallery */}
      {multiple && values.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] text-neutral-500">
            <span className="uppercase tracking-wider font-semibold text-neutral-700">
              Gallery Photos ({values.length})
            </span>
            <span>First photo is the primary storefront cover</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {values.map((imgUrl, idx) => {
              const isPrimary = idx === 0;
              return (
                <div
                  key={`${imgUrl}-${idx}`}
                  className={`group relative ${aspectRatio} bg-neutral-100 border rounded-xs overflow-hidden shadow-xs transition-all ${
                    isPrimary ? 'border-[#FF55D2] ring-2 ring-[#FF55D2]/30' : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <Image
                    src={imgUrl}
                    alt={`Product photo ${idx + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />

                  {/* Primary Badge */}
                  {isPrimary && (
                    <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-[#FF55D2] text-white text-[9px] uppercase tracking-wider font-bold rounded-xs shadow-xs">
                      Cover
                    </span>
                  )}

                  {/* Hover Actions Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveMulti(idx)}
                        className="p-1 bg-white/90 hover:bg-red-600 text-neutral-700 hover:text-white rounded-xs transition-colors shadow-xs"
                        title="Delete photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveMulti(idx, -1)}
                          className="p-1 bg-white/90 hover:bg-white text-neutral-700 disabled:opacity-30 rounded-xs transition-colors"
                          title="Move left"
                        >
                          <ArrowLeft className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === values.length - 1}
                          onClick={() => handleMoveMulti(idx, 1)}
                          className="p-1 bg-white/90 hover:bg-white text-neutral-700 disabled:opacity-30 rounded-xs transition-colors"
                          title="Move right"
                        >
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>

                      {!isPrimary && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryMulti(idx)}
                          className="px-1.5 py-1 bg-[#FF55D2] text-white text-[9px] uppercase font-semibold rounded-xs transition-colors flex items-center gap-0.5"
                          title="Make primary cover photo"
                        >
                          <Star className="w-2.5 h-2.5 fill-white" />
                          <span>Cover</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DROP ZONE (Always shown in multi mode, or in single mode when empty) */}
      {(multiple || !currentSingle) && (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed p-6 sm:p-8 rounded-xs text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-[#FF55D2] bg-[#FF55D2]/5 scale-[0.99]'
              : 'border-neutral-300 hover:border-[#FF55D2] bg-neutral-50/50 hover:bg-neutral-50'
          }`}
        >
          <div className="flex flex-col items-center justify-center space-y-2.5">
            <div className="w-12 h-12 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-neutral-600 group-hover:text-[#FF55D2] shadow-xs">
              <Upload className="w-5 h-5 text-[#FF55D2]" />
            </div>

            <div>
              <p className="text-xs font-semibold text-[#1A1A1A]">
                Click to browse from device or drag photos here
              </p>
              <p className="text-[11px] text-neutral-500 font-light mt-0.5">
                Camera roll, high-res photos, or screenshots (JPEG, PNG, WebP)
              </p>
            </div>

            <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-neutral-200 rounded-xs text-[10px] uppercase font-mono text-neutral-500 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#FF55D2]" />
              <span>Smart WebP compression (images &gt; 1MB compressed to 70% size)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
