import { NextResponse } from 'next/server';
import { getSettings, getCategories, getCollections } from '@/lib/data/store';
import { SITE_URL, BUSINESS_INFO } from '@/lib/seo/constants';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export async function GET() {
  try {
    const [settings, categories, collections] = await Promise.all([
      getSettings().catch(() => null),
      getCategories().catch(() => []),
      getCollections().catch(() => []),
    ]);

    const canonicalBase = settings?.seo_config?.global?.canonical_base || SITE_URL;
    const phone = settings?.whatsapp_number || BUSINESS_INFO.displayPhone;
    const email = settings?.contact_email || BUSINESS_INFO.email;

    const categoryList = categories.map((c) => `- [${c.name}](${canonicalBase}/category/${c.slug})`).join('\n');
    const collectionList = collections.map((c) => `- [${c.name}](${canonicalBase}/collections/${c.slug})`).join('\n');

    const content = `# Fairy Finds Boutique

> Fairy Finds Boutique is an artisanal women's fashion house and bespoke couture atelier located in Neendoor, Kottayam, Kerala, India. We design ready-to-wear dresses, ethnic sarees, kurtis, bridal lehengas, and hand-embroidered blouses, offering custom-made tailoring consultations and all-India & international shipping.

## Atelier & Storefront Information
- **Brand Name:** Fairy Finds Boutique
- **Location:** Neendoor, Kottayam, Kerala 686601, India
- **Phone / WhatsApp:** ${phone}
- **Email:** ${email}
- **Website:** ${canonicalBase}
- **Operating Hours:** Monday – Saturday, 10:00 AM – 7:00 PM IST
- **Orders & Support:** Direct WhatsApp ordering, online catalog browsing, and bespoke bridal consultations.

## Offerings & Expertise
- **Bespoke Tailoring:** Custom bridal couture, Christian wedding wear, lehengas, and bespoke blouses tailored to individual measurements.
- **Ready-to-Wear Fashion:** Curated sarees, designer kurtis, and contemporary festive wear.
- **Worldwide & India Delivery:** Fast doorstep delivery across Kerala, India, and NRI diaspora worldwide (UAE, GCC, USA, UK, Canada).

## Core Storefront Pages
- [Home Page](${canonicalBase}/): Featured collections, new arrivals, and customer reviews.
- [Shop Catalog](${canonicalBase}/shop): Full ready-to-wear collection.
- [Custom Couture](${canonicalBase}/custom): Bespoke tailoring requests and direct WhatsApp booking.
- [About Atelier](${canonicalBase}/about): Artisanal craftsmanship, story, and tailoring heritage in Kottayam.
- [Contact & Visit](${canonicalBase}/contact): Physical atelier address in Neendoor, Google Maps location, and WhatsApp contact.

## Product Categories
${categoryList || '- Sarees\n- Kurithis & Kurtas\n- Artisanal Blouses & Tops\n- Festive Dresses'}

## Featured Collections
${collectionList || '- Festive Sarees\n- Emerald Velvet Collection\n- Pastel Symphony'}
`;

    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    return new NextResponse('# Fairy Finds Boutique\nWomen\'s fashion boutique in Kottayam, Kerala.', {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}
