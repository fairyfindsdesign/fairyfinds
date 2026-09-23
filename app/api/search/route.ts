import { NextResponse } from 'next/server';
import { getProducts, getCategories } from '@/lib/data/store';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim().toLowerCase() || '';

    if (!query || query.length < 2) {
      return NextResponse.json({ products: [], categories: [] });
    }

    const [products, categories] = await Promise.all([
      getProducts(),
      getCategories(),
    ]);

    const matchingCategories = categories
      .filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.slug.toLowerCase().includes(query)
      )
      .slice(0, 3)
      .map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
      }));

    const matchingProducts = products
      .filter((p) => p.is_published)
      .filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          (p.product_code && p.product_code.toLowerCase().includes(query)) ||
          (p.category_name && p.category_name.toLowerCase().includes(query)) ||
          (p.description && p.description.toLowerCase().includes(query))
      )
      .slice(0, 6)
      .map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        image: p.images?.[0] || '',
        category_name: p.category_name || '',
      }));

    return NextResponse.json({
      products: matchingProducts,
      categories: matchingCategories,
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ products: [], categories: [] }, { status: 500 });
  }
}
