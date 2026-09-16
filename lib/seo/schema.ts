import { Product, StoreSettings } from '@/lib/types';
import { BUSINESS_INFO, SITE_URL } from './constants';

/**
 * Generates Schema.org ClothingStore / LocalBusiness JSON-LD
 */
export function generateBoutiqueSchema(settings?: Partial<StoreSettings>) {
  const seo = settings?.seo_config;
  const local = seo?.local_business;
  const siteUrl = seo?.global?.canonical_base || SITE_URL;

  const phone = settings?.whatsapp_number
    ? settings.whatsapp_number.startsWith('+')
      ? settings.whatsapp_number
      : `+91${settings.whatsapp_number.replace(/\D/g, '')}`
    : BUSINESS_INFO.telephone;

  const email = settings?.contact_email || BUSINESS_INFO.email;
  const instagram = settings?.instagram_url || BUSINESS_INFO.instagram;
  const name = local?.name || local?.legal_name || BUSINESS_INFO.name;
  const alternateName = local?.alternate_names || BUSINESS_INFO.alternateNames;
  const description = seo?.global?.meta_description || BUSINESS_INFO.description;

  return {
    '@context': 'https://schema.org',
    '@type': 'ClothingStore',
    '@id': `${siteUrl}/#boutique`,
    name,
    alternateName,
    description,
    url: siteUrl,
    logo: {
      '@type': 'ImageObject',
      url: BUSINESS_INFO.logo,
      width: 512,
      height: 512,
    },
    image: seo?.social?.og_image
      ? (seo.social.og_image.startsWith('http') ? seo.social.og_image : `${siteUrl}${seo.social.og_image.startsWith('/') ? '' : '/'}${seo.social.og_image}`)
      : `${siteUrl}/og-image.jpg`,
    telephone: phone,
    email: email,
    priceRange: local?.price_range || BUSINESS_INFO.priceRange,
    currenciesAccepted: BUSINESS_INFO.currenciesAccepted,
    paymentAccepted: local?.payment_accepted || BUSINESS_INFO.paymentAccepted,
    address: {
      '@type': 'PostalAddress',
      streetAddress: local?.street_address || BUSINESS_INFO.address.streetAddress,
      addressLocality: local?.address_locality || BUSINESS_INFO.address.addressLocality,
      addressRegion: local?.address_region || BUSINESS_INFO.address.addressRegion,
      postalCode: local?.postal_code || BUSINESS_INFO.address.postalCode,
      addressCountry: local?.address_country || BUSINESS_INFO.address.addressCountry,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: local?.latitude || BUSINESS_INFO.geo.latitude,
      longitude: local?.longitude || BUSINESS_INFO.geo.longitude,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '10:00',
        closes: '19:00',
      },
    ],
    areaServed: BUSINESS_INFO.areaServed,
    sameAs: [instagram].filter(Boolean),
  };
}

/**
 * Generates Schema.org WebSite JSON-LD
 */
export function generateWebSiteSchema(settings?: Partial<StoreSettings>) {
  const seo = settings?.seo_config;
  const siteUrl = seo?.global?.canonical_base || SITE_URL;
  const name = seo?.local_business?.name || BUSINESS_INFO.name;
  const description = seo?.global?.meta_description || BUSINESS_INFO.description;

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    url: siteUrl,
    name: name,
    alternateName: seo?.local_business?.alternate_names?.[0] || BUSINESS_INFO.alternateNames[0],
    description: description,
    publisher: {
      '@id': `${siteUrl}/#boutique`,
    },
    inLanguage: 'en-IN',
  };
}

/**
 * Generates Schema.org Product JSON-LD using real product data
 */
export function generateProductSchema(product: Product, settings?: StoreSettings) {
  const canonicalUrl = `${SITE_URL}/product/${product.slug}`;

  // Process images into absolute URLs
  const absoluteImages = (product.images || []).map((img) =>
    img.startsWith('http') ? img : `${SITE_URL}${img.startsWith('/') ? img : `/${img}`}`
  );

  // Determine stock availability from real variants
  const totalStock = product.variants?.reduce((sum, v) => sum + (v.stock_quantity || 0), 0) ?? 0;
  const inStock = totalStock > 0;

  // Real review data check (only include AggregateRating if actual reviews exist)
  let aggregateRating = undefined;
  if (settings?.reviews && settings.reviews.length > 0) {
    const productReviews = settings.reviews.filter(
      (r) =>
        r.is_visible &&
        (r.product_name?.toLowerCase() === product.name.toLowerCase() ||
          r.tag?.toLowerCase().includes(product.name.toLowerCase()))
    );

    if (productReviews.length > 0) {
      const avgRating =
        productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
      aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: avgRating.toFixed(1),
        reviewCount: productReviews.length,
        bestRating: '5',
        worstRating: '1',
      };
    }
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${canonicalUrl}#product`,
    name: product.name,
    description:
      product.description ||
      `${product.name} from Fairy Finds Boutique. Artisanal women's fashion in Kottayam, Kerala.`,
    image: absoluteImages.length > 0 ? absoluteImages : [`${SITE_URL}/logo.png`],
    sku: product.product_code || undefined,
    mpn: product.product_code || undefined,
    category: product.category_name || undefined,
    brand: {
      '@type': 'Brand',
      name: BUSINESS_INFO.name,
    },
    ...(product.fabric ? { material: product.fabric } : {}),
    offers: {
      '@type': 'Offer',
      url: canonicalUrl,
      price: product.price,
      priceCurrency: 'INR',
      priceValidUntil: '2027-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: BUSINESS_INFO.name,
      },
    },
    ...(aggregateRating ? { aggregateRating } : {}),
  };
}

/**
 * Generates Schema.org BreadcrumbList JSON-LD
 */
export function generateBreadcrumbSchema(
  items: { name: string; url?: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      ...(item.url
        ? {
            item: item.url.startsWith('http')
              ? item.url
              : `${SITE_URL}${item.url.startsWith('/') ? item.url : `/${item.url}`}`,
          }
        : {}),
    })),
  };
}

/**
 * Generates Schema.org ItemList JSON-LD for category or shop pages
 */
export function generateItemListSchema(
  listName: string,
  items: { name: string; slug: string; image?: string; price?: number }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: listName,
    itemListElement: items.slice(0, 24).map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${SITE_URL}/product/${item.slug}`,
      name: item.name,
      ...(item.image ? { image: item.image } : {}),
    })),
  };
}
