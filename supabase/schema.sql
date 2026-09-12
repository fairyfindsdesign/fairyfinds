-- FAIRY FINDS BOUTIQUE - SUPABASE DATABASE SCHEMA & SEED SCRIPT
-- Paste this script into Supabase SQL Editor to set up your database tables and initial boutique data.

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Collections Table
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_code TEXT UNIQUE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  product_type TEXT CHECK (product_type IN ('READY_MADE')) DEFAULT 'READY_MADE',
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  collection_id UUID REFERENCES collections(id) ON DELETE SET NULL,
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
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  size TEXT NOT NULL,
  stock_quantity INT DEFAULT 0,
  sku TEXT,
  UNIQUE(product_id, size)
);

-- 6. Homepage CMS Sections Table
CREATE TABLE IF NOT EXISTS homepage_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  updated_at TIMESTAMPTZ DEFAULT now()
);

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

-- Public Read Policies
CREATE POLICY "Public Read Categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public Read Collections" ON collections FOR SELECT USING (true);
CREATE POLICY "Public Read Products" ON products FOR SELECT USING (is_published = true);
CREATE POLICY "Public Read Product Variants" ON product_variants FOR SELECT USING (true);
CREATE POLICY "Public Read Homepage Sections" ON homepage_sections FOR SELECT USING (true);
CREATE POLICY "Public Read Store Settings" ON store_settings FOR SELECT USING (true);

-- Authenticated Admin Full Access Policies
CREATE POLICY "Admin All Categories" ON categories FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin All Collections" ON collections FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin All Products" ON products FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin All Variants" ON product_variants FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin All Homepage Sections" ON homepage_sections FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin All Store Settings" ON store_settings FOR ALL TO authenticated USING (true);
