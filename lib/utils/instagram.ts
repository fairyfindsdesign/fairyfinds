/**
 * Utility functions for parsing and embedding Instagram Reels and Posts.
 */

export interface InstagramMediaInfo {
  type: 'reel' | 'post' | 'tv';
  shortcode: string;
  embedUrl: string;
  permalink: string;
  isReel: boolean;
}

/**
 * Parses an Instagram URL, share link, or pasted embed code into structured media info.
 */
export function parseInstagramUrl(input: string | null | undefined): InstagramMediaInfo | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Regex to extract media type (reel, reels, p, tv) and shortcode (alphanumeric, underscores, hyphens)
  // Handles:
  // - https://www.instagram.com/reel/C_xyz123/
  // - https://instagram.com/p/C_xyz123/?igsh=...
  // - https://www.instagram.com/reels/C_xyz123/
  // - https://www.instagram.com/username/reel/C_xyz123/
  // - Raw HTML embeds with data-instgrm-permalink or src
  const match = trimmed.match(
    /(?:instagram\.com|instagr\.am)\/(?:[^/]+\/)?(reel|reels|p|tv)\/([A-Za-z0-9_-]+)/i
  );

  if (!match) return null;

  const rawType = match[1].toLowerCase();
  const shortcode = match[2];
  const type: 'reel' | 'post' | 'tv' = rawType.startsWith('reel') ? 'reel' : rawType === 'tv' ? 'tv' : 'post';
  const isReel = type === 'reel';

  // In Instagram embed iframes, both /reel/ and /p/ shortcodes work under /p/ or /reel/
  // Standard embed path: https://www.instagram.com/p/{shortcode}/embed/ or /reel/{shortcode}/embed/
  const embedType = isReel ? 'reel' : 'p';
  const embedUrl = `https://www.instagram.com/${embedType}/${shortcode}/embed/`;
  const permalink = `https://www.instagram.com/${embedType}/${shortcode}/`;

  return {
    type,
    shortcode,
    embedUrl,
    permalink,
    isReel,
  };
}

/**
 * Validates if an input string is a recognizable Instagram Reel or Post.
 */
export function isValidInstagramUrl(input: string | null | undefined): boolean {
  return parseInstagramUrl(input) !== null;
}
