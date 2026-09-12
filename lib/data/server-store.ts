import fs from 'fs';
import path from 'path';
import { Category, Collection, CustomerReview, HomepageSection, NavItem, Product, StoreSettings } from '../types';
import { initialCategories, initialCollections, initialNavigation, initialProducts, initialReviews, initialSections, initialSettings } from './initial-data';
import { createClient } from '../supabase/client';

const DATA_FILE = path.join(process.cwd(), 'data', 'store.json');

interface StoreData {
  settings: StoreSettings;
  navigation?: NavItem[];
  categories: Category[];
  collections: Collection[];
  products: Product[];
  sections: HomepageSection[];
  reviews?: CustomerReview[];
}

function getLocalData(): StoreData {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (!parsed.navigation) {
        parsed.navigation = initialNavigation;
      }
      if (!parsed.reviews) {
        parsed.reviews = initialReviews;
      }
      return parsed;
    }
  } catch (err) {
    console.error('Error reading data/store.json:', err);
  }

  return {
    settings: initialSettings,
    navigation: initialNavigation,
    categories: initialCategories,
    collections: initialCollections,
    products: initialProducts,
    sections: initialSections,
    reviews: initialReviews,
  };
}

function saveLocalData(data: StoreData): void {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing data/store.json:', err);
  }
}

// --- Settings ---
export async function getServerSettings(): Promise<StoreSettings> {
  const supabase = createClient();
  if (supabase) {
    try {
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
        };
      }
    } catch {}
  }
  return getLocalData().settings;
}

export async function updateServerSettings(settings: Partial<StoreSettings>): Promise<StoreSettings> {
  const supabase = createClient();
  if (supabase) {
    try {
      await supabase.from('store_settings').update(settings).eq('id', 1);
    } catch {}
  }

  const data = getLocalData();
  data.settings = { ...data.settings, ...settings };
  saveLocalData(data);
  return data.settings;
}

// --- Products ---
export async function getServerProducts(): Promise<Product[]> {
  const supabase = createClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, variants:product_variants(*), categories(name), collections(name)')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((item: any) => ({
          ...item,
          category_name: item.categories?.name,
          collection_name: item.collections?.name,
          variants: item.variants || [],
        }));
      }
    } catch {}
  }
  return getLocalData().products;
}

export async function getServerProductBySlug(slug: string): Promise<Product | null> {
  const products = await getServerProducts();
  return products.find((p) => p.slug === slug || p.id === slug) || null;
}

export async function saveServerProduct(product: Partial<Product>): Promise<Product> {
  const isNew = !product.id;
  const id = isNew ? `prod-${Date.now()}` : product.id!;
  const data = getLocalData();

  let assignedCode = (product.product_code || '').trim().toUpperCase();
  if (!assignedCode) {
    const existingCodes = new Set(
      data.products.map((p) => (p.product_code || '').trim().toUpperCase())
    );
    for (let i = 1; i <= 999; i++) {
      const candidate = `FF-PRD-${String(i).padStart(3, '0')}`;
      if (!existingCodes.has(candidate)) {
        assignedCode = candidate;
        break;
      }
    }
    if (!assignedCode) {
      assignedCode = `FF-PRD-${Math.floor(100 + Math.random() * 900)}`;
    }
  }

  const newProduct: Product = {
    id,
    product_code: assignedCode,
    name: product.name || 'Untitled Product',
    slug: product.slug || (product.name ? product.name.toLowerCase().replace(/\s+/g, '-') : id),
    description: product.description || '',
    price: product.price || 0,
    product_type: 'READY_MADE',
    category_id: product.category_id,
    category_name: product.category_name,
    collection_id: product.collection_id,
    collection_name: product.collection_name,
    images: product.images && product.images.length > 0 ? product.images : [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=1000'
    ],
    fabric: product.fabric,
    care_instructions: product.care_instructions,
    is_published: product.is_published ?? true,
    is_featured: product.is_featured ?? false,
    variants: product.variants || [
      { id: `v-${id}-s`, product_id: id, size: 'S', stock_quantity: 2 },
      { id: `v-${id}-m`, product_id: id, size: 'M', stock_quantity: 3 },
      { id: `v-${id}-l`, product_id: id, size: 'L', stock_quantity: 1 },
    ],
  };

  if (isNew) {
    data.products.unshift(newProduct);
  } else {
    data.products = data.products.map((p) => (p.id === id ? newProduct : p));
  }
  saveLocalData(data);

  const supabase = createClient();
  if (supabase) {
    try {
      await supabase.from('products').upsert({
        id: newProduct.id,
        name: newProduct.name,
        slug: newProduct.slug,
        product_code: newProduct.product_code,
        price: newProduct.price,
        description: newProduct.description,
        category_id: newProduct.category_id,
        collection_id: newProduct.collection_id,
        images: newProduct.images,
        fabric: newProduct.fabric,
        care_instructions: newProduct.care_instructions,
        is_published: newProduct.is_published,
      });
    } catch {}
  }

  return newProduct;
}

export async function deleteServerProduct(id: string): Promise<boolean> {
  const data = getLocalData();
  data.products = data.products.filter((p) => p.id !== id);
  saveLocalData(data);

  const supabase = createClient();
  if (supabase) {
    try {
      await supabase.from('products').delete().eq('id', id);
    } catch {}
  }
  return true;
}

// --- Categories & Collections ---
export async function getServerCategories(): Promise<Category[]> {
  const supabase = createClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('categories').select('*').order('display_order');
      if (!error && data && data.length > 0) return data;
    } catch {}
  }
  return getLocalData().categories;
}

export async function getServerCollections(): Promise<Collection[]> {
  const supabase = createClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('collections').select('*').order('display_order');
      if (!error && data && data.length > 0) return data;
    } catch {}
  }
  return getLocalData().collections;
}

export async function getServerCollectionBySlug(slug: string): Promise<Collection | null> {
  const collections = await getServerCollections();
  return collections.find((c) => c.slug === slug || c.id === slug) || null;
}

export async function saveServerCollection(collection: Partial<Collection>): Promise<Collection> {
  const isNew = !collection.id;
  const id = isNew ? `col-${Date.now()}` : collection.id!;
  const newCol: Collection = {
    id,
    name: collection.name || 'New Collection',
    slug: collection.slug || id,
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
    // Keep product collection_name in sync if collection name changed
    data.products = data.products.map((p) => {
      if (p.collection_id === id) {
        return { ...p, collection_name: newCol.name };
      }
      return p;
    });
  }
  saveLocalData(data);
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
  return true;
}

// --- Sections ---
export async function getServerHomepageSections(): Promise<HomepageSection[]> {
  const supabase = createClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('homepage_sections').select('*').order('display_order');
      if (!error && data && data.length > 0) return data;
    } catch {}
  }
  return getLocalData().sections.sort((a, b) => a.display_order - b.display_order);
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
  return data.sections;
}

export async function toggleServerSectionVisibility(id: string, is_visible: boolean): Promise<HomepageSection[]> {
  const data = getLocalData();
  data.sections = data.sections.map((s) => (s.id === id ? { ...s, is_visible } : s));
  saveLocalData(data);
  return data.sections;
}

export async function updateServerSectionContent(id: string, content: any): Promise<HomepageSection[]> {
  const data = getLocalData();
  data.sections = data.sections.map((s) => {
    if (s.id === id) {
      const { subtitle, ...restContent } = content;
      return {
        ...s,
        subtitle: subtitle !== undefined ? subtitle : s.subtitle,
        content: { ...s.content, ...restContent },
      };
    }
    return s;
  });
  saveLocalData(data);
  return data.sections;
}

// --- Navigation ---
export async function getServerNavigation(): Promise<NavItem[]> {
  return getLocalData().navigation || initialNavigation;
}

export async function updateServerNavigation(navigation: NavItem[]): Promise<NavItem[]> {
  const data = getLocalData();
  data.navigation = navigation;
  saveLocalData(data);
  return data.navigation;
}

// --- Customer Reviews ---
export async function getServerReviews(): Promise<CustomerReview[]> {
  return getLocalData().reviews || initialReviews;
}

export async function updateServerReviews(reviews: CustomerReview[]): Promise<CustomerReview[]> {
  const data = getLocalData();
  data.reviews = reviews;
  saveLocalData(data);
  return data.reviews;
}

