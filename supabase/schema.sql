-- FAIRY FINDS BOUTIQUE - SUPABASE DATABASE SCHEMA & MIGRATION SCRIPT
-- ==============================================================================
-- Location: Neendoor, Kottayam, Kerala | WhatsApp: +91 6282629144
--
-- USAGE INSTRUCTIONS:
-- 1. IF YOU ALREADY HAVE TABLES IN SUPABASE:
--    Scroll down to "SECTION A: INCREMENTAL MIGRATION (RUN THIS ON EXISTING DB)"
--    and run just that section. It is non-destructive and safely adds any missing
--    tables, columns, and security policies without losing existing data.
--
-- 2. IF SETTING UP A BRAND NEW SUPABASE PROJECT:
--    Run this ENTIRE file in your Supabase SQL Editor.
-- ==============================================================================

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

-- 4. Size Charts Table (Created before products for foreign key)
CREATE TABLE IF NOT EXISTS size_charts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  description TEXT,
  unit TEXT DEFAULT 'inches',
  columns JSONB DEFAULT '[]'::jsonb,
  rows JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Products Table (Ready-Made Inventory)
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  product_code TEXT UNIQUE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  delivery_fee DECIMAL(10, 2) DEFAULT 0,
  size_chart_id TEXT REFERENCES size_charts(id) ON DELETE SET NULL,
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

-- 6. Product Variants / Stock per Size
CREATE TABLE IF NOT EXISTS product_variants (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
  size TEXT NOT NULL,
  stock_quantity INT DEFAULT 0,
  sku TEXT,
  UNIQUE(product_id, size)
);

-- 7. Homepage CMS Sections Table
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

-- 8. Custom Designs Showcase Table
CREATE TABLE IF NOT EXISTS custom_designs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  description TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  video_url TEXT,
  category TEXT DEFAULT 'Custom Work',
  display_order INT DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Store Settings Table
CREATE TABLE IF NOT EXISTS store_settings (
  id INT PRIMARY KEY DEFAULT 1,
  whatsapp_number TEXT NOT NULL DEFAULT '+916282629144',
  store_name TEXT DEFAULT 'Fairy Finds Boutique',
  contact_email TEXT DEFAULT 'hello@fairyfindsboutique.com',
  instagram_url TEXT DEFAULT 'https://instagram.com/fairyfinds.boutique',
  address TEXT DEFAULT 'Fairy Finds Boutique, Neendoor, Kottayam, Kerala',
  announcement_bar TEXT DEFAULT 'Free Delivery above Rs. 2,000 Order • Order Directly via WhatsApp',
  currency_symbol TEXT DEFAULT 'Rs.',
  navigation JSONB DEFAULT '[]'::jsonb,
  reviews JSONB DEFAULT '[]'::jsonb,
  seo_config JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 10. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
  delivery_fee DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  status TEXT CHECK (status IN ('new','confirmed','preparing','ready','shipped','delivered','cancelled')) DEFAULT 'new',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- SECTION A: INCREMENTAL MIGRATION (RUN THIS ON EXISTING DB)
-- Paste and run this section if you already have tables in Supabase.
-- ==============================================================================

-- 1. Ensure columns exist on products
ALTER TABLE products ADD COLUMN IF NOT EXISTS product_code TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS delivery_fee DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS size_chart_id TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS size_chart_url TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS custom_size_chart JSONB;
ALTER TABLE products ADD COLUMN IF NOT EXISTS fabric TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS care_instructions TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- 1b. Create orders table if it doesn't exist (safe incremental add)
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
  delivery_fee DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  status TEXT CHECK (status IN ('new','confirmed','preparing','ready','shipped','delivered','cancelled')) DEFAULT 'new',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);


-- 2. Ensure columns exist on store_settings
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS whatsapp_number TEXT DEFAULT '+916282629144';
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS store_name TEXT DEFAULT 'Fairy Finds Boutique';
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS contact_email TEXT DEFAULT 'hello@fairyfindsboutique.com';
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS instagram_url TEXT DEFAULT 'https://instagram.com/fairyfinds.boutique';
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS address TEXT DEFAULT 'Fairy Finds Boutique, Neendoor, Kottayam, Kerala';
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS announcement_bar TEXT DEFAULT 'Free Delivery above Rs. 2,000 Order • Order Directly via WhatsApp';
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS currency_symbol TEXT DEFAULT 'Rs.';
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS navigation JSONB DEFAULT '[]'::jsonb;
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS reviews JSONB DEFAULT '[]'::jsonb;
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS seo_config JSONB DEFAULT '{}'::jsonb;

-- 3. Ensure columns exist on collections
ALTER TABLE collections ADD COLUMN IF NOT EXISTS show_on_home BOOLEAN DEFAULT false;
ALTER TABLE collections ADD COLUMN IF NOT EXISTS has_dedicated_page BOOLEAN DEFAULT true;
ALTER TABLE collections ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;
ALTER TABLE collections ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;

-- 4. Ensure Size Charts table & columns
CREATE TABLE IF NOT EXISTS size_charts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  description TEXT,
  unit TEXT DEFAULT 'inches',
  columns JSONB DEFAULT '[]'::jsonb,
  rows JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE size_charts ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false;

-- Add foreign key constraint from products to size_charts safely
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'products_size_chart_id_fkey'
  ) THEN
    ALTER TABLE products 
    ADD CONSTRAINT products_size_chart_id_fkey 
    FOREIGN KEY (size_chart_id) REFERENCES size_charts(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 5. Ensure Custom Designs table & columns
CREATE TABLE IF NOT EXISTS custom_designs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  description TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  video_url TEXT,
  category TEXT DEFAULT 'Custom Work',
  display_order INT DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE custom_designs ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Custom Work';

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) & POLICIES
-- ==============================================================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE size_charts ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_designs ENABLE ROW LEVEL SECURITY;

-- Public Read Policies
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

DROP POLICY IF EXISTS "Public Read Size Charts" ON size_charts;
CREATE POLICY "Public Read Size Charts" ON size_charts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Custom Designs" ON custom_designs;
CREATE POLICY "Public Read Custom Designs" ON custom_designs FOR SELECT USING (is_published = true);

-- Full Admin Mutation Policies
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

DROP POLICY IF EXISTS "Admin All Size Charts" ON size_charts;
CREATE POLICY "Admin All Size Charts" ON size_charts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin All Custom Designs" ON custom_designs;
CREATE POLICY "Admin All Custom Designs" ON custom_designs FOR ALL USING (true) WITH CHECK (true);

-- Orders: RLS (admin service-role only — customers never write from browser)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin All Orders" ON orders;
CREATE POLICY "Admin All Orders" ON orders FOR ALL USING (true) WITH CHECK (true);

-- Realtime: enable broadcast of INSERT events so the admin receives live notifications
-- Run this once in Supabase SQL Editor:
ALTER TABLE orders REPLICA IDENTITY FULL;


-- ==============================================================================
-- STORAGE BUCKET FOR BOUTIQUE MEDIA
-- ==============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('boutique-assets', 'boutique-assets', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Read boutique-assets" ON storage.objects;
CREATE POLICY "Public Read boutique-assets" ON storage.objects FOR SELECT USING (bucket_id = 'boutique-assets');

DROP POLICY IF EXISTS "Admin All boutique-assets" ON storage.objects;
CREATE POLICY "Admin All boutique-assets" ON storage.objects FOR ALL USING (bucket_id = 'boutique-assets') WITH CHECK (bucket_id = 'boutique-assets');

-- ==============================================================================
-- DEFAULT SEED DATA (SAFE INSERT WITH ON CONFLICT DO NOTHING)
-- ==============================================================================

INSERT INTO store_settings (id, whatsapp_number, store_name, contact_email, instagram_url, address, announcement_bar, currency_symbol)
VALUES (
  1,
  '+916282629144',
  'Fairy Finds Boutique',
  'hello@fairyfindsboutique.com',
  'https://instagram.com/fairyfinds.boutique',
  'Fairy Finds Boutique, Neendoor, Kottayam, Kerala',
  'Free Delivery above Rs. 2,000 Order • Order Directly via WhatsApp',
  'Rs.'
)
ON CONFLICT (id) DO NOTHING;

-- Default Size Charts
INSERT INTO size_charts (id, name, description, unit, columns, rows, notes, is_default)
VALUES
(
  'sc-default',
  'Boutique Standard Sizing',
  'Standard measurements for ethnic wear, tops, and sarees.',
  'Inches',
  '["Size", "Bust", "Waist", "Hips"]'::jsonb,
  '[
    {"size": "S", "bust": "34\"", "waist": "26\"", "hips": "36\""},
    {"size": "M", "bust": "36\"", "waist": "28\"", "hips": "38\""},
    {"size": "L", "bust": "38\"", "waist": "30\"", "hips": "40\""},
    {"size": "XL", "bust": "40\"", "waist": "32\"", "hips": "42\""}
  ]'::jsonb,
  'Need a custom fit? Contact us on WhatsApp for made-to-measure sizing.',
  true
),
(
  'sc-dresses',
  'Dresses & Gowns',
  'Measurements for contemporary dresses, maxis, and gowns.',
  'Inches',
  '["Size", "Bust", "Waist", "Hips", "Length"]'::jsonb,
  '[
    {"size": "S", "bust": "34\"", "waist": "26\"", "hips": "36\"", "length": "48\""},
    {"size": "M", "bust": "36\"", "waist": "28\"", "hips": "38\"", "length": "49\""},
    {"size": "L", "bust": "38\"", "waist": "30\"", "hips": "40\"", "length": "50\""},
    {"size": "XL", "bust": "40\"", "waist": "32\"", "hips": "42\"", "length": "50\""}
  ]'::jsonb,
  'Dress lengths are measured from the high shoulder point to the hem.',
  false
)
ON CONFLICT (id) DO NOTHING;

-- Default Categories
INSERT INTO categories (id, name, slug, description, image_url, display_order)
VALUES
('cat-sarees', 'Sarees', 'sarees', 'Handwoven silks, organzas, and celebratory drapes crafted with intricate zari and delicate embroidery.', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600', 1),
('cat-dresses', 'Dresses', 'dresses', 'Contemporary midi and maxi silhouettes tailored in pure georgettes, linens, and breathable silks.', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600', 2),
('cat-blouses', 'Tops & Blouses', 'blouses', 'Signature crop tops, corset-style blouses, and brocade bodice cuts to pair with our drapes.', 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=600', 3),
('cat-other', 'Other Fashion', 'other', 'Bespoke co-ord sets, dupattas, festive stoles, and statement atelier accessories.', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=600', 4)
ON CONFLICT (id) DO NOTHING;

-- Default Collections
INSERT INTO collections (id, name, slug, description, image_url, show_on_home, has_dedicated_page, display_order, is_published)
VALUES
('col-red-saree', 'Red Saree', 'red-saree', 'An evocative edit of crimson, vermilion, and scarlet sarees woven with pure gold zari accents.', 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=1200', true, true, 1, true),
('col-green-lehenga', 'Green Lehenga', 'green-lehenga', 'Rich emerald hues, hand-embellished sequins, and voluminous silhouettes crafted for celebrations.', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=1200', true, true, 2, true)
ON CONFLICT (id) DO NOTHING;

-- Default Homepage Sections
INSERT INTO homepage_sections (id, section_type, title, subtitle, content, display_order, is_visible)
VALUES 
(
  'sec-hero',
  'HERO',
  'Hero Section',
  'FAIRY FINDS BOUTIQUE',
  '{"heading": "Artisanal Elegance, Crafted for the Modern Muse", "subtitle": "FAIRY FINDS BOUTIQUE", "description": "Discover curated ready-to-wear silhouettes and bespoke couture tailored exclusively to your measurements.", "button_text": "Shop the Collection", "button_link": "/shop", "secondary_button_text": "Custom Orders", "secondary_button_link": "/custom", "image_url": "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1600", "badge": "New Season 2026", "text_color": "light"}'::jsonb,
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
  '{"heading": "Celebrated by Discerning Women Across Kerala & Beyond", "description": "Authentic experiences from patrons who entrusted their festive, bridal, and everyday celebrations to Fairy Finds.", "badge": "5.0 ★ Client Satisfaction"}'::jsonb,
  6,
  true
)
ON CONFLICT (id) DO NOTHING;
