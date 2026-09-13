'use client';

import { useEffect } from 'react';

/**
 * DynamicFavicon ensures the browser tab favicon updates seamlessly
 * between Light Mode (black logo) and Dark Mode (white logo),
 * reacting in real-time to system/browser theme changes.
 */
export default function DynamicFavicon() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateFavicon = (isDark: boolean) => {
      const targetHref = isDark ? '/favicon-dark.png' : '/favicon-light.png';

      // Find all existing rel="icon" and rel="shortcut icon" links
      const existingIcons = document.querySelectorAll<HTMLLinkElement>(
        "link[rel='icon'], link[rel='shortcut icon']"
      );

      if (existingIcons.length > 0) {
        existingIcons.forEach((link) => {
          // If the link is media-specific, ensure the matching one is prioritized
          const media = link.getAttribute('media');
          if (!media) {
            link.href = targetHref;
          } else if (
            (isDark && media.includes('dark')) ||
            (!isDark && media.includes('light'))
          ) {
            link.href = targetHref;
          }
        });
      }

      // Also ensure or update a primary dynamic favicon link for immediate browser tab update
      let dynamicLink = document.querySelector<HTMLLinkElement>(
        "link[data-dynamic-favicon='true']"
      );

      if (!dynamicLink) {
        dynamicLink = document.createElement('link');
        dynamicLink.rel = 'icon';
        dynamicLink.type = 'image/png';
        dynamicLink.setAttribute('data-dynamic-favicon', 'true');
        document.head.appendChild(dynamicLink);
      }

      dynamicLink.href = targetHref;
    };

    // Apply on mount based on initial browser theme preference
    updateFavicon(mediaQuery.matches);

    // Listen for live system / browser theme toggles
    const handleChange = (e: MediaQueryListEvent) => {
      updateFavicon(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return null;
}
