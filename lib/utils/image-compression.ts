/**
 * Client-Side Image Compression Utility
 * 
 * Automatically scales down high-resolution device photos (often 5MB - 20MB from cameras)
 * to web-optimized dimensions, converts to modern WebP (or high-efficiency JPEG),
 * and compresses file sizes by up to 90-97% before network transmission.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0 (default: 0.82)
  outputFormat?: 'image/webp' | 'image/jpeg' | 'image/png';
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
 * Compresses an image file in the browser using HTML5 Canvas.
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.82,
    outputFormat = 'image/webp',
  } = options;

  return new Promise((resolve, reject) => {
    // If not an image, reject
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not an image.'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image in browser.'));
      img.onload = () => {
        let { width, height } = img;

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

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error('Canvas compression returned empty blob.'));
            }

            // Derive new filename with appropriate extension
            const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
            const ext = targetFormat === 'image/webp' ? 'webp' : 'jpg';
            const compressedFilename = `${baseName}.${ext}`;

            const compressedFile = new File([blob], compressedFilename, {
              type: targetFormat,
              lastModified: Date.now(),
            });

            const originalSize = file.size;
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
            });
          },
          targetFormat,
          quality
        );
      };

      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
}
