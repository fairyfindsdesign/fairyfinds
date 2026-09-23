'use client';

import React, { useState, useEffect } from 'react';
import { parseInstagramUrl } from '@/lib/utils/instagram';
import { InstagramIcon } from '@/components/ui/Icons';
import { ExternalLink, Loader2, Sparkles } from 'lucide-react';

interface InstagramEmbedProps {
  url: string;
  className?: string;
  aspectRatio?: 'reel' | 'post' | 'auto';
  captioned?: boolean;
  title?: string;
  allowScroll?: boolean;
}

/**
 * Loads Instagram's official embeds.js as a singleton.
 */
let scriptPromise: Promise<void> | null = null;
function loadInstagramScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if ((window as any).instgrm) return Promise.resolve();

  if (!scriptPromise) {
    scriptPromise = new Promise((resolve) => {
      const existingScript = document.getElementById('instagram-embed-script');
      if (existingScript) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.id = 'instagram-embed-script';
      script.src = 'https://www.instagram.com/embed.js';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if ((window as any).instgrm) {
          (window as any).instgrm.Embeds.process();
        }
        resolve();
      };
      script.onerror = () => resolve();
      document.body.appendChild(script);
    });
  }
  return scriptPromise;
}

export default function InstagramEmbed({
  url,
  className = '',
  aspectRatio = 'auto',
  captioned = false,
  title = 'Instagram Reel',
  allowScroll = false,
}: InstagramEmbedProps) {
  const [isLoading, setIsLoading] = useState(true);
  const mediaInfo = parseInstagramUrl(url);

  useEffect(() => {
    loadInstagramScript().then(() => {
      if ((window as any).instgrm) {
        (window as any).instgrm.Embeds.process();
      }
    });
  }, [url]);

  if (!mediaInfo) {
    return (
      <div
        className={`w-full h-full min-h-[360px] bg-gradient-to-br from-neutral-900 via-neutral-950 to-black text-white p-6 flex flex-col items-center justify-center text-center space-y-3 rounded-xs border border-neutral-800 ${className}`}
      >
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#FD00B9] via-[#FF55D2] to-[#FF90E8] flex items-center justify-center text-white shadow-lg shadow-[#FF55D2]/30">
          <InstagramIcon className="w-6 h-6" />
        </div>
        <div className="space-y-1 max-w-xs">
          <p className="text-xs uppercase tracking-widest text-[#FF55D2] font-semibold">Fairy Finds Boutique</p>
          <p className="text-sm font-serif font-light text-neutral-200">
            {title || 'Instagram Creation'}
          </p>
          <p className="text-[11px] text-neutral-400">
            Follow our design journey and behind-the-scenes tailoring on Instagram.
          </p>
        </div>
        {url && (
          <a
            href={url.startsWith('http') ? url : `https://${url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 mt-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs uppercase tracking-wider font-semibold rounded-xs transition-colors"
          >
            <span>View on Instagram</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    );
  }

  const determinedRatio =
    aspectRatio === 'reel'
      ? 'aspect-[9/16]'
      : aspectRatio === 'post'
      ? 'aspect-[4/5]'
      : mediaInfo.isReel
      ? 'aspect-[9/16]'
      : 'aspect-[4/5]';

  return (
    <div className={`relative w-full overflow-hidden bg-neutral-900 rounded-xs ${determinedRatio} ${className}`}>
      {/* Loading Skeleton */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gradient-to-b from-neutral-900 to-black text-neutral-400 space-y-3 animate-pulse">
          <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-[#FF55D2]">
            <InstagramIcon className="w-5 h-5 animate-spin" />
          </div>
          <p className="text-[11px] tracking-wider uppercase text-neutral-500 font-medium">
            Loading {mediaInfo.isReel ? 'Reel' : 'Post'}...
          </p>
        </div>
      )}

      {/* Embedded Iframe */}
      <iframe
        src={`${mediaInfo.embedUrl}?captioned=${captioned ? '1' : '0'}`}
        className="w-full h-full border-0 absolute inset-0"
        title={title}
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        scrolling={allowScroll ? 'yes' : 'no'}
        loading="lazy"
        onLoad={() => setIsLoading(false)}
      />

      {/* Bottom overlay bar with direct Instagram link */}
      <div className="absolute bottom-2 right-2 z-20 pointer-events-auto">
        <a
          href={mediaInfo.permalink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/75 hover:bg-black text-white text-[10px] font-semibold uppercase tracking-wider rounded-xs backdrop-blur-xs transition-colors border border-white/10 shadow-xs"
          title="Open in Instagram"
        >
          <InstagramIcon className="w-3 h-3 text-[#FF55D2]" />
          <span>Instagram</span>
          <ExternalLink className="w-2.5 h-2.5 text-neutral-400" />
        </a>
      </div>
    </div>
  );
}
