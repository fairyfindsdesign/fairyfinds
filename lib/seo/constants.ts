export const SITE_URL = 'https://fairyfindsboutique.store';

export const BUSINESS_INFO = {
  name: 'Fairy Finds Boutique',
  legalName: 'Fairy Finds Boutique',
  alternateNames: ['Fairy Finds', 'Fairy Finds Boutique Kottayam'],
  description:
    'Fairy Finds Boutique is a women\'s fashion boutique based in Kottayam, Kerala, offering ready-to-wear dresses, Kurithis, sarees and custom-made outfits. The boutique ships across India.',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  telephone: '+916282629144',
  displayPhone: '+91 62826 29144',
  email: 'hello@fairyfindsboutique.com',
  address: {
    streetAddress: 'Neendoor',
    addressLocality: 'Kottayam',
    addressRegion: 'Kerala',
    postalCode: '686601',
    addressCountry: 'IN',
  },
  areaServed: [
    {
      '@type': 'State',
      name: 'Kerala',
    },
    {
      '@type': 'Country',
      name: 'India',
    },
  ],
  priceRange: '₹₹',
  currenciesAccepted: 'INR',
  paymentAccepted: 'Cash, UPI, Credit Card, Net Banking',
  instagram: 'https://instagram.com/fairyfinds.boutique',
  sameAs: [
    'https://instagram.com/fairyfinds.boutique',
  ],
};

export const DEFAULT_SEO = {
  title: 'Fairy Finds Boutique | Women\'s Fashion Boutique in Kottayam, Kerala',
  description:
    'Shop dresses, Kurithis, sarees and custom-made women\'s clothing from Fairy Finds Boutique in Kottayam, Kerala. Discover elegant ready-to-wear styles and custom outfits, with shipping across India.',
  keywords: [
    'Fairy Finds Boutique',
    'Fairy Finds',
    'Fairy Finds Boutique Kottayam',
    'women\'s clothing boutique Kottayam',
    'women\'s fashion Kottayam',
    'ladies boutique Kottayam',
    'women\'s clothing Kerala',
    'women\'s fashion Kerala',
    'online women\'s boutique Kerala',
    'dresses Kerala',
    'women\'s dresses Kottayam',
    'Kurithi Kerala',
    'Kurithis Kerala',
    'sarees Kottayam',
    'custom made dresses Kerala',
  ],
};

export function formatMetaTitle(title?: string | null, brandName = 'Fairy Finds Boutique'): string {
  if (!title || !title.trim()) return brandName;
  const clean = title.trim();
  if (clean.toLowerCase().includes('fairy finds')) {
    return clean;
  }
  return `${clean} | ${brandName}`;
}
