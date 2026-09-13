import { Category, Product } from '@/lib/types';

export interface GenerateProductCodeParams {
  productName?: string;
  categoryId?: string;
  categoryName?: string;
  categories?: Category[];
  existingProducts?: Product[];
  currentProductId?: string;
  prefix?: string; // Default 'FF' for Fairy Finds
}

/**
 * Extracts a concise, standardized 2-4 letter uppercase abbreviation for a Category.
 */
export function getCategoryCode(categoryName?: string, categorySlug?: string): string {
  const combined = `${categorySlug || ''} ${categoryName || ''}`.toLowerCase().trim();
  
  if (combined.includes('saree') || combined.includes('sari')) return 'SAR';
  if (combined.includes('dress') || combined.includes('gown') || combined.includes('frock')) return 'DRS';
  if (combined.includes('blouse') || combined.includes('top') || combined.includes('shirt')) return 'TOP';
  if (combined.includes('lehenga') || combined.includes('lengha')) return 'LEH';
  if (combined.includes('kurti') || combined.includes('kurta') || combined.includes('suit')) return 'KRT';
  if (combined.includes('jewel') || combined.includes('earring') || combined.includes('necklace')) return 'JWL';
  if (combined.includes('bag') || combined.includes('clutch') || combined.includes('purse')) return 'BAG';
  if (combined.includes('shoe') || combined.includes('footwear') || combined.includes('sandal')) return 'SHOE';
  if (combined.includes('custom') || combined.includes('bespoke')) return 'CST';

  // Fallback: take first 3 alphanumeric characters of categoryName
  const clean = (categoryName || '').replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase();
  return clean.length >= 2 ? clean : 'PRD';
}

/**
 * Extracts a concise 2-4 letter uppercase identifier from the Product Name.
 * 
 * - Multi-word: Takes first letter of each significant word (e.g. "Crimson Silk Saree" -> "CSS")
 * - Single-word: Takes first 3-4 letters (e.g. "Anarkali" -> "ANAR")
 * - Empty / symbol-only: Returns "ITEM"
 */
export function getProductNameCode(productName?: string): string {
  const raw = (productName || '').trim();
  if (!raw) return 'ITEM';

  // Split into alphanumeric words
  const words = raw
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zA-Z0-9]/g, ''))
    .filter(Boolean);

  if (words.length === 0) return 'ITEM';

  if (words.length === 1) {
    const single = words[0].toUpperCase();
    return single.length <= 4 ? single : single.slice(0, 4);
  }

  // Multi-word: take initials of up to 4 words
  const initials = words
    .slice(0, 4)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  if (initials.length >= 2) {
    return initials;
  }

  return words[0].slice(0, 3).toUpperCase() || 'ITEM';
}

/**
 * Automatically generates a Unique Product ID combining:
 * 1. Store Brand Prefix (e.g. "FF")
 * 2. Category Code (e.g. "SAR", "DRS", "TOP", "LEH")
 * 3. Product Name Code (e.g. "CHKS", "BGTM", "ANAR")
 * 4. Sequential Number (e.g. "001", "002", "003")
 * 
 * Guarantees zero replication against all existing products in the store catalog.
 */
export function generateUniqueProductCode({
  productName,
  categoryId,
  categoryName,
  categories = [],
  existingProducts = [],
  currentProductId,
  prefix = 'FF',
}: GenerateProductCodeParams): string {
  // Resolve category details
  let resolvedCatName = categoryName;
  let resolvedCatSlug = '';
  if (categoryId && categories.length > 0) {
    const matched = categories.find((c) => c.id === categoryId);
    if (matched) {
      resolvedCatName = matched.name;
      resolvedCatSlug = matched.slug;
    }
  }

  const catCode = getCategoryCode(resolvedCatName, resolvedCatSlug);
  const nameCode = getProductNameCode(productName);
  const baseCode = `${prefix}-${catCode}-${nameCode}`.toUpperCase();

  // Collect all existing codes (excluding the product currently being edited)
  const usedCodes = new Set(
    existingProducts
      .filter((p) => p.id !== currentProductId && p.product_code)
      .map((p) => p.product_code.trim().toUpperCase())
  );

  // Find lowest available sequential number starting at 001
  for (let num = 1; num <= 999; num++) {
    const candidate = `${baseCode}-${String(num).padStart(3, '0')}`;
    if (!usedCodes.has(candidate)) {
      return candidate;
    }
  }

  // Safety fallback if > 999 items share the exact same base code
  for (let attempt = 0; attempt < 50; attempt++) {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const candidate = `${baseCode}-${randomNum}`;
    if (!usedCodes.has(candidate)) {
      return candidate;
    }
  }

  return `${baseCode}-${Date.now().toString().slice(-4)}`;
}
