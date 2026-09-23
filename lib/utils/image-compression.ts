/**
 * Client-Side Image Compression Utility
 * 
 * Automatically scales down high-resolution device photos (often 5MB - 20MB from cameras)
 * to web-optimized dimensions, converts Apple HEIC/HEIF and other formats to modern WebP,
 * and compresses file sizes by up to 90-97% before network transmission.
 */

export const CAROUSEL_COMPRESSION_THRESHOLD_BYTES = 4 * 1024 * 1024; // 4MB (4,194,304 bytes)

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0 (default: 0.80 for 80% quality)
  outputFormat?: 'image/webp' | 'image/jpeg' | 'image/png';
  minSizeToCompress?: number; // Minimum file size in bytes to trigger compression
  targetMaxRatio?: number; // Max size ratio vs original (default: 0.80 for 80% of original size)
  isCarousel?: boolean; // When true: images under 4MB preserve original quality; 4MB+ are compressed
}

export interface CompressionResult {
  file: File;
  blob: Blob;
  previewUrl: string;
  originalSize: number;
  compressedSize: number;
  savingsPercent: number;
  width: number;
  height: number;
  format: string;
  wasCompressed: boolean;
  wasHeic?: boolean;
}

/**
 * Format raw bytes into human readable string (e.g. 2.4 MB, 180 KB)
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Inspects file MIME type and magic bytes to detect if a file is already a
 * browser-readable format (JPEG, PNG, WebP, GIF).
 * This prevents unnecessary/failing conversion when iOS or desktop browsers
 * automatically convert a HEIC photo to JPEG during file input selection while
 * keeping the original .heic filename.
 */
export async function getBrowserReadableType(file: File): Promise<string | null> {
  const type = (file.type || '').toLowerCase();
  if (
    type === 'image/jpeg' ||
    type === 'image/jpg' ||
    type === 'image/png' ||
    type === 'image/webp' ||
    type === 'image/gif'
  ) {
    return type === 'image/jpg' ? 'image/jpeg' : type;
  }

  try {
    const slice = file.slice(0, 16);
    const buffer = await slice.arrayBuffer();
    const arr = new Uint8Array(buffer);
    if (arr.length >= 3) {
      // JPEG: FF D8 FF
      if (arr[0] === 0xff && arr[1] === 0xd8 && arr[2] === 0xff) {
        return 'image/jpeg';
      }
      // PNG: 89 50 4E 47
      if (arr.length >= 4 && arr[0] === 0x89 && arr[1] === 0x50 && arr[2] === 0x4e && arr[3] === 0x47) {
        return 'image/png';
      }
      // GIF: 47 49 46 38 ("GIF8")
      if (arr.length >= 4 && arr[0] === 0x47 && arr[1] === 0x49 && arr[2] === 0x46 && arr[3] === 0x38) {
        return 'image/gif';
      }
      // WebP: RIFF .... WEBP
      if (
        arr.length >= 12 &&
        arr[0] === 0x52 && arr[1] === 0x49 && arr[2] === 0x46 && arr[3] === 0x46 &&
        arr[8] === 0x57 && arr[9] === 0x45 && arr[10] === 0x42 && arr[11] === 0x50
      ) {
        return 'image/webp';
      }
    }
  } catch {
    // If arrayBuffer reading fails, fall through gracefully
  }

  return null;
}

/**
 * Detects whether a file is an Apple HEIC or HEIF format.
 * Checks both MIME types and file extensions (case-insensitive) because desktop browsers
 * (e.g. Windows Chrome, Edge) often report an empty string for file.type on .heic files.
 */
export function isHeicFile(file: File): boolean {
  if (!file) return false;
  const name = file.name || '';
  const type = (file.type || '').toLowerCase();
  const isMime = type.includes('heic') || type.includes('heif');
  const isExt = /\.hei[cf]$/i.test(name);
  return isMime || isExt;
}

/**
 * Converts an Apple HEIC/HEIF file into a standard web-compatible JPEG File
 * using client-side WebAssembly / libheif in the browser.
 * 
 * Includes automatic detection and fallback for photos that are already browser readable
 * (e.g. when iOS photo picker auto-transcodes to JPEG on file select).
 */
export async function convertHeicToJpeg(file: File, quality = 0.92): Promise<File> {
  if (typeof window === 'undefined') {
    throw new Error('HEIC conversion can only be performed in browser environment.');
  }

  // 1. Fast-path: check if file is already a browser-readable format (JPEG, PNG, WebP)
  const existingType = await getBrowserReadableType(file);
  if (existingType) {
    const baseName = file.name.replace(/\.hei[cf]$/i, '') || 'photo';
    const ext = existingType === 'image/png' ? 'png' : existingType === 'image/webp' ? 'webp' : 'jpg';
    return new File([file], `${baseName}.${ext}`, {
      type: existingType,
      lastModified: file.lastModified || Date.now(),
    });
  }

  // 2. Decode HEIC using WebAssembly / heic2any with graceful catch for ERR_USER
  try {
    const { default: heic2any } = await import('heic2any');
    const result = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality,
    });

    const blob = Array.isArray(result) ? result[0] : result;
    const baseName = file.name.replace(/\.hei[cf]$/i, '') || 'photo';
    const newFilename = `${baseName}.jpg`;

    return new File([blob], newFilename, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });
  } catch (err: any) {
    const msg = String(err?.message || err || '');
    // If heic2any reports the image is already browser readable, normalize and return it cleanly
    if (msg.includes('already browser readable') || msg.includes('ERR_USER')) {
      const match = msg.match(/image\/[a-z0-9+-]+/i);
      const fallbackType = match ? match[0] : 'image/jpeg';
      const baseName = file.name.replace(/\.hei[cf]$/i, '') || 'photo';
      const ext = fallbackType === 'image/png' ? 'png' : fallbackType === 'image/webp' ? 'webp' : 'jpg';
      return new File([file], `${baseName}.${ext}`, {
        type: fallbackType,
        lastModified: file.lastModified || Date.now(),
      });
    }
    throw err;
  }
}

/**
 * Compresses an image file in the browser using HTML5 Canvas with full HEIC/HEIF support.
 * 
 * Rules:
 * 1. Carousel Exception: If options.isCarousel is true and the image size is under 4MB (< 4,194,304 bytes),
 *    compression is bypassed to preserve full editorial fidelity.
 *    If it is an Apple HEIC file, it is converted to high-quality JPEG (quality: 0.95) without downscaling.
 * 2. Carousel 4MB+ & Every Other Upload:
 *    All non-carousel uploads (products, reviews, categories, etc.) and carousel images >= 4MB are compressed
 *    at 80% quality to WebP and ensure file size is at most 80% of original.
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.80, // 80% quality
    outputFormat = 'image/webp',
    isCarousel = false,
    minSizeToCompress = isCarousel ? CAROUSEL_COMPRESSION_THRESHOLD_BYTES : 0,
    targetMaxRatio = 0.80, // Max 80% of original size
  } = options;

  const isHeic = isHeicFile(file);

  // Validate format
  if (!file.type.startsWith('image/') && !isHeic) {
    throw new Error('Selected file is not a supported image format.');
  }

  const originalSize = file.size;

  // If it's a HEIC file, convert it to a standard JPEG working file first
  let workingFile: File = file;
  if (isHeic) {
    // For carousel exception, use 0.95 quality to preserve premium fidelity
    workingFile = await convertHeicToJpeg(file, isCarousel ? 0.95 : 0.92);
  }

  // EXCEPTION RULE:
  // For carousel uploads: if originalSize < 4MB, skip compression!
  // For non-carousel uploads: compress all uploads (minSizeToCompress defaults to 0).
  const shouldSkipCompression = isCarousel
    ? originalSize < minSizeToCompress
    : minSizeToCompress > 0 && originalSize <= minSizeToCompress;

  if (shouldSkipCompression) {
    const finalFile = workingFile;
    const previewUrl = URL.createObjectURL(finalFile);

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          file: finalFile,
          blob: finalFile,
          previewUrl,
          originalSize,
          compressedSize: finalFile.size,
          savingsPercent: isHeic && finalFile.size < originalSize
            ? Math.round(((originalSize - finalFile.size) / originalSize) * 100)
            : 0,
          width: img.naturalWidth || img.width,
          height: img.naturalHeight || img.height,
          format: finalFile.type || 'image/jpeg',
          wasCompressed: false,
          wasHeic: isHeic,
        });
      };
      img.onerror = () => {
        resolve({
          file: finalFile,
          blob: finalFile,
          previewUrl,
          originalSize,
          compressedSize: finalFile.size,
          savingsPercent: 0,
          width: 0,
          height: 0,
          format: finalFile.type || 'image/jpeg',
          wasCompressed: false,
          wasHeic: isHeic,
        });
      };
      img.src = previewUrl;
    });
  }

  // COMPRESSION RULE:
  // Carousel images >= 4MB and all other non-carousel uploads are compressed with 80% quality to WebP
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(workingFile);
    const img = new Image();

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image in browser for compression.'));
    };

    img.onload = () => {
      const originalWidth = img.naturalWidth || img.width;
      const originalHeight = img.naturalHeight || img.height;
      URL.revokeObjectURL(objectUrl);

      let width = originalWidth;
      let height = originalHeight;

      // Calculate scaling preserving aspect ratio
      if (width > maxWidth || height > maxHeight) {
        const widthRatio = maxWidth / width;
        const heightRatio = maxHeight / height;
        const scale = Math.min(widthRatio, heightRatio);

        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }

      // Draw onto HTML5 canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Failed to get 2D canvas context.'));
      }

      // Apply smooth interpolation
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Draw image
      ctx.drawImage(img, 0, 0, width, height);

      // Check WebP support fallback
      let targetFormat = outputFormat;
      const testCanvas = document.createElement('canvas');
      testCanvas.width = 1;
      testCanvas.height = 1;
      if (!testCanvas.toDataURL('image/webp').startsWith('data:image/webp')) {
        targetFormat = 'image/jpeg';
      }

      const maxAllowedSize = Math.floor(originalSize * targetMaxRatio);

      const getBlob = (q: number): Promise<Blob | null> => {
        return new Promise((res) => {
          canvas.toBlob((b) => res(b), targetFormat, q);
        });
      };

      (async () => {
        try {
          let currentQuality = quality; // 0.80 (80% quality)
          let blob = await getBlob(currentQuality);

          if (!blob) {
            return reject(new Error('Canvas compression returned empty blob.'));
          }

          // If the blob exceeds 80% of original size, adjust quality / dimensions
          if (blob.size > maxAllowedSize) {
            const qualitySteps = [0.70, 0.60, 0.50];
            for (const qStep of qualitySteps) {
              if (blob.size <= maxAllowedSize) break;
              const nextBlob = await getBlob(qStep);
              if (nextBlob && nextBlob.size < blob.size) {
                blob = nextBlob;
                currentQuality = qStep;
              }
            }

            // If still over 80% of original size, downscale dimensions
            if (blob.size > maxAllowedSize && width > 400) {
              let scaleDown = 0.85;
              while (blob.size > maxAllowedSize && scaleDown >= 0.5) {
                const downCanvas = document.createElement('canvas');
                downCanvas.width = Math.round(width * scaleDown);
                downCanvas.height = Math.round(height * scaleDown);
                const downCtx = downCanvas.getContext('2d');
                if (downCtx) {
                  downCtx.imageSmoothingEnabled = true;
                  downCtx.imageSmoothingQuality = 'high';
                  downCtx.drawImage(canvas, 0, 0, downCanvas.width, downCanvas.height);
                  const scaledBlob: Blob | null = await new Promise((res) => {
                    downCanvas.toBlob((b) => res(b), targetFormat, currentQuality);
                  });
                  if (scaledBlob && scaledBlob.size < blob.size) {
                    blob = scaledBlob;
                    width = downCanvas.width;
                    height = downCanvas.height;
                  }
                }
                scaleDown -= 0.15;
              }
            }
          }

          // Safety guard: If compressed output is not smaller than original file,
          // and it's not a HEIC conversion (which must be web readable), keep the original file.
          if (blob.size >= originalSize && !isHeic) {
            return resolve({
              file: workingFile,
              blob: workingFile,
              previewUrl: URL.createObjectURL(workingFile),
              originalSize,
              compressedSize: originalSize,
              savingsPercent: 0,
              width: originalWidth,
              height: originalHeight,
              format: workingFile.type || 'image/jpeg',
              wasCompressed: false,
              wasHeic: false,
            });
          }

          // Derive new filename with appropriate extension
          const baseName = file.name.replace(/\.[^/.]+$/, '') || 'photo';
          const ext = targetFormat === 'image/webp' ? 'webp' : 'jpg';
          const compressedFilename = `${baseName}.${ext}`;

          const compressedFile = new File([blob], compressedFilename, {
            type: targetFormat,
            lastModified: Date.now(),
          });

          const compressedSize = blob.size;
          const savingsPercent = Math.max(
            0,
            Math.round(((originalSize - compressedSize) / originalSize) * 100)
          );

          const previewUrl = URL.createObjectURL(blob);

          resolve({
            file: compressedFile,
            blob,
            previewUrl,
            originalSize,
            compressedSize,
            savingsPercent,
            width,
            height,
            format: targetFormat,
            wasCompressed: true,
            wasHeic: isHeic,
          });
        } catch (err) {
          reject(err);
        }
      })();
    };

    img.src = objectUrl;
  });
}

