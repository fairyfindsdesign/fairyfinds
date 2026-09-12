import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Scissors, ShieldCheck, Heart } from 'lucide-react';
import { getHomepageSections, getProducts, getCategories, getReviews, getCollections } from '@/lib/data/store';
import ProductCard from '@/components/ui/ProductCard';
import ReviewsMarquee from '@/components/storefront/ReviewsMarquee';
import HeroCarousel from '@/components/home/HeroCarousel';
import HorizontalScrollSection from '@/components/ui/HorizontalScrollSection';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Dynamic for CMS updates

export default async function HomePage() {
  const [sections, products, categories, reviews, collections] = await Promise.all([
    getHomepageSections(),
    getProducts(),
    getCategories(),
    getReviews(),
    getCollections(),
  ]);

  const visibleSections = sections.filter((s) => s.is_visible);
  const newArrivals = products.slice(0, 8);
  const featuredCollections = collections.filter((c) => c.is_published && c.show_on_home);
  const featuredProducts = products.filter((p) => p.is_published && p.is_featured);

  return (
    <div className="flex flex-col min-h-screen">
      {visibleSections.map((section) => {
        switch (section.section_type) {
          case 'HERO':
            return <HeroCarousel key={section.id} section={section} />;

          case 'PRODUCT_COLLECTION':
            return (
              <HorizontalScrollSection
                key={section.id}
                id="new-arrivals"
                eyebrow={section.subtitle || 'THE LATEST EDIT'}
                title={section.content.heading || 'Fresh Additions to the Atelier'}
                description={
                  section.content.description ||
                  'Handcrafted garments in limited batches, available for immediate WhatsApp ordering.'
                }
                actionLink={{
                  href: section.content.button_link || '/shop',
                  label: section.content.button_text || 'View Entire Collection',
                }}
                className="py-16 sm:py-20 bg-white border-b border-neutral-100"
              >
                {newArrivals.map((product) => (
                  <div
                    key={product.id}
                    className="w-[250px] sm:w-[280px] lg:w-[310px] shrink-0 snap-start flex flex-col"
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </HorizontalScrollSection>
            );

          case 'FEATURED_COLLECTIONS':
          case 'BANNER':
            // Check if this is the featured collections section
            if (section.section_type === 'FEATURED_COLLECTIONS' || section.id === 'sec-featured-collection') {
              return (
                <HorizontalScrollSection
                  key={section.id}
                  id="featured"
                  badge={
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-neutral-200 text-[11px] uppercase tracking-widest text-[#FF55D2] font-semibold">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{section.subtitle || 'FEATURED ATELIER EDITS'}</span>
                    </div>
                  }
                  title={section.content.heading || 'Featured Collections & Highlights'}
                  description={
                    section.content.description ||
                    'Hand-curated capsule edits crafted for celebratory grace. Explore our signature ready-to-wear silhouettes and bespoke couture.'
                  }
                  actionLink={{
                    href: '/shop',
                    label: 'Explore All Styles',
                  }}
                  className="py-16 sm:py-24 bg-[#FAF9F6] border-b border-neutral-200 scroll-mt-20"
                  bottomContent={
                    section.content.image_url ? (
                      /* Editorial Spotlight Banner */
                      <div className="relative py-14 sm:py-20 px-6 sm:px-12 bg-[#1A1A1A] text-white overflow-hidden shadow-lg border border-neutral-800">
                        <div className="absolute inset-0 opacity-30">
                          <Image
                            src={section.content.image_url}
                            alt={section.content.heading || 'Atelier Spotlight'}
                            fill
                            className="object-cover object-center filter grayscale-25"
                          />
                        </div>
                        <div className="relative max-w-3xl mx-auto text-center space-y-4 z-10">
                          <span className="inline-block text-[10px] uppercase tracking-[0.3em] text-[#FF55D2] font-semibold">
                            ATELIER SPOTLIGHT
                          </span>
                          <h3 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-white leading-tight">
                            {section.content.heading || 'The Signature Collection'}
                          </h3>
                          {section.content.description && (
                            <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto font-light">
                              {section.content.description}
                            </p>
                          )}
                          <div className="pt-2">
                            <Link
                              href={section.content.button_link || '/shop'}
                              className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#FF55D2] hover:bg-[#FD00B9] text-white text-xs uppercase tracking-widest font-semibold transition-colors shadow-lg"
                            >
                              <span>{section.content.button_text || 'Explore Collection'}</span>
                              <ArrowRight className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ) : null
                  }
                >
                  {featuredCollections.map((col) => {
                    const count = products.filter(
                      (p) =>
                        p.collection_id === col.id ||
                        p.collection_name?.toLowerCase() === col.name.toLowerCase()
                    ).length;

                    return (
                      <div
                        key={col.id}
                        className="w-[280px] sm:w-[340px] lg:w-[380px] shrink-0 snap-start"
                      >
                        <Link
                          href={`/collections/${col.slug}`}
                          className="group relative flex flex-col bg-white border border-neutral-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-[#FF55D2]/60 transition-all duration-500 h-full"
                        >
                          <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-100">
                            <Image
                              src={
                                col.image_url ||
                                'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=800'
                              }
                              alt={col.name}
                              fill
                              sizes="(max-width: 640px) 280px, (max-width: 1024px) 340px, 380px"
                              className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                            <div className="absolute top-4 left-4">
                              <span className="inline-block px-2.5 py-1 bg-black/60 backdrop-blur-md text-[10px] uppercase tracking-widest text-[#FF55D2] font-semibold border border-white/10">
                                Featured Collection
                              </span>
                            </div>

                            <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6 text-white">
                              <h3 className="font-serif text-2xl sm:text-3xl font-light tracking-wide text-white group-hover:text-[#FF55D2] transition-colors">
                                {col.name}
                              </h3>
                              {col.description && (
                                <p className="text-xs text-neutral-300 mt-1.5 font-light line-clamp-2 leading-relaxed">
                                  {col.description}
                                </p>
                              )}
                              <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/20 text-xs">
                                <span className="text-[11px] text-neutral-300 uppercase tracking-wider">
                                  {count} {count === 1 ? 'Piece' : 'Pieces'} in Atelier
                                </span>
                                <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-widest text-[#FF55D2] font-semibold group-hover:translate-x-1 transition-transform">
                                  View Collection <ArrowRight className="w-3.5 h-3.5" />
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </div>
                    );
                  })}
                </HorizontalScrollSection>
              );
            }

            // Standard fallback standalone banner
            return (
              <section key={section.id} className="relative py-24 bg-[#1A1A1A] text-white overflow-hidden">
                <div className="absolute inset-0 opacity-30">
                  <Image
                    src={
                      section.content.image_url ||
                      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1600'
                    }
                    alt={section.content.heading || 'Collection Banner'}
                    fill
                    className="object-cover object-center filter grayscale-25"
                  />
                </div>
                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6 z-10">
                  {section.subtitle && (
                    <span className="inline-block text-xs uppercase tracking-[0.3em] text-[#FF55D2] font-semibold">
                      {section.subtitle}
                    </span>
                  )}
                  <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light text-white leading-tight">
                    {section.content.heading || 'The Signature Collection'}
                  </h2>
                  <p className="text-neutral-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-light">
                    {section.content.description ||
                      'An ode to timeless grace. Rich silk textures, delicate weaves, and hand-finished borders designed to turn every celebration into an unforgettable memory.'}
                  </p>
                  <div className="pt-4">
                    <Link
                      href={section.content.button_link || '/collections/red-saree'}
                      className="inline-flex items-center gap-2 px-8 py-4 bg-[#FF55D2] hover:bg-[#FD00B9] text-white text-xs uppercase tracking-widest font-semibold transition-colors shadow-lg"
                    >
                      <span>{section.content.button_text || 'Explore Collection'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </section>
            );

          case 'FEATURED_PRODUCTS':
            if (featuredProducts.length === 0) return null;
          case 'FEATURED_PRODUCTS':
            if (featuredProducts.length === 0) return null;
            return (
              <HorizontalScrollSection
                key={section.id}
                id="featured-pieces"
                badge={
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FAF9F6] border border-neutral-200 text-[11px] uppercase tracking-widest text-[#FF55D2] font-semibold mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{section.subtitle || 'HANDPICKED BY DESIGNER'}</span>
                  </div>
                }
                title={section.content.heading || 'Featured Atelier Pieces'}
                description={
                  section.content.description ||
                  'Curated ready-to-wear highlights and couture masterpieces hand-selected for the season.'
                }
                actionLink={{
                  href: section.content.button_link || '/shop',
                  label: section.content.button_text || 'View Entire Catalog',
                }}
                className="py-16 sm:py-24 bg-white border-b border-neutral-200 scroll-mt-20"
              >
                {featuredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="w-[250px] sm:w-[280px] lg:w-[310px] shrink-0 snap-start flex flex-col"
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </HorizontalScrollSection>
            );

          case 'CATEGORY_CARDS':
            return (
              <HorizontalScrollSection
                key={section.id}
                id="categories"
                eyebrow={section.subtitle || 'CURATED STYLES'}
                title={section.content.heading || 'Shop by Category'}
                description={
                  section.content.description || 'Browse our artisanal garments by style category.'
                }
                className="py-16 sm:py-20 bg-[#FAF9F6] border-b border-neutral-200"
              >
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="w-[220px] sm:w-[260px] lg:w-[290px] shrink-0 snap-start"
                  >
                    <Link
                      href={`/shop?category=${cat.slug}`}
                      className="group relative aspect-[3/4] overflow-hidden bg-neutral-200 block shadow-sm h-full"
                    >
                      <Image
                        src={
                          cat.image_url ||
                          'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600'
                        }
                        alt={cat.name}
                        fill
                        sizes="(max-width: 640px) 220px, (max-width: 1024px) 260px, 290px"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-5 sm:p-6 text-white">
                        <h3 className="font-serif text-2xl font-light tracking-wide group-hover:text-[#FF55D2] transition-colors">
                          {cat.name}
                        </h3>
                        <p className="text-xs text-neutral-300 mt-1 line-clamp-2 font-light">
                          {cat.description}
                        </p>
                        <span className="mt-4 text-[11px] uppercase tracking-widest text-[#FF55D2] font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          Shop {cat.name} <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </Link>
                  </div>
                ))}
              </HorizontalScrollSection>
            );

          case 'CUSTOM_MADE':
            return (
              <section key={section.id} className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="bg-[#FAF9F6] border border-neutral-200 p-8 sm:p-12 lg:p-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                    <div className="lg:col-span-7 space-y-6">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-neutral-200 text-[11px] uppercase tracking-widest text-[#FF55D2] font-semibold">
                        <Scissors className="w-3.5 h-3.5" />
                        <span>Bespoke Tailoring Atelier</span>
                      </div>

                      <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1A1A1A] font-light leading-tight">
                        {section.content.heading || 'Bring Your Dream Outfit to Life'}
                      </h2>

                      <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-light">
                        {section.content.description ||
                          'Looking for a custom cut, specific fabric, or made-to-measure bridal drape? Work directly with our designer through WhatsApp to create a one-of-a-kind garment.'}
                      </p>

                      <div className="space-y-3 pt-2">
                        <div className="flex items-start gap-3">
                          <span className="w-5 h-5 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                            1
                          </span>
                          <p className="text-xs text-neutral-700">
                            <strong>Submit Measurements & Inspiration:</strong> Provide your preferred silhouette and fabric choices.
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="w-5 h-5 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                            2
                          </span>
                          <p className="text-xs text-neutral-700">
                            <strong>Chat Directly on WhatsApp:</strong> Discuss styling, share reference photos, and agree on fittings.
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="w-5 h-5 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                            3
                          </span>
                          <p className="text-xs text-neutral-700">
                            <strong>Handcrafted & Delivered:</strong> Tailored with meticulous care and delivered to your doorstep.
                          </p>
                        </div>
                      </div>

                      <div className="pt-4">
                        <Link
                          href={section.content.button_link || '/custom'}
                          className="inline-flex items-center gap-2 px-8 py-4 bg-[#1A1A1A] hover:bg-[#FF55D2] text-white text-xs uppercase tracking-widest font-medium transition-colors shadow-sm"
                        >
                          <span>{section.content.button_text || 'Start Your Custom Order'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>

                    <div className="lg:col-span-5 relative aspect-[4/5] overflow-hidden bg-neutral-200 border border-neutral-200 shadow-md">
                      <Image
                        src={
                          section.content.image_url ||
                          'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=800'
                        }
                        alt="Bespoke Couture Design"
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 400px"
                      />
                    </div>
                  </div>
                </div>
              </section>
            );

          case 'REVIEWS':
            return (
              <ReviewsMarquee
                key={section.id}
                reviews={reviews}
                heading={section.content?.heading}
                subtitle={section.subtitle}
                description={section.content?.description}
                badge={section.content?.badge}
              />
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
