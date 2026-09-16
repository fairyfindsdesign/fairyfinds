import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Category, Collection, CustomerReview, HomepageSection, NavItem, Product, SeoConfig, StoreSettings } from '../types';
import { initialCategories, initialCollections, initialNavigation, initialProducts, initialReviews, initialSections, initialSeoConfig, initialSettings } from './initial-data';
import { getAdminSupabase } from '../supabase/admin';
import { generateUniqueProductCode } from '../utils/product-code';

const DATA_FILE = path.join(process.cwd(), 'data', 'store.json');

interface StoreData {
  settings: StoreSettings;
  navigation: NavItem[];
  categories: Category[];
  collections: Collection[];
  products: Product[];
  sections: HomepageSection[];
  reviews: CustomerReview[];
}

// Global in-memory cache for serverless environments (Vercel) where the filesystem is read-only
const globalStore = globalThis as unknown as { __fairyStoreData?: StoreData };

export function getLocalData(): StoreData {
  if (globalStore.__fairyStoreData) {
    return globalStore.__fairyStoreData;
  }

  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      const parsedSettings = parsed.settings || initialSettings;
      const data: StoreData = {
        settings: {
          ...initialSettings,
          ...parsedSettings,
          seo_config: parsedSettings.seo_config || initialSeoConfig,
        },
        navigation: parsed.navigation || initialNavigation,
        categories: parsed.categories || initialCategories,
        collections: parsed.collections || initialCollections,
        products: parsed.products || initialProducts,
        sections: parsed.sections || initialSections,
        reviews: parsed.reviews || initialReviews,
      };
      globalStore.__fairyStoreData = data;
      return data;
    }
  } catch (err) {
    console.error('Error reading data/store.json:', err);
  }

  const defaultData: StoreData = {
    settings: initialSettings,
    navigation: initialNavigation,
    categories: initialCategories,
    collections: initialCollections,
    products: initialProducts,
    sections: initialSections,
    reviews: initialReviews,
  };
  globalStore.__fairyStoreData = defaultData;
  return defaultData;
}

export function saveLocalData(data: StoreData): void {
  // Always update in-memory global cache first
  globalStore.__fairyStoreData = data;

  // Attempt to persist to filesystem for local development
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    // Read-only filesystem is normal on Vercel lambdas
  }
}

// --- Auto-Seed Supabase on First Connect ---
let isSeeding = false;
let hasCheckedSeed = false;

async function ensureSupabaseSeeded(supabase: any) {
  if (hasCheckedSeed || isSeeding) return;
  hasCheckedSeed = true;

  try {
    isSeeding = true;
    const local = getLocalData();

    // 1. Check & Seed Homepage Sections if empty
    const { count: secCount } = await supabase
      .from('homepage_sections')
      .select('*', { count: 'exact', head: true });

    if (secCount === 0) {
      console.log('[Supabase] Seeding homepage sections...');
      const sectionsToSeed = local.sections && local.sections.length > 0 ? local.sections : initialSections;
      await supabase.from('homepage_sections').upsert(
        sectionsToSeed.map((s) => ({
          id: s.id,
          section_type: s.section_type,
          title: s.title,
          subtitle: s.subtitle,
          content: s.content,
          display_order: s.display_order,
          is_visible: s.is_visible,
        }))
      );
    }

    // 2. Check & Seed Categories if empty
    const { count: catCount } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true });

    if (catCount === 0) {
      console.log('[Supabase] Seeding categories...');
      const categoriesToSeed = local.categories && local.categories.length > 0 ? local.categories : initialCategories;
      await supabase.from('categories').upsert(
        categoriesToSeed.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
          image_url: c.image_url,
          display_order: c.display_order,
        }))
      );
    }

    // 3. Check & Seed Collections if empty
    const { count: colCount } = await supabase
      .from('collections')
      .select('*', { count: 'exact', head: true });

    if (colCount === 0) {
      console.log('[Supabase] Seeding collections...');
      const collectionsToSeed = local.collections && local.collections.length > 0 ? local.collections : initialCollections;
      await supabase.from('collections').upsert(
        collectionsToSeed.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
          image_url: c.image_url,
          show_on_home: c.show_on_home,
          has_dedicated_page: c.has_dedicated_page,
          display_order: c.display_order,
          is_published: c.is_published,
        }))
      );
    }

    // 4. Check & Seed Products if empty
    const { count: prodCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (prodCount === 0) {
      console.log('[Supabase] Seeding products...');
      const productsToSeed = local.products && local.products.length > 0 ? local.products : initialProducts;
      for (const prod of productsToSeed) {
        await supabase.from('products').upsert({
          id: prod.id,
          name: prod.name,
          slug: prod.slug,
          product_code: prod.product_code,
          price: prod.price,
          description: prod.description,
          category_id: prod.category_id || null,
          collection_id: prod.collection_id || null,
          images: prod.images,
          fabric: prod.fabric,
          care_instructions: prod.care_instructions,
          is_published: prod.is_published,
          is_featured: prod.is_featured,
          updated_at: new Date().toISOString(),
        });

        if (prod.variants?.length > 0) {
          await supabase.from('product_variants').upsert(
            prod.variants.map((v) => ({
              id: crypto.randomUUID(),
              product_id: prod.id,
              size: v.size,
              stock_quantity: v.stock_quantity,
              sku: v.sku,
            }))
          );
        }
      }
    }

    // 5. Check & Seed Store Settings if empty
    const { count: setCount } = await supabase
      .from('store_settings')
      .select('*', { count: 'exact', head: true });

    if (setCount === 0) {
      console.log('[Supabase] Seeding store settings...');
      await supabase.from('store_settings').upsert({
        id: 1,
        whatsapp_number: local.settings.whatsapp_number,
        store_name: local.settings.store_name,
        contact_email: local.settings.contact_email,
        instagram_url: local.settings.instagram_url,
        address: local.settings.address,
        announcement_bar: local.settings.announcement_bar,
        currency_symbol: local.settings.currency_symbol || 'Rs.',
        navigation: local.navigation || initialNavigation,
        reviews: local.reviews || initialReviews,
        seo_config: local.settings.seo_config || initialSeoConfig,
        updated_at: new Date().toISOString(),
      });
    }

    isSeeding = false;
  } catch (err) {
    console.error('Error in ensureSupabaseSeeded:', err);
    isSeeding = false;
  }
}

// --- Settings ---
export async function getServerSettings(): Promise<StoreSettings> {
  const localSettings = getLocalData().settings;
  const supabase = getAdminSupabase();
  if (supabase) {
    try {
      await ensureSupabaseSeeded(supabase);
      const { data, error } = await supabase.from('store_settings').select('*').single();
      if (!error && data) {
        return {
          whatsapp_number: data.whatsapp_number,
          store_name: data.store_name,
          contact_email: data.contact_email,
          instagram_url: data.instagram_url,
          address: data.address,
          announcement_bar: data.announcement_bar,
          currency_symbol: data.currency_symbol || 'Rs.',
          navigation: data.navigation || initialNavigation,
          reviews: data.reviews || initialReviews,
          seo_config: data.seo_config || localSettings.seo_config || initialSeoConfig,
        };
      }
    } catch (err) {
      console.error('Error fetching store_settings from Supabase:', err);
    }
  }
  return {
    ...localSettings,
    seo_config: localSettings.seo_config || initialSeoConfig,
  };
}

export async function updateServerSettings(settings: Partial<StoreSettings>): Promise<StoreSettings> {
  const data = getLocalData();
  data.settings = {
    ...data.settings,
    ...settings,
    seo_config: settings.seo_config
      ? { ...(data.settings.seo_config || initialSeoConfig), ...settings.seo_config }
      : (data.settings.seo_config || initialSeoConfig),
  };
  saveLocalData(data);

  const supabase = getAdminSupabase();
  if (supabase) {
    try {
      const { error } = await supabase.from('store_settings').upsert({
        id: 1,
        ...settings,
        updated_at: new Date().toISOString(),
      });
      if (error) {
        console.error('Supabase store_settings update error:', error);
        throw new Error(`Database error updating settings: ${error.message || error.details}`);
      }
      return await getServerSettings();
    } catch (err: any) {
      console.error('Error updating store_settings in Supabase:', err);
      throw err;
    }
  }

  return data.settings;
}

export async function updateServerSeoConfig(seoConfig: Partial<SeoConfig>): Promise<SeoConfig> {
  const data = getLocalData();
  const currentSeo = data.settings.seo_config || initialSeoConfig;
  const merged: SeoConfig = {
    ...currentSeo,
    ...seoConfig,
    global: { ...currentSeo.global, ...(seoConfig.global || {}) },
    local_business: { ...currentSeo.local_business, ...(seoConfig.local_business || {}) },
    pages: { ...currentSeo.pages, ...(seoConfig.pages || {}) },
    social: { ...currentSeo.social, ...(seoConfig.social || {}) },
    verification: { ...currentSeo.verification, ...(seoConfig.verification || {}) },
    crawl: { ...currentSeo.crawl, ...(seoConfig.crawl || {}) },
    last_updated: new Date().toISOString(),
  };

  data.settings.seo_config = merged;
  saveLocalData(data);

  const supabase = getAdminSupabase();
  if (supabase) {
    try {
      await supabase.from('store_settings').upsert({
        id: 1,
        seo_config: merged,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error updating seo_config in Supabase:', err);
    }
  }

  return merged;
}

// --- Products ---
export async function getServerProducts(): Promise<Product[]> {
  const supabase = getAdminSupabase();
  if (supabase) {
    try {
      await ensureSupabaseSeeded(supabase);
      const { data, error } = await supabase
        .from('products')
        .select('*, variants:product_variants(*), categories(name), collections(name)')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data.map((item: any) => ({
          ...item,
          category_name: item.categories?.name,
          collection_name: item.collections?.name,
          variants: item.variants || [],
        }));
      }
    } catch (err) {
      console.error('Error fetching products from Supabase:', err);
    }
  }
  return getLocalData().products;
}

export async function getServerProductBySlug(slug: string): Promise<Product | null> {
  const products = await getServerProducts();
  return products.find((p) => p.slug === slug || p.id === slug) || null;
}

export async function saveServerProduct(product: Partial<Product>): Promise<Product> {
  const isNew = !product.id;
  const id = product.id || crypto.randomUUID();
  const data = getLocalData();

  let assignedCode = (product.product_code || '').trim().toUpperCase();
  if (!assignedCode) {
    assignedCode = generateUniqueProductCode({
      productName: product.name,
      categoryId: product.category_id,
      categoryName: product.category_name,
      categories: data.categories,
      existingProducts: data.products,
      currentProductId: product.id,
    });
  }

  const cleanSlug = product.slug?.trim() || (product.name ? product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : id);

  const newProduct: Product = {
    id,
    product_code: assignedCode,
    name: product.name || 'Untitled Product',
    slug: cleanSlug,
    description: product.description || '',
    price: product.price || 0,
    product_type: 'READY_MADE',
    category_id: product.category_id || undefined,
    category_name: product.category_name,
    collection_id: product.collection_id || undefined,
    collection_name: product.collection_name,
    images: product.images && product.images.length > 0 ? product.images : [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=1000'
    ],
    fabric: product.fabric,
    care_instructions: product.care_instructions,
    is_published: product.is_published ?? true,
    is_featured: product.is_featured ?? false,
    variants: product.variants?.map((v) => ({
      id: v.id || crypto.randomUUID(),
      product_id: id,
      size: v.size,
      stock_quantity: v.stock_quantity,
      sku: v.sku,
    })) || [
      { id: crypto.randomUUID(), product_id: id, size: 'S', stock_quantity: 2 },
      { id: crypto.randomUUID(), product_id: id, size: 'M', stock_quantity: 3 },
      { id: crypto.randomUUID(), product_id: id, size: 'L', stock_quantity: 1 },
    ],
  };

  if (isNew) {
    data.products.unshift(newProduct);
  } else {
    data.products = data.products.map((p) => (p.id === id ? newProduct : p));
  }
  saveLocalData(data);

  const supabase = getAdminSupabase();
  if (supabase) {
    try {
      const { error: prodErr } = await supabase.from('products').upsert({
        id: newProduct.id,
        name: newProduct.name,
        slug: newProduct.slug,
        product_code: newProduct.product_code,
        price: newProduct.price,
        description: newProduct.description,
        category_id: newProduct.category_id || null,
        collection_id: newProduct.collection_id || null,
        images: newProduct.images,
        fabric: newProduct.fabric,
        care_instructions: newProduct.care_instructions,
        is_published: newProduct.is_published,
        is_featured: newProduct.is_featured,
        updated_at: new Date().toISOString(),
      });
      if (prodErr) {
        console.error('Supabase product upsert error:', prodErr);
        throw new Error(`Database error saving product: ${prodErr.message || prodErr.details || 'Check table schema'}`);
      }

      if (newProduct.variants && newProduct.variants.length > 0) {
        // Delete old variants for clean update
        await supabase.from('product_variants').delete().eq('product_id', newProduct.id);
        const variantsToUpsert = newProduct.variants.map((v) => ({
          id: v.id || crypto.randomUUID(),
          product_id: newProduct.id,
          size: v.size,
          stock_quantity: v.stock_quantity,
          sku: v.sku,
        }));
        const { error: varErr } = await supabase.from('product_variants').upsert(variantsToUpsert);
        if (varErr) {
          console.error('Supabase product_variants upsert error:', varErr);
          throw new Error(`Database error saving product variants: ${varErr.message || varErr.details}`);
        }
      }
    } catch (err: any) {
      console.error('Error saving product to Supabase:', err);
      throw err;
    }
  }

  return newProduct;
}

export async function deleteServerProduct(id: string): Promise<boolean> {
  const data = getLocalData();
  data.products = data.products.filter((p) => p.id !== id);
  saveLocalData(data);

  const supabase = getAdminSupabase();
  if (supabase) {
    try {
      await supabase.from('product_variants').delete().eq('product_id', id);
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) {
        console.error('Supabase product delete error:', error);
        throw new Error(`Database error deleting product: ${error.message || error.details}`);
      }
    } catch (err: any) {
      console.error('Error deleting product from Supabase:', err);
      throw err;
    }
  }

  return true;
}

// --- Categories ---
export async function getServerCategories(): Promise<Category[]> {
  const supabase = getAdminSupabase();
  if (supabase) {
    try {
      await ensureSupabaseSeeded(supabase);
      const { data, error } = await supabase.from('categories').select('*').order('display_order');
      if (!error && data) return data;
    } catch (err) {
      console.error('Error fetching categories from Supabase:', err);
    }
  }
  return getLocalData().categories;
}

export async function saveServerCategory(category: Partial<Category>): Promise<Category> {
  const isNew = !category.id;
  const id = category.id || crypto.randomUUID();
  const cleanSlug = category.slug?.trim() || (category.name ? category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : id);

  const newCat: Category = {
    id,
    name: category.name || 'New Category',
    slug: cleanSlug,
    description: category.description || '',
    image_url: category.image_url || '',
    display_order: category.display_order ?? 1,
    created_at: category.created_at || new Date().toISOString(),
  };

  const data = getLocalData();
  if (isNew) {
    data.categories.push(newCat);
  } else {
    data.categories = data.categories.map((c) => (c.id === id ? newCat : c));
    data.products = data.products.map((p) => {
      if (p.category_id === id) {
        return { ...p, category_name: newCat.name };
      }
      return p;
    });
  }
  saveLocalData(data);

  const supabase = getAdminSupabase();
  if (supabase) {
    try {
      const { error } = await supabase.from('categories').upsert({
        id: newCat.id,
        name: newCat.name,
        slug: newCat.slug,
        description: newCat.description,
        image_url: newCat.image_url,
        display_order: newCat.display_order,
      });
      if (error) {
        console.error('Supabase category upsert error:', error);
        throw new Error(`Database error saving category: ${error.message || error.details}`);
      }
    } catch (err: any) {
      console.error('Error saving category to Supabase:', err);
      throw err;
    }
  }

  return newCat;
}

export async function deleteServerCategory(id: string): Promise<boolean> {
  const data = getLocalData();
  data.categories = data.categories.filter((c) => c.id !== id);
  data.products = data.products.map((p) => {
    if (p.category_id === id) {
      return { ...p, category_id: undefined, category_name: undefined };
    }
    return p;
  });
  saveLocalData(data);

  const supabase = getAdminSupabase();
  if (supabase) {
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) {
        console.error('Supabase category delete error:', error);
      }
    } catch (err) {
      console.error('Error deleting category from Supabase:', err);
    }
  }

  return true;
}

// --- Collections ---
export async function getServerCollections(): Promise<Collection[]> {
  const supabase = getAdminSupabase();
  if (supabase) {
    try {
      await ensureSupabaseSeeded(supabase);
      const { data, error } = await supabase.from('collections').select('*').order('display_order');
      if (!error && data) return data;
    } catch (err) {
      console.error('Error fetching collections from Supabase:', err);
    }
  }
  return getLocalData().collections;
}

export async function getServerCollectionBySlug(slug: string): Promise<Collection | null> {
  const collections = await getServerCollections();
  return collections.find((c) => c.slug === slug || c.id === slug) || null;
}

export async function saveServerCollection(collection: Partial<Collection>): Promise<Collection> {
  const isNew = !collection.id;
  const id = collection.id || crypto.randomUUID();
  const cleanSlug = collection.slug?.trim() || (collection.name ? collection.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : id);

  const newCol: Collection = {
    id,
    name: collection.name || 'New Collection',
    slug: cleanSlug,
    description: collection.description || '',
    image_url: collection.image_url || '',
    show_on_home: collection.show_on_home ?? true,
    has_dedicated_page: collection.has_dedicated_page ?? true,
    display_order: collection.display_order ?? 1,
    is_published: collection.is_published ?? true,
  };

  const data = getLocalData();
  if (isNew) {
    data.collections.push(newCol);
  } else {
    data.collections = data.collections.map((c) => (c.id === id ? newCol : c));
    data.products = data.products.map((p) => {
      if (p.collection_id === id) {
        return { ...p, collection_name: newCol.name };
      }
      return p;
    });
  }
  saveLocalData(data);

  const supabase = getAdminSupabase();
  if (supabase) {
    try {
      const { error } = await supabase.from('collections').upsert({
        id: newCol.id,
        name: newCol.name,
        slug: newCol.slug,
        description: newCol.description,
        image_url: newCol.image_url,
        show_on_home: newCol.show_on_home,
        has_dedicated_page: newCol.has_dedicated_page,
        display_order: newCol.display_order,
        is_published: newCol.is_published,
      });
      if (error) {
        console.error('Supabase collection upsert error:', error);
        throw new Error(`Database error saving collection: ${error.message || error.details}`);
      }
    } catch (err: any) {
      console.error('Error saving collection to Supabase:', err);
      throw err;
    }
  }

  return newCol;
}

export async function deleteServerCollection(id: string): Promise<boolean> {
  const data = getLocalData();
  data.collections = data.collections.filter((c) => c.id !== id);
  data.products = data.products.map((p) => {
    if (p.collection_id === id) {
      return { ...p, collection_id: undefined, collection_name: undefined };
    }
    return p;
  });
  saveLocalData(data);

  const supabase = getAdminSupabase();
  if (supabase) {
    try {
      // Unlink products in this collection
      await supabase.from('products').update({ collection_id: null }).eq('collection_id', id);
      const { error } = await supabase.from('collections').delete().eq('id', id);
      if (error) {
        console.error('Supabase collection delete error:', error);
        throw new Error(`Database error deleting collection: ${error.message || error.details}`);
      }
    } catch (err: any) {
      console.error('Error deleting collection from Supabase:', err);
      throw err;
    }
  }

  return true;
}

// --- Sections ---
export async function getServerHomepageSections(): Promise<HomepageSection[]> {
  const supabase = getAdminSupabase();
  if (supabase) {
    try {
      await ensureSupabaseSeeded(supabase);
      const { data, error } = await supabase.from('homepage_sections').select('*').order('display_order');
      if (!error && data && data.length > 0) return data;

      // If table exists in Supabase but has 0 rows, seed with initialSections immediately
      if (!error && data && data.length === 0) {
        const local = getLocalData();
        const fallback = local.sections && local.sections.length > 0 ? local.sections : initialSections;
        await supabase.from('homepage_sections').upsert(
          fallback.map((s) => ({
            id: s.id,
            section_type: s.section_type,
            title: s.title,
            subtitle: s.subtitle,
            content: s.content,
            display_order: s.display_order,
            is_visible: s.is_visible,
          }))
        );
        return fallback;
      }
    } catch (err) {
      console.error('Error fetching homepage_sections from Supabase:', err);
    }
  }
  const local = getLocalData();
  const fallback = local.sections && local.sections.length > 0 ? local.sections : initialSections;
  return fallback.sort((a, b) => a.display_order - b.display_order);
}

export async function reorderServerSections(orderedIds: string[]): Promise<HomepageSection[]> {
  const data = getLocalData();
  data.sections = data.sections
    .map((sec) => {
      const idx = orderedIds.indexOf(sec.id);
      if (idx !== -1) {
        return { ...sec, display_order: idx + 1 };
      }
      return sec;
    })
    .sort((a, b) => a.display_order - b.display_order);

  saveLocalData(data);

  const supabase = getAdminSupabase();
  if (supabase) {
    try {
      for (const sec of data.sections) {
        const { error } = await supabase
          .from('homepage_sections')
          .update({ display_order: sec.display_order, updated_at: new Date().toISOString() })
          .eq('id', sec.id);
        if (error) {
          console.error('Supabase error reordering section:', error);
          throw new Error(`Failed to update display order: ${error.message}`);
        }
      }
      return await getServerHomepageSections();
    } catch (err: any) {
      console.error('Error reordering homepage sections in Supabase:', err);
      throw err;
    }
  }

  return data.sections;
}

export async function toggleServerSectionVisibility(id: string, is_visible: boolean): Promise<HomepageSection[]> {
  const data = getLocalData();
  data.sections = data.sections.map((s) => (s.id === id ? { ...s, is_visible } : s));
  saveLocalData(data);

  const supabase = getAdminSupabase();
  if (supabase) {
    try {
      const { error } = await supabase
        .from('homepage_sections')
        .update({ is_visible, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) {
        console.error('Supabase error toggling section visibility:', error);
        throw new Error(`Failed to toggle visibility: ${error.message}`);
      }
      return await getServerHomepageSections();
    } catch (err: any) {
      console.error('Error toggling homepage section visibility in Supabase:', err);
      throw err;
    }
  }

  return data.sections;
}

export async function updateServerSectionContent(id: string, content: any): Promise<HomepageSection[]> {
  const data = getLocalData();
  let updatedSection: HomepageSection | undefined;
  data.sections = data.sections.map((s) => {
    if (s.id === id) {
      const { subtitle, title, ...restContent } = content;
      updatedSection = {
        ...s,
        title: title !== undefined ? title : s.title,
        subtitle: subtitle !== undefined ? subtitle : s.subtitle,
        content: { ...s.content, ...restContent },
      };
      return updatedSection;
    }
    return s;
  });
  saveLocalData(data);

  const supabase = getAdminSupabase();
  if (supabase && updatedSection) {
    try {
      const { error } = await supabase
        .from('homepage_sections')
        .upsert({
          id: updatedSection.id,
          section_type: updatedSection.section_type,
          title: updatedSection.title,
          subtitle: updatedSection.subtitle,
          content: updatedSection.content,
          display_order: updatedSection.display_order,
          is_visible: updatedSection.is_visible,
          updated_at: new Date().toISOString(),
        });
      if (error) {
        console.error('Supabase update error on homepage_sections:', error);
        throw new Error(`Database error updating section: ${error.message || error.details}`);
      }
      return await getServerHomepageSections();
    } catch (err: any) {
      console.error('Error updating homepage section in Supabase:', err);
      throw err;
    }
  }

  return data.sections;
}

// --- Navigation ---
export async function getServerNavigation(): Promise<NavItem[]> {
  const supabase = getAdminSupabase();
  if (supabase) {
    try {
      await ensureSupabaseSeeded(supabase);
      const { data, error } = await supabase.from('store_settings').select('navigation').eq('id', 1).single();
      if (!error && data?.navigation && Array.isArray(data.navigation)) {
        return data.navigation;
      }
    } catch (err) {
      console.error('Error fetching navigation from Supabase:', err);
    }
  }
  return getLocalData().navigation || initialNavigation;
}

export async function updateServerNavigation(navigation: NavItem[]): Promise<NavItem[]> {
  const data = getLocalData();
  data.navigation = navigation;
  saveLocalData(data);

  const supabase = getAdminSupabase();
  if (supabase) {
    try {
      const { error } = await supabase.from('store_settings').upsert({
        id: 1,
        navigation,
        updated_at: new Date().toISOString(),
      });
      if (error) {
        console.error('Supabase navigation update error:', error);
        throw new Error(`Database error updating navigation: ${error.message}`);
      }
      return await getServerNavigation();
    } catch (err: any) {
      console.error('Error updating navigation in Supabase:', err);
      throw err;
    }
  }
  return data.navigation;
}

// --- Customer Reviews ---
export async function getServerReviews(): Promise<CustomerReview[]> {
  const supabase = getAdminSupabase();
  if (supabase) {
    try {
      await ensureSupabaseSeeded(supabase);
      const { data, error } = await supabase.from('store_settings').select('reviews').eq('id', 1).single();
      if (!error && data?.reviews && Array.isArray(data.reviews)) {
        return data.reviews;
      }
    } catch (err) {
      console.error('Error fetching reviews from Supabase:', err);
    }
  }
  return getLocalData().reviews || initialReviews;
}

export async function updateServerReviews(reviews: CustomerReview[]): Promise<CustomerReview[]> {
  const data = getLocalData();
  data.reviews = reviews;
  saveLocalData(data);

  const supabase = getAdminSupabase();
  if (supabase) {
    try {
      const { error } = await supabase.from('store_settings').upsert({
        id: 1,
        reviews,
        updated_at: new Date().toISOString(),
      });
      if (error) {
        console.error('Supabase reviews update error:', error);
        throw new Error(`Database error updating reviews: ${error.message}`);
      }
      return await getServerReviews();
    } catch (err: any) {
      console.error('Error updating reviews in Supabase:', err);
      throw err;
    }
  }
  return data.reviews;
}

