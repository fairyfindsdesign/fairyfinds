'use client';

import React, { useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { CustomerReview } from '@/lib/types';

interface ReviewsMarqueeProps {
  reviews?: CustomerReview[];
  heading?: string;
  subtitle?: string;
  description?: string;
  badge?: string;
}

export default function ReviewsMarquee({
  heading = 'Loved by Our Customers',
  subtitle,
  description = 'Real stories and 5-star Google reviews from customers celebrating their special moments in our outfits.',
  badge,
}: ReviewsMarqueeProps) {
  const badgeLabel = badge || subtitle || 'Google Reviews • 4.9 ★ Rating';
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const embedId = '25715388';
    const scriptSrc = 'https://widgets.sociablekit.com/google-reviews/widget.js';

    // 1. Intercept fetch for the SociableKit feed to guarantee smooth continuous movement (marquee)
    if (typeof window !== 'undefined') {
      const win = window as any;

      if (!win.__skFetchIntercepted) {
        win.__skFetchIntercepted = true;
        const originalFetch = win.fetch;
        win.fetch = async function (...args: any[]) {
          const url = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url) || '';
          if (typeof url === 'string' && url.includes(embedId)) {
            try {
              const res = await originalFetch.apply(this, args);
              const clone = res.clone();
              const json = await clone.json();
              if (json && json.settings) {
                // Activate SociableKit's native continuous smooth carousel movement
                json.settings.smooth_carousel_movement = 1;
                json.settings.autoplay = 1;
                json.settings.delay = 1.2;
              }
              return new Response(JSON.stringify(json), {
                status: res.status,
                statusText: res.statusText,
                headers: res.headers,
              });
            } catch {
              return originalFetch.apply(this, args);
            }
          }
          return originalFetch.apply(this, args);
        };
      }

      // Pre-populate sk_embed_feed promise with continuous marquee flags
      win.sk_embed_feed = win.sk_embed_feed || {};
      win.sk_embed_feed[embedId] = fetch(`https://data.accentapi.com/feed/${embedId}.json?nocache=${Date.now()}`)
        .then((r: Response) => (r.ok ? r.json() : null))
        .then((data: any) => {
          if (data && data.settings) {
            data.settings.smooth_carousel_movement = 1;
            data.settings.autoplay = 1;
            data.settings.delay = 1.2;
          }
          return data;
        })
        .catch(() => null);

      // Re-trigger mount if widget script was already loaded
      if (win.sk_widget_mounts && typeof win.sk_widget_mounts['.sk-ww-google-reviews'] === 'function') {
        win.sk_widget_mounts['.sk-ww-google-reviews']();
        return;
      }
    }

    // 2. Ensure widget script is injected into document
    const existingScript = document.querySelector(`script[src^="${scriptSrc}"]`);
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = scriptSrc;
      script.defer = true;
      document.body.appendChild(script);
    } else {
      const el = document.querySelector('.sk-ww-google-reviews');
      if (el && el.children.length === 0 && !el.shadowRoot) {
        existingScript.remove();
        const script = document.createElement('script');
        script.src = `${scriptSrc}?v=${Date.now()}`;
        script.defer = true;
        document.body.appendChild(script);
      }
    }
  }, []);

  return (
    <section className="py-14 sm:py-20 md:py-28 bg-[#FFFFFF] border-b border-neutral-200 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 md:mb-16">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 bg-[#FAF9F6] border border-neutral-200 text-[10px] sm:text-xs uppercase tracking-widest font-semibold text-neutral-800 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#FF55D2]" />
            <span>{badgeLabel}</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#1A1A1A] font-light tracking-tight">
            {heading}
          </h2>
        </div>

        {/* Infinite Marquee Track Framing with Left/Right Editorial Fade Masks */}
        <div className="relative w-full overflow-hidden" ref={containerRef}>
          {/* Subtle Fade Overlays for Seamless Infinite Marquee Illusion */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 sm:w-16 md:w-28 bg-gradient-to-r from-white via-white/80 to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-16 md:w-28 bg-gradient-to-l from-white via-white/80 to-transparent z-10" />

          {/* SociableKit Live Google Reviews Widget Embed */}
          <div className="w-full min-h-[380px]">
            {/* Early inline script to guarantee feed pre-configuration before widget.js loads */}
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  (function() {
                    try {
                      var id = '25715388';
                      window.sk_embed_feed = window.sk_embed_feed || {};
                      if (!window.sk_embed_feed[id]) {
                        window.sk_embed_feed[id] = fetch('https://data.accentapi.com/feed/' + id + '.json?nocache=' + Date.now())
                          .then(function(r) { return r.ok ? r.json() : null; })
                          .then(function(d) {
                            if (d && d.settings) {
                              d.settings.smooth_carousel_movement = 1;
                              d.settings.autoplay = 1;
                              d.settings.delay = 1.2;
                            }
                            return d;
                          }).catch(function() { return null; });
                      }
                    } catch(e) {}
                  })();
                `,
              }}
            />
            <div className="sk-ww-google-reviews" data-embed-id="25715388" />
            <script src="https://widgets.sociablekit.com/google-reviews/widget.js" defer></script>
          </div>
        </div>

        {/* Interactive Helper Subtext */}
        <div className="text-center mt-6">
          <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-medium">
            Hover to pause • Drag to glide
          </span>
        </div>
      </div>
    </section>
  );
}
