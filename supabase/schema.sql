-- FAIRY FINDS BOUTIQUE - SUPABASE DATABASE SCHEMA & SETUP SCRIPT
-- Paste this entire script into your Supabase SQL Editor and click "Run".
--
-- NOTE: If you previously created tables with UUID errors and want a 100% clean reset,
-- you can uncomment and run this line FIRST:
-- DROP TABLE IF EXISTS product_variants, products, collections, categories, homepage_sections CASCADE;

-- 1. Enable UUID extension for default ID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Collections Table
CREATE TABLE IF NOT EXISTS collections (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  show_on_home BOOLEAN DEFAULT false,
  has_dedicated_page BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Products Table (Ready-Made Inventory)
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  product_code TEXT UNIQUE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  product_type TEXT CHECK (product_type IN ('READY_MADE')) DEFAULT 'READY_MADE',
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  collection_id TEXT REFERENCES collections(id) ON DELETE SET NULL,
  images JSONB DEFAULT '[]'::jsonb,
  size_chart_url TEXT,
  fabric TEXT,
  care_instructions TEXT,
  is_published BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Product Variants / Stock per Size
CREATE TABLE IF NOT EXISTS product_variants (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
  size TEXT NOT NULL,
  stock_quantity INT DEFAULT 0,
  sku TEXT,
  UNIQUE(product_id, size)
);

-- 6. Homepage CMS Sections Table
CREATE TABLE IF NOT EXISTS homepage_sections (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  section_type TEXT NOT NULL,
  title TEXT,
  subtitle TEXT,
  content JSONB DEFAULT '{}'::jsonb,
  display_order INT DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Store Settings Table
CREATE TABLE IF NOT EXISTS store_settings (
  id INT PRIMARY KEY DEFAULT 1,
  whatsapp_number TEXT NOT NULL DEFAULT '+94771234567',
  store_name TEXT DEFAULT 'Fairy Finds Boutique',
  contact_email TEXT DEFAULT 'hello@fairyfindsboutique.com',
  instagram_url TEXT DEFAULT 'https://instagram.com/fairyfinds',
  address TEXT DEFAULT 'Boutique Atelier, Colombo, Sri Lanka',
  announcement_bar TEXT DEFAULT 'Complimentary Styling Consultation • Direct Orders & Custom Fitting via WhatsApp',
  currency_symbol TEXT DEFAULT 'Rs.',
  navigation JSONB DEFAULT '[]'::jsonb,
  reviews JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Safe migration from UUID to TEXT if tables were previously created with UUID
DO $$ 
DECLARE
  r RECORD;
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'id' AND data_type = 'uuid'
  ) THEN
    -- Drop all existing foreign keys referencing products, categories, collections
    FOR r IN (
      SELECT conname, relname 
      FROM pg_constraint c 
      JOIN pg_class cl ON cl.oid = c.conrelid 
      WHERE c.contype = 'f' 
        AND cl.relname IN ('products', 'product_variants')
    ) LOOP
      EXECUTE 'ALTER TABLE ' || quote_ident(r.relname) || ' DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname);
    END LOOP;

    -- Drop column defaults first so Postgres doesn't block changing UUID to TEXT
    ALTER TABLE categories ALTER COLUMN id DROP DEFAULT;
    ALTER TABLE collections ALTER COLUMN id DROP DEFAULT;
    ALTER TABLE products ALTER COLUMN id DROP DEFAULT;
    ALTER TABLE product_variants ALTER COLUMN id DROP DEFAULT;
    ALTER TABLE homepage_sections ALTER COLUMN id DROP DEFAULT;

    -- Alter column types to TEXT
    ALTER TABLE categories ALTER COLUMN id TYPE TEXT USING id::text;
    ALTER TABLE categories ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

    ALTER TABLE collections ALTER COLUMN id TYPE TEXT USING id::text;
    ALTER TABLE collections ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

    ALTER TABLE products ALTER COLUMN id TYPE TEXT USING id::text;
    ALTER TABLE products ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
    ALTER TABLE products ALTER COLUMN category_id TYPE TEXT USING category_id::text;
    ALTER TABLE products ALTER COLUMN collection_id TYPE TEXT USING collection_id::text;

    ALTER TABLE product_variants ALTER COLUMN id TYPE TEXT USING id::text;
    ALTER TABLE product_variants ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
    ALTER TABLE product_variants ALTER COLUMN product_id TYPE TEXT USING product_id::text;

    ALTER TABLE homepage_sections ALTER COLUMN id TYPE TEXT USING id::text;
    ALTER TABLE homepage_sections ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

    -- Re-attach foreign keys with ON DELETE SET NULL / CASCADE
    ALTER TABLE products ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;
    ALTER TABLE products ADD CONSTRAINT products_collection_id_fkey FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE SET NULL;
    ALTER TABLE product_variants ADD CONSTRAINT product_variants_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Ensure columns exist if tables were created previously
ALTER TABLE products ADD COLUMN IF NOT EXISTS product_code TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS size_chart_url TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS fabric TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS care_instructions TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS navigation JSONB DEFAULT '[]'::jsonb;
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS reviews JSONB DEFAULT '[]'::jsonb;
ALTER TABLE collections ADD COLUMN IF NOT EXISTS show_on_home BOOLEAN DEFAULT false;
ALTER TABLE collections ADD COLUMN IF NOT EXISTS has_dedicated_page BOOLEAN DEFAULT true;
ALTER TABLE collections ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;
ALTER TABLE collections ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;
ALTER TABLE collections ADD COLUMN IF NOT EXISTS has_dedicated_page BOOLEAN DEFAULT true;
ALTER TABLE collections ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;
ALTER TABLE collections ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;

-- Insert Default Settings
INSERT INTO store_settings (id, whatsapp_number, store_name, announcement_bar)
VALUES (1, '+94771234567', 'Fairy Finds Boutique', 'Complimentary Styling Consultation • Direct Orders & Custom Fitting via WhatsApp')
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Public Read Policies (Safely replace if existing)
DROP POLICY IF EXISTS "Public Read Categories" ON categories;
CREATE POLICY "Public Read Categories" ON categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Collections" ON collections;
CREATE POLICY "Public Read Collections" ON collections FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Products" ON products;
CREATE POLICY "Public Read Products" ON products FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Public Read Product Variants" ON product_variants;
CREATE POLICY "Public Read Product Variants" ON product_variants FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Homepage Sections" ON homepage_sections;
CREATE POLICY "Public Read Homepage Sections" ON homepage_sections FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Store Settings" ON store_settings;
CREATE POLICY "Public Read Store Settings" ON store_settings FOR SELECT USING (true);

-- Full CMS Admin Mutation Policies (Safely replace if existing)
DROP POLICY IF EXISTS "Admin All Categories" ON categories;
CREATE POLICY "Admin All Categories" ON categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin All Collections" ON collections;
CREATE POLICY "Admin All Collections" ON collections FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin All Products" ON products;
CREATE POLICY "Admin All Products" ON products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin All Variants" ON product_variants;
CREATE POLICY "Admin All Variants" ON product_variants FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin All Homepage Sections" ON homepage_sections;
CREATE POLICY "Admin All Homepage Sections" ON homepage_sections FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin All Store Settings" ON store_settings;
CREATE POLICY "Admin All Store Settings" ON store_settings FOR ALL USING (true) WITH CHECK (true);

-- 8. Storage Bucket for Boutique Assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('boutique-assets', 'boutique-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
DROP POLICY IF EXISTS "Public Read boutique-assets" ON storage.objects;
CREATE POLICY "Public Read boutique-assets" ON storage.objects FOR SELECT USING (bucket_id = 'boutique-assets');

DROP POLICY IF EXISTS "Admin All boutique-assets" ON storage.objects;
CREATE POLICY "Admin All boutique-assets" ON storage.objects FOR ALL USING (bucket_id = 'boutique-assets') WITH CHECK (bucket_id = 'boutique-assets');

-- 9. Insert Default Categories
INSERT INTO categories (id, name, slug, description, image_url, display_order)
VALUES
('cat-sarees', 'Sarees', 'sarees', 'Handwoven silks, organzas, and celebratory drapes crafted with intricate zari and delicate embroidery.', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600', 1),
('cat-dresses', 'Dresses', 'dresses', 'Contemporary midi and maxi silhouettes tailored in pure georgettes, linens, and breathable silks.', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600', 2),
('cat-blouses', 'Tops & Blouses', 'blouses', 'Signature crop tops, corset-style blouses, and brocade bodice cuts to pair with our drapes.', 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=600', 3),
('cat-other', 'Other Fashion', 'other', 'Bespoke co-ord sets, dupattas, festive stoles, and statement atelier accessories.', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=600', 4)
ON CONFLICT (id) DO NOTHING;

-- 10. Insert Default Collections
INSERT INTO collections (id, name, slug, description, image_url, show_on_home, has_dedicated_page, display_order, is_published)
VALUES
('col-red-saree', 'Red Saree', 'red-saree', 'An evocative edit of crimson, vermilion, and scarlet sarees woven with pure gold zari accents.', 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=1200', true, true, 1, true),
('col-green-lehenga', 'Green Lehenga', 'green-lehenga', 'Rich emerald hues, hand-embellished sequins, and voluminous silhouettes crafted for celebrations.', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=1200', true, true, 2, true)
ON CONFLICT (id) DO NOTHING;

-- 11. Insert Default Homepage Sections
INSERT INTO homepage_sections (id, section_type, title, subtitle, content, display_order, is_visible)
VALUES 
(
  'sec-hero',
  'HERO',
  'Hero Section',
  'FAIRY FINDS BOUTIQUE',
  '{"heading": "Artisanal Elegance, Crafted for the Modern Muse", "subtitle": "FAIRY FINDS BOUTIQUE", "description": "Discover curated ready-to-wear silhouettes and bespoke couture tailored exclusively to your measurements.", "button_text": "Explore Collection", "button_link": "/shop", "image_url": "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1600", "badge": "New Season 2026"}'::jsonb,
  1,
  true
),
(
  'sec-new-arrivals',
  'PRODUCT_COLLECTION',
  'New Arrivals',
  'THE LATEST EDIT',
  '{"heading": "Fresh Additions to the Atelier", "description": "Handcrafted garments in limited batches, available for immediate WhatsApp ordering.", "product_limit": 4, "button_text": "View All Products", "button_link": "/shop"}'::jsonb,
  2,
  true
),
(
  'sec-featured-collection',
  'FEATURED_COLLECTIONS',
  'Featured Collection',
  'SIGNATURE EDIT',
  '{"heading": "The Red Saree Collection", "description": "An ode to timeless grace. Rich silk textures, delicate weaves, and hand-finished borders designed to turn every celebration into an unforgettable memory.", "button_text": "Explore Red Saree", "button_link": "/collections/red-saree", "image_url": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1600"}'::jsonb,
  3,
  true
),
(
  'sec-categories',
  'CATEGORY_CARDS',
  'Shop by Category',
  'CURATED PIECES',
  '{"heading": "Explore Our Categories", "description": "Select your preferred style from sarees, dresses, blouses, and festive sets."}'::jsonb,
  4,
  true
),
(
  'sec-custom-made',
  'CUSTOM_MADE',
  'Custom-Made Orders',
  'BESPOKE TAILORING',
  '{"heading": "Bring Your Dream Outfit to Life", "description": "Looking for a custom cut, specific fabric, or made-to-measure bridal drape? Work directly with our designer through WhatsApp to create a one-of-a-kind garment.", "button_text": "Start Your Custom Order", "button_link": "/custom", "image_url": "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=1200"}'::jsonb,
  5,
  true
),
(
  'sec-reviews',
  'REVIEWS',
  'Client Love & Testimonials',
  'CLIENT LOVE & TESTIMONIALS',
  '{"heading": "Celebrated by Discerning Women Across Sri Lanka", "description": "Authentic experiences from patrons who entrusted their festive, bridal, and everyday celebrations to Fairy Finds.", "badge": "5.0 ★ Client Satisfaction"}'::jsonb,
  6,
  true
)
ON CONFLICT (id) DO NOTHING;

